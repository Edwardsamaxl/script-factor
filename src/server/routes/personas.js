import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePersona } from '../services/personaGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const BUILT_IN_PERSONAS_PATH = path.join(__dirname, '../data/built-in-personas.json');

/**
 * GET /api/personas/built-in
 * Returns the list of built-in personas
 */
router.get('/built-in', (req, res) => {
  try {
    const personas = JSON.parse(fs.readFileSync(BUILT_IN_PERSONAS_PATH, 'utf-8'));
    res.json({
      success: true,
      data: personas
    });
  } catch (error) {
    console.error('Error reading built-in personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load built-in personas'
    });
  }
});

/**
 * POST /api/personas/generate
 * Generate a new persona based on input parameters
 */
router.post('/generate', async (req, res) => {
  try {
    const { name, personality, speakingStyle, views, background } = req.body;

    // Validate required fields
    if (!name || !personality || !speakingStyle || !views) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, personality, speakingStyle, views'
      });
    }

    // Validate field types
    if (!Array.isArray(personality) || personality.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'personality must be a non-empty array'
      });
    }

    if (!Array.isArray(views) || views.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'views must be a non-empty array'
      });
    }

    const persona = await generatePersona({
      name,
      personality,
      speakingStyle,
      views,
      background
    });

    res.json({
      success: true,
      data: persona
    });
  } catch (error) {
    console.error('Error generating persona:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate persona'
    });
  }
});

export default router;
