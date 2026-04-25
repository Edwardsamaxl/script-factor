import express from 'express';
import crypto from 'crypto';
import { generateScript } from '../services/scriptGenerator.js';
import { createSession, getSession } from '../services/sessionStore.js';
import { queueAndGenerate } from '../services/multiTurnGenerator.js';
import { callDeepSeekAWithSystem, callDeepSeekBWithSystem } from '../services/llm.js';

const router = express.Router();

/**
 * POST /api/scripts/generate-multi
 * Start multi-turn dialogue generation
 */
router.post('/generate-multi', async (req, res) => {
  try {
    const { personaA, personaB, scene, maxRounds } = req.body;

    // Validate required fields
    if (!personaA || !personaB || !scene) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: personaA, personaB, scene'
      });
    }

    // Validate persona structures
    if (!personaA.id || !personaA.name) {
      return res.status(400).json({
        success: false,
        error: 'personaA must have id and name'
      });
    }

    if (!personaB.id || !personaB.name) {
      return res.status(400).json({
        success: false,
        error: 'personaB must have id and name'
      });
    }

    // Validate scene structure
    if (!scene.id || !scene.name) {
      return res.status(400).json({
        success: false,
        error: 'scene must have id and name'
      });
    }

    // Validate maxRounds if provided
    const rounds = maxRounds ? parseInt(maxRounds, 10) : 10;
    if (isNaN(rounds) || rounds < 4 || rounds > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxRounds must be a number between 4 and 20'
      });
    }

    // Generate unique script ID
    const scriptId = crypto.randomUUID();

    // Create session
    createSession(scriptId);

    // Start generation in background (non-blocking)
    queueAndGenerate(scriptId, personaA, personaB, scene, rounds, () => {});

    res.json({
      scriptId,
      status: 'generating',
      progress: 0
    });
  } catch (error) {
    console.error('Error starting multi-turn generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start generation'
    });
  }
});

/**
 * GET /api/scripts/:id
 * Poll for script status
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const session = getSession(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Script not found'
      });
    }

    const response = {
      scriptId: session.id,
      status: session.status,
      progress: session.progress
    };

    if (session.status === 'completed') {
      response.result = {
        title: `Dialogue session`,
        dialogues: session.dialogues,
        totalLines: session.dialogues.length,
        wordCount: session.dialogues.reduce((sum, d) => sum + d.content.length, 0)
      };
    } else if (session.status === 'failed') {
      response.error = session.error;
    }

    res.json(response);
  } catch (error) {
    console.error('Error getting script status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get script status'
    });
  }
});

/**
 * GET /api/scripts/:id/stream
 * SSE stream for real-time updates
 */
router.get('/:id/stream', async (req, res) => {
  const { id } = req.params;

  // Check if session exists
  const session = getSession(id);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Script not found'
    });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection event
  res.write('event: connected\ndata: {}\n\n');

  // If already completed or failed, send final state immediately
  if (session.status === 'completed') {
    res.write(`event: done\ndata: ${JSON.stringify({
      scriptId: session.id,
      result: {
        title: `Dialogue session`,
        dialogues: session.dialogues,
        totalLines: session.dialogues.length,
        wordCount: session.dialogues.reduce((sum, d) => sum + d.content.length, 0)
      }
    })}\n\n`);
    res.end();
    return;
  }

  if (session.status === 'failed') {
    res.write(`event: error\ndata: ${JSON.stringify({ message: session.error })}\n\n`);
    res.end();
    return;
  }

  // Store progress already sent to avoid duplicates
  let lastProgress = 0;

  // Poll for updates and send SSE events
  const intervalId = setInterval(() => {
    const currentSession = getSession(id);

    if (!currentSession) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: 'Session not found' })}\n\n`);
      res.end();
      clearInterval(intervalId);
      return;
    }

    // Send progress updates
    if (currentSession.dialogues.length > lastProgress) {
      // Send new dialogues
      for (let i = lastProgress; i < currentSession.dialogues.length; i++) {
        res.write(`event: dialogue\ndata: ${JSON.stringify(currentSession.dialogues[i])}\n\n`);
      }
      lastProgress = currentSession.dialogues.length;

      // Send progress event
      res.write(`event: progress\ndata: ${JSON.stringify({
        round: currentSession.dialogues.length,
        total: 10
      })}\n\n`);
    }

    // Check if completed
    if (currentSession.status === 'completed') {
      res.write(`event: done\ndata: ${JSON.stringify({
        scriptId: currentSession.id,
        result: {
          title: `Dialogue session`,
          dialogues: currentSession.dialogues,
          totalLines: currentSession.dialogues.length,
          wordCount: currentSession.dialogues.reduce((sum, d) => sum + d.content.length, 0)
        }
      })}\n\n`);
      res.end();
      clearInterval(intervalId);
      return;
    }

    // Check if failed
    if (currentSession.status === 'failed') {
      res.write(`event: error\ndata: ${JSON.stringify({ message: currentSession.error })}\n\n`);
      res.end();
      clearInterval(intervalId);
      return;
    }
  }, 500);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

/**
 * POST /api/scripts/generate
 * Generate a script based on personas and scene
 */
router.post('/generate', async (req, res) => {
  try {
    const { personaA, personaB, scene, maxRounds } = req.body;

    // Validate required fields
    if (!personaA || !personaB || !scene) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: personaA, personaB, scene'
      });
    }

    // Validate persona structures
    if (!personaA.id || !personaA.name) {
      return res.status(400).json({
        success: false,
        error: 'personaA must have id and name'
      });
    }

    if (!personaB.id || !personaB.name) {
      return res.status(400).json({
        success: false,
        error: 'personaB must have id and name'
      });
    }

    // Validate scene structure
    if (!scene.id || !scene.name) {
      return res.status(400).json({
        success: false,
        error: 'scene must have id and name'
      });
    }

    // Validate maxRounds if provided
    const rounds = maxRounds ? parseInt(maxRounds, 10) : 10;
    if (isNaN(rounds) || rounds < 4 || rounds > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxRounds must be a number between 4 and 20'
      });
    }

    const script = await generateScript({
      personaA,
      personaB,
      scene,
      maxRounds: rounds
    });

    res.json({
      success: true,
      data: script
    });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate script'
    });
  }
});

/**
 * POST /api/scripts/test-dual-llm
 * Test dual LLM communication
 */
router.post('/test-dual-llm', async (req, res) => {
  try {
    const { message } = req.body;

    // LLM A says something
    const llmAResponse = await callDeepSeekAWithSystem(
      'You are LLM A. Respond with a short greeting.',
      message || 'Hello, I am LLM A. What do you want to talk about?'
    );

    // LLM B responds to LLM A's response
    const llmBResponse = await callDeepSeekBWithSystem(
      'You are LLM B. Read the message from LLM A and respond to it.',
      llmAResponse
    );

    res.json({
      success: true,
      llmA: llmAResponse,
      llmB: llmBResponse
    });
  } catch (error) {
    console.error('Error testing dual LLM:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
