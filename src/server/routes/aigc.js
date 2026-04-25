import express from 'express';
import { createAIResult, getAIResult, getAIResultsByScriptId, deleteAIResult } from '../services/aigcService.js';
import { loadAIResults } from '../services/dataStore.js';

const router = express.Router();

/**
 * POST /api/ai/generate
 * Start an AI generation task (image or video)
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('[AI Generate] Request body:', req.body);
    const { scriptId, type, mode, provider = 'seedance', prompt, personaImages, personaId } = req.body;

    if (!type || !['image', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be "image" or "video"'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    console.log('[AI Generate] Calling createAIResult with:', { scriptId, type, provider, mode, prompt: prompt?.substring(0, 50) });

    // Create AI result and start generation
    const result = await createAIResult({
      scriptId: scriptId || 'standalone',
      scriptTitle: 'Script',
      type,
      provider,
      mode: mode || 'cover',
      prompt,
      personaImages,
      personaId
    });

    console.log('[AI Generate] createAIResult returned:', result);

    res.json({
      success: true,
      data: {
        resultId: result.id,
        status: result.status
      }
    });
  } catch (error) {
    console.error('[AI Generate] Error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to start AI generation: ' + error.message
    });
  }
});

/**
 * GET /api/ai/results
 * Get AI results, optionally filtered by scriptId
 */
router.get('/results', (req, res) => {
  const { scriptId } = req.query;

  let results;
  if (scriptId) {
    results = getAIResultsByScriptId(scriptId);
  } else {
    results = loadAIResults();
  }

  // Sort by createdAt descending
  results = results.sort((a, b) => b.createdAt - a.createdAt);

  res.json({
    success: true,
    data: results
  });
});

/**
 * GET /api/ai/results/:resultId
 * Get single AI result
 */
router.get('/results/:resultId', (req, res) => {
  const { resultId } = req.params;
  const result = getAIResult(resultId);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Result not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * DELETE /api/ai/results/:resultId
 * Delete an AI result
 */
router.delete('/results/:resultId', (req, res) => {
  const { resultId } = req.params;
  const deleted = deleteAIResult(resultId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Result not found'
    });
  }

  res.json({
    success: true,
    data: { resultId }
  });
});

// Legacy endpoints for backwards compatibility

/**
 * GET /api/ai/tasks/:taskId
 * Get task status (legacy - redirects to results)
 */
router.get('/tasks/:taskId', (req, res) => {
  const { taskId } = req.params;
  const result = getAIResult(taskId);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * GET /api/ai/tasks
 * List all tasks (legacy)
 */
router.get('/tasks', (req, res) => {
  const tasks = loadAIResults()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);

  res.json({
    success: true,
    data: tasks
  });
});

/**
 * POST /api/ai/tasks/:taskId/retry
 * Retry a failed task (legacy)
 */
router.post('/tasks/:taskId/retry', async (req, res) => {
  const { taskId } = req.params;
  const existingResult = getAIResult(taskId);

  if (!existingResult) {
    return res.status(404).json({
      success: false,
      error: 'Task not found'
    });
  }

  if (existingResult.status !== 'failed') {
    return res.status(400).json({
      success: false,
      error: 'Can only retry failed tasks'
    });
  }

  // Create a new result to retry
  const result = await createAIResult({
    scriptId: existingResult.scriptId,
    scriptTitle: existingResult.scriptTitle,
    type: existingResult.type,
    provider: existingResult.provider,
    mode: existingResult.mode,
    prompt: existingResult.prompt,
    personaImages: existingResult.personaImages
  });

  res.json({
    success: true,
    data: { resultId: result.id, status: 'pending' }
  });
});

export default router;
