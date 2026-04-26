/**
 * AIGC Service - AI Image and Video Generation
 *
 * This module handles integration with AI image/video generation services.
 * Supports:
 * - Seedance (Doubao-Seedance-1.5-pro) via Volcano Engine Ark API for video
 * - Seedream (doubao-seedream-5.0-lite) via Volcano Engine Ark API for images
 */

console.log('[aigcService] Loading module...');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadAIResults, saveAIResults, loadUserPersonas, saveUserPersonas, loadBuiltInPersonas } from './dataStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root directory (where package.json is)
const PROJECT_ROOT = process.cwd();

// Volcano Engine Ark API configuration
const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_API_URL = process.env.ARK_API_URL || 'https://ark.cn-beijing.volces.com/api/v3';

console.log('[aigcService] ARK_API_KEY:', ARK_API_KEY ? '已设置' : '未设置!!!');

// Public directory for storing generated files
const GENERATED_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'generated');

// Persona images directory
const PERSONAS_DIR = path.join(PROJECT_ROOT, 'public', 'assets', 'personas');

/**
 * Convert local file to base64 data URI
 * @param {string} filePath - Relative path under public directory (e.g. "/assets/personas/lele.jpg")
 * @returns {Promise<string|null>} - Base64 data URI or null if file not found
 */
async function localFileToBase64(filePath) {
  if (!filePath) return null;
  // Remove leading slash
  const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const fullPath = path.join(PROJECT_ROOT, 'public', relativePath);
  try {
    if (!fs.existsSync(fullPath)) {
      console.warn(`[aigcService] Persona image not found: ${fullPath}`);
      return null;
    }
    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.warn(`[aigcService] Failed to read persona image ${filePath}:`, err.message);
    return null;
  }
}

// Ensure directories exist
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

/**
 * Resume pending tasks on server startup
 * Any tasks with status 'pending' will be restarted
 */
export function resumePendingTasks() {
  const results = loadAIResults();
  const pending = results.filter(r => r.status === 'pending');
  if (pending.length === 0) return;

  console.log(`[aigcService] Resuming ${pending.length} pending task(s)...`);
  pending.forEach(result => {
    console.log(`[aigcService] Resuming task ${result.id} (${result.type}) for "${result.personaId || result.scriptId}"`);
    if (result.type === 'video') {
      startVideoGeneration(result);
    } else {
      startImageGeneration(result);
    }
  });
}

/**
 * Create an AI result record and start generation
 * @param {Object} params - Generation parameters
 * @returns {Promise<Object>} - Created result record
 */
export async function createAIResult({ scriptId, scriptTitle, type, provider, mode, prompt, personaImages, personaId, duration }) {
  const { v4: uuidv4 } = await import('uuid');
  const id = `ai-${Date.now()}-${uuidv4().slice(0, 8)}`;

  const result = {
    id,
    scriptId,
    scriptTitle,
    type,
    provider,
    mode,
    prompt,
    personaImages,
    personaId,
    duration: duration || 12,
    status: 'pending',
    resultUrl: null,
    volcanoTaskId: null,
    error: null,
    createdAt: Date.now(),
    completedAt: null
  };

  // Save initial record
  const results = loadAIResults();
  results.push(result);
  saveAIResults(results);

  // Start async generation
  if (type === 'video') {
    startVideoGeneration(result);
  } else {
    startImageGeneration(result);
  }

  return result;
}

/**
 * Update AI result record
 */
function updateAIResult(id, updates) {
  const results = loadAIResults();
  const index = results.findIndex(r => r.id === id);
  if (index !== -1) {
    results[index] = { ...results[index], ...updates };
    saveAIResults(results);
    return results[index];
  }
  return null;
}

/**
 * Get AI result by ID
 */
function getAIResult(id) {
  const results = loadAIResults();
  return results.find(r => r.id === id);
}

/**
 * Get AI results by script ID
 */
function getAIResultsByScriptId(scriptId) {
  const results = loadAIResults();
  return results.filter(r => r.scriptId === scriptId);
}

/**
 * Update persona's imageUrl after successful image generation
 */
function updatePersonaImageUrl(personaId, imageUrl) {
  if (!personaId || !imageUrl) return;

  // Try user personas first
  let personas = loadUserPersonas();
  let index = personas.findIndex(p => p.id === personaId);
  if (index !== -1) {
    personas[index].imageUrl = imageUrl;
    personas[index].updatedAt = Date.now();
    saveUserPersonas(personas);
    console.log(`[aigcService] Updated user persona ${personaId} imageUrl to ${imageUrl}`);
    return;
  }

  // Try built-in personas
  const builtIn = loadBuiltInPersonas();
  const builtInPersona = builtIn.find(p => p.id === personaId);
  if (builtInPersona) {
    // For built-in personas, we store the imageUrl in user-personas.json as a reference
    const statsIndex = personas.findIndex(p => p.builtInId === personaId);
    if (statsIndex !== -1) {
      personas[statsIndex].imageUrl = imageUrl;
      personas[statsIndex].updatedAt = Date.now();
    } else {
      personas.unshift({
        id: `stats-${Date.now()}`,
        builtInId: personaId,
        imageUrl: imageUrl,
        usageCount: 0,
        likeCount: 0,
        updatedAt: Date.now()
      });
    }
    saveUserPersonas(personas);
    console.log(`[aigcService] Updated built-in persona ${personaId} imageUrl to ${imageUrl}`);
  }
}

/**
 * Delete AI result
 */
function deleteAIResult(id) {
  const results = loadAIResults();
  const index = results.findIndex(r => r.id === id);
  if (index === -1) return false;

  const result = results[index];

  // Delete associated files
  if (result.resultUrl) {
    const filePath = path.join(PROJECT_ROOT, 'public', result.resultUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  results.splice(index, 1);
  saveAIResults(results);
  return true;
}

/**
 * Generate image using Seedance (Volcano Engine Ark)
 * Uses doubao-seedream-5.0-lite model
 */
async function startImageGeneration(result) {
  updateAIResult(result.id, { status: 'processing' });

  try {
    // Build request body
    const requestBody = {
      model: 'doubao-seedream-5-0-260128',
      prompt: result.prompt,
      size: '2048x2048',
      response_format: 'url',
      watermark: false
    };

    // Add reference images if available (convert to base64)
    const { personaImages } = result;
    const aBase64 = await localFileToBase64(personaImages?.aUrl);
    const bBase64 = await localFileToBase64(personaImages?.bUrl);
    if (aBase64) {
      requestBody.image = requestBody.image || [];
      requestBody.image.push(aBase64);
    }
    if (bBase64) {
      requestBody.image = requestBody.image || [];
      requestBody.image.push(bBase64);
    }

    // Call Volcano Engine image generation API (synchronous)
    const response = await fetchWithTimeout(`${ARK_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ARK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }, 60000); // 60s timeout for image generation

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Seedream API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Image generation failed');
    }

    const imageData = data.data?.[0];
    if (!imageData?.url) {
      throw new Error('No image URL returned from Seedream API');
    }

    // Download and save the image
    const resultUrl = await downloadFile(imageData.url, result.id, 'image');

    updateAIResult(result.id, {
      status: 'success',
      resultUrl,
      completedAt: Date.now()
    });

    // Update persona's imageUrl if this is a persona image generation
    if (result.mode === 'persona' && result.personaId) {
      updatePersonaImageUrl(result.personaId, resultUrl);
    }
  } catch (error) {
    updateAIResult(result.id, {
      status: 'failed',
      error: error.message,
      completedAt: Date.now()
    });
  }
}

/**
 * Generate video using Seedance (Volcano Engine Ark)
 * Uses Doubao-Seedance-1.5-pro model with content array (text + images)
 */
async function startVideoGeneration(result) {
  updateAIResult(result.id, { status: 'processing' });

  try {
    // Build content array: text prompt + reference images
    const content = [];

    // Add text prompt
    content.push({
      type: 'text',
      text: result.prompt
    });

    // Add persona images as reference images (convert to base64)
    const { personaImages, duration: resultDuration } = result;
    const aBase64 = await localFileToBase64(personaImages?.aUrl);
    const bBase64 = await localFileToBase64(personaImages?.bUrl);
    const imageItems = [];
    if (aBase64) {
      imageItems.push({
        type: 'image_url',
        image_url: {
          url: aBase64,
          role: 'reference_image'
        }
      });
    }
    if (bBase64) {
      imageItems.push({
        type: 'image_url',
        image_url: {
          url: bBase64,
          role: 'reference_image'
        }
      });
    }

    // Position first image as first_frame if available, rest as reference_image
    // This helps Seedance anchor character appearance across the video
    if (imageItems.length > 0) {
      imageItems[0].image_url.role = 'first_frame';
    }

    content.push(...imageItems);

    // Step 1: Create video generation task
    console.log('[Video Create] Starting video generation with prompt:', result.prompt?.slice(0, 100));
    console.log('[Video Create] Content array:', JSON.stringify(content));
    const createResponse = await fetchWithTimeout(`${ARK_API_URL}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ARK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'doubao-seedance-1-5-pro-251215',
        content,
        resolution: '1080p',
        ratio: '16:9',
        duration: resultDuration || 12,
        watermark: false
      })
    }, 30000); // 30s timeout for task creation

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Seedance API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    if (!taskId) {
      throw new Error('No task ID returned from Seedance API');
    }

    // Store volcano taskId immediately so frontend can poll via dedicated endpoint
    updateAIResult(result.id, { volcanoTaskId: taskId });

    // Step 2: Poll for task completion
    const maxAttempts = 180; // 180 * 5s = 15 minutes max
    let attempts = 0;
    let taskStatus = 'queued';

    while (attempts < maxAttempts && (taskStatus === 'queued' || taskStatus === 'running' || taskStatus === 'processing')) {
      await sleep(5000); // Wait 5 seconds between polls
      attempts++;

      let statusResponse;
      try {
        statusResponse = await fetchWithTimeout(`${ARK_API_URL}/contents/generations/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${ARK_API_KEY}`
          }
        }, 15000); // 15s timeout for status poll
      } catch (fetchErr) {
        // Timeout or network error - continue polling
        console.log('[Video Poll] Fetch error (will retry):', fetchErr.message);
        continue;
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log('[Video Poll] Task ID:', taskId, 'Status:', statusData.status, 'Full response:', JSON.stringify(statusData).slice(0, 500));
        taskStatus = statusData.status;

        if (taskStatus === 'succeeded' && statusData.content?.video_url) {
          const videoUrl = statusData.content.video_url;
          // Download and save the video
          const resultUrl = await downloadFile(videoUrl, result.id, 'video');

          updateAIResult(result.id, {
            status: 'success',
            resultUrl,
            completedAt: Date.now()
          });
          return;
        } else if (taskStatus === 'failed') {
          throw new Error(statusData.error?.message || 'Video generation failed');
        }
      } else {
        // Non-OK response - log but continue polling
        console.log('[Video Poll] Non-OK response, continuing...');
      }
    }

    throw new Error('Video generation timed out');
  } catch (error) {
    updateAIResult(result.id, {
      status: 'failed',
      error: error.message,
      completedAt: Date.now()
    });
  }
}

/**
 * Download file from URL and save to generated directory
 */
async function downloadFile(url, resultId, type) {
  const ext = type === 'video' ? 'mp4' : 'jpg';
  const fileName = `${resultId}.${ext}`;
  const fullPath = path.join(GENERATED_DIR, fileName);

  const response = await fetchWithTimeout(url, {}, 120000); // 2min timeout for download
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(fullPath, buffer);

  return `/assets/generated/${fileName}`;
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export {
  getAIResult,
  getAIResultsByScriptId,
  deleteAIResult
};
