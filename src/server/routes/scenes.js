import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

export default router;
