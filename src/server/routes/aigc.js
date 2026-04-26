import express from 'express';
import { createAIResult, getAIResult, getAIResultsByScriptId, deleteAIResult } from '../services/aigcService.js';
import { loadAIResults } from '../services/dataStore.js';

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_API_URL = process.env.ARK_API_URL || 'https://ark.cn-beijing.volces.com/api/v3';

const router = express.Router();

/**
 * POST /api/ai/generate
 * Start an AI generation task (image or video)
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('[AI Generate] Request body:', req.body);
    const { scriptId, type, mode, provider = 'seedance', prompt, personaImages, personaId, duration } = req.body;

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
      personaId,
      duration
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

/**
 * POST /api/ai/results/:resultId/retry
 * Retry a failed AI generation task
 */
router.post('/results/:resultId/retry', async (req, res) => {
  const { resultId } = req.params;
  const existingResult = getAIResult(resultId);

  if (!existingResult) {
    return res.status(404).json({
      success: false,
      error: 'Result not found'
    });
  }

  if (existingResult.status !== 'failed') {
    return res.status(400).json({
      success: false,
      error: 'Can only retry failed tasks'
    });
  }

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

/**
 * GET /api/ai/video-results/:resultId
 * Query real-time video generation status from Volcano Engine API
 * This gives the frontend direct access to intermediate states (queued, running, etc.)
 */
router.get('/video-results/:resultId', async (req, res) => {
  const { resultId } = req.params;
  const result = getAIResult(resultId);

  if (!result) {
    return res.status(404).json({
      success: false,
      error: 'Result not found'
    });
  }

  // If no volcano taskId yet, return current result as-is
  if (!result.volcanoTaskId) {
    return res.json({
      success: true,
      data: result
    });
  }

  try {
    const statusRes = await fetch(`${ARK_API_URL}/contents/generations/tasks/${result.volcanoTaskId}`, {
      headers: {
        'Authorization': `Bearer ${ARK_API_KEY}`
      }
    });

    if (!statusRes.ok) {
      // If volcano API fails, return local result
      return res.json({
        success: true,
        data: result
      });
    }

    const statusData = await statusRes.json();

    res.json({
      success: true,
      data: {
        ...result,
        volcanoStatus: statusData.status,
        volcanoProgress: statusData.status === 'succeeded' ? 1 :
                          statusData.status === 'running' ? 0.5 :
                          statusData.status === 'queued' ? 0.2 : 0,
        volcanoVideoUrl: statusData.content?.video_url || null,
        volcanoError: statusData.error ? `${statusData.error.code}: ${statusData.error.message}` : null
      }
    });
  } catch (error) {
    // Fallback to local result on error
    res.json({
      success: true,
      data: result
    });
  }
});


export default router;
