import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateScene } from '../services/sceneGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const SCENES_PATH = path.join(__dirname, '../data/scenes.json');

/**
 * GET /api/scenes
 * Returns the list of available scenes
 */
router.get('/', (req, res) => {
  try {
    const scenes = JSON.parse(fs.readFileSync(SCENES_PATH, 'utf-8'));
    res.json({
      success: true,
      data: scenes
    });
  } catch (error) {
    console.error('Error reading scenes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load scenes'
    });
  }
});

/**
 * POST /api/scenes/generate
 * Generate a scene AI based on two character personas
 * Body: { personaA: {...}, personaB: {...} }
 */
router.post('/generate', async (req, res) => {
  try {
    const { personaA, personaB } = req.body;

    if (!personaA || !personaB) {
      return res.status(400).json({
        success: false,
        error: 'Both personaA and personaB are required'
      });
    }

    if (!personaA.name || !personaB.name) {
      return res.status(400).json({
        success: false,
        error: 'Both personaA and personaB must have a name'
      });
    }

    const scene = await generateScene(personaA, personaB);

    res.json({
      success: true,
      data: scene
    });
  } catch (error) {
    console.error('Error generating scene:', error);
    res.status(500).json({
      success: false,
      error: '场景生成失败，请重试'
    });
  }
});

export default router;
