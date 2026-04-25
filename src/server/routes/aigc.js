const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { generateImage, generateVideo } = require('../services/aigcService');

// In-memory task store (replace with database in production)
const taskStore = new Map();

/**
 * POST /api/ai/generate
 * Start an AI generation task (image or video)
 */
router.post('/generate', async (req, res) => {
  try {
    const { scriptId, type, mode, provider = 'dalle', persona, script } = req.body;

    if (!type || !['image', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "image" or "video"'
      });
    }

    const taskId = uuidv4();
    const prompt = buildPrompt(type, mode, { persona, script });

    const task = {
      id: taskId,
      scriptId,
      type,
      mode,
      provider,
      prompt,
      status: 'pending',
      progress: 0,
      output: null,
      error: null,
      createdAt: Date.now(),
      completedAt: null
    };

    taskStore.set(taskId, task);

    // Start async generation
    if (type === 'image') {
      startImageGeneration(task);
    } else {
      startVideoGeneration(task);
    }

    res.json({
      success: true,
      data: {
        taskId,
        status: 'pending',
        prompt
      }
    });
  } catch (error) {
    console.error('Error starting AI generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start AI generation'
    });
  }
});

/**
 * GET /api/ai/tasks/:taskId
 * Get task status
 */
router.get('/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = taskStore.get(taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: task
  });
});

/**
 * GET /api/ai/tasks
 * List all tasks
 */
router.get('/tasks', (req, res) => {
  const tasks = Array.from(taskStore.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);

  res.json({
    success: true,
    data: tasks
  });
});

/**
 * POST /api/ai/tasks/:taskId/retry
 * Retry a failed task
 */
router.post('/tasks/:taskId/retry', async (req, res) => {
  const { taskId } = req.params;
  const task = taskStore.get(taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  if (task.status !== 'failed') {
    return res.status(400).json({
      success: false,
      error: 'Can only retry failed tasks'
    });
  }

  task.status = 'pending';
  task.progress = 0;
  task.error = null;
  taskStore.set(taskId, task);

  if (task.type === 'image') {
    startImageGeneration(task);
  } else {
    startVideoGeneration(task);
  }

  res.json({
    success: true,
    data: { taskId, status: 'pending' }
  });
});

// Helper functions

function buildPrompt(type, mode, { persona, script }) {
  if (type === 'image') {
    if (mode === 'character' && persona) {
      return `Portrait of ${persona.name}.
Personality: ${persona.personality?.join(', ') || 'distinctive'}
Speaking style: ${persona.speakingStyle || 'unique'}
Style: Digital illustration, expressive, Chinese animation aesthetic.`;
    }

    if (script) {
      if (mode === 'cover') {
        return `Create cinematic cover for "${script.title || 'Untitled'}".
Scene: ${script.scene?.name || 'Drama'} - ${script.scene?.description || ''}
Characters: ${script.personaA?.name || 'Character A'} and ${script.personaB?.name || 'Character B'}
Style: Modern Chinese drama, high contrast, emotional atmosphere, cinematic lighting.`;
      }

      if (mode === 'storyboard') {
        const panels = (script.dialogues || []).map((d, i) =>
          `Panel ${i + 1}: [${d.speaker}] ${d.content}`
        ).join('\n');
        return `Create ${script.dialogues?.length || 6}-panel storyboard.
${panels}
Style: Comic book style, clear visual storytelling, Chinese aesthetic, dynamic composition.`;
      }
    }
  }

  if (type === 'video') {
    if (script) {
      return `Video scene: "${script.title || 'Untitled'}"
Scenario: ${script.scene?.description || ''}
Characters: ${script.personaA?.name || ''} and ${script.personaB?.name || ''}
Dialogue excerpt: "${script.dialogues?.[0]?.content || ''}"
Style: Short dramatic scene, Chinese cinema aesthetic, emotional depth.`;
    }
  }

  return 'Create an artistic image.';
}

async function startImageGeneration(task) {
  task.status = 'processing';
  task.progress = 0;
  taskStore.set(task.id, task);

  try {
    const result = await generateImage(task.prompt, task.provider);
    task.status = 'success';
    task.progress = 1;
    task.output = {
      resultUrl: result.url,
      thumbnails: result.url ? [result.url] : []
    };
    task.completedAt = Date.now();
  } catch (error) {
    task.status = 'failed';
    task.error = error.message;
  }
  taskStore.set(task.id, task);
}

async function startVideoGeneration(task) {
  task.status = 'processing';
  task.progress = 0;
  taskStore.set(task.id, task);

  try {
    const result = await generateVideo(task.prompt, task.provider);
    task.status = result.status === 'pending' ? 'processing' : 'success';
    task.progress = result.progress || 0.5;
    task.output = {
      resultUrl: result.url,
      thumbnails: result.thumbnails || []
    };
    if (result.status === 'completed') {
      task.completedAt = Date.now();
    }
  } catch (error) {
    task.status = 'failed';
    task.error = error.message;
  }
  taskStore.set(task.id, task);
}

module.exports = router;
