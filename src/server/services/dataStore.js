import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read JSON file with error handling
 * @param {string} filePath - Path to JSON file
 * @param {*} defaultValue - Default value if file doesn't exist or error
 * @returns {*} Parsed JSON data or default value
 */
export function readJsonFile(filePath, defaultValue = null) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
  }
  return defaultValue;
}

/**
 * Write JSON file with backup and error handling
 * @param {string} filePath - Path to JSON file
 * @param {*} data - Data to write
 */
export function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonStr = JSON.stringify(data, null, 2);

    // Create backup if file exists
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.bak`;
      fs.copyFileSync(filePath, backupPath);
    }

    // Write to temp file first, then rename (atomic write)
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, jsonStr, 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Delete backup file
 * @param {string} filePath - Path to JSON file
 */
export function deleteBackup(filePath) {
  try {
    const backupPath = `${filePath}.bak`;
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
  } catch (error) {
    console.error(`Failed to delete backup ${filePath}.bak:`, error.message);
  }
}

// Centralized file paths
export const FILES = {
  SCRIPTS: path.join(DATA_DIR, 'scripts.json'),
  USER_PERSONAS: path.join(DATA_DIR, 'user-personas.json'),
  BUILT_IN_PERSONAS: path.join(DATA_DIR, 'built-in-personas.json'),
  SESSIONS: path.join(DATA_DIR, 'sessions.json'),
  AI_RESULTS: path.join(DATA_DIR, 'ai-results.json')
};

/**
 * Load scripts with centralized logic
 */
export function loadScripts() {
  return readJsonFile(FILES.SCRIPTS, []);
}

/**
 * Save scripts with backup
 */
export function saveScripts(scripts) {
  writeJsonFile(FILES.SCRIPTS, scripts);
}

/**
 * Load user personas with centralized logic
 */
export function loadUserPersonas() {
  return readJsonFile(FILES.USER_PERSONAS, []);
}

/**
 * Save user personas with backup
 */
export function saveUserPersonas(personas) {
  writeJsonFile(FILES.USER_PERSONAS, personas);
}

/**
 * Load built-in personas
 */
export function loadBuiltInPersonas() {
  return readJsonFile(FILES.BUILT_IN_PERSONAS, []);
}

/**
 * Load sessions with centralized logic
 */
export function loadSessions() {
  return readJsonFile(FILES.SESSIONS, {});
}

/**
 * Save sessions with backup
 */
export function saveSessions(sessions) {
  writeJsonFile(FILES.SESSIONS, sessions);
}

/**
 * Load AI results with centralized logic
 */
export function loadAIResults() {
  return readJsonFile(FILES.AI_RESULTS, []);
}

/**
 * Save AI results with backup
 */
export function saveAIResults(results) {
  writeJsonFile(FILES.AI_RESULTS, results);
}
