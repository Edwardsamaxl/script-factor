import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON file for persistent storage
const DATA_DIR = path.join(__dirname, '../data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory session store
const sessions = new Map();

// Queue for concurrent request control per scriptId
const generationQueues = new Map();

/**
 * Load sessions from JSON file on startup
 */
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      for (const [id, session] of Object.entries(data)) {
        sessions.set(id, session);
      }
      console.log(`Loaded ${sessions.size} sessions from persistent storage`);
    }
  } catch (error) {
    console.error('Failed to load sessions:', error);
  }
}

/**
 * Save sessions to JSON file
 */
function saveSessions() {
  try {
    const data = {};
    for (const [id, session] of sessions) {
      data[id] = session;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
}

// Load sessions on module init
loadSessions();

/**
 * Create a new session
 * @param {string} id - Session ID
 * @param {Object} data - Optional initial data (personaA, personaB, scene)
 * @returns {Object} - Created session
 */
function createSession(id, data = {}) {
  const session = {
    id,
    status: 'generating',
    dialogues: [],
    progress: 0,
    error: null,
    personaA: data.personaA || null,
    personaB: data.personaB || null,
    scene: data.scene || null,
    storyboard: null,
    summary: null
  };
  sessions.set(id, session);
  saveSessions(); // Persist to file
  return session;
}

/**
 * Get session by ID
 * @param {string} id - Session ID
 * @returns {Object|null} - Session or null
 */
function getSession(id) {
  return sessions.get(id) || null;
}

/**
 * Update session
 * @param {string} id - Session ID
 * @param {Object} updates - Fields to update
 */
function updateSession(id, updates) {
  const session = sessions.get(id);
  if (session) {
    Object.assign(session, updates);
    saveSessions(); // Persist to file
  }
}

/**
 * Add dialogue to session
 * @param {string} id - Session ID
 * @param {Object} dialogue - Dialogue entry {speaker, content}
 */
function addDialogue(id, dialogue) {
  const session = sessions.get(id);
  if (session) {
    session.dialogues.push(dialogue);
    session.progress = Math.round((session.dialogues.length / 10) * 100);
    saveSessions(); // Persist to file
  }
}

/**
 * Mark session as completed
 * @param {string} id - Session ID
 */
function completeSession(id) {
  const session = sessions.get(id);
  if (session) {
    session.status = 'completed';
    session.progress = 100;
    saveSessions(); // Persist to file
  }
}

/**
 * Mark session as failed
 * @param {string} id - Session ID
 * @param {string} error - Error message
 */
function failSession(id, error) {
  const session = sessions.get(id);
  if (session) {
    session.status = 'failed';
    session.error = error;
    saveSessions(); // Persist to file
  }
}

/**
 * Get or create queue for a scriptId
 * @param {string} scriptId - Script ID
 * @returns {Array} - Queue array
 */
function getQueue(scriptId) {
  if (!generationQueues.has(scriptId)) {
    generationQueues.set(scriptId, []);
  }
  return generationQueues.get(scriptId);
}

/**
 * Check if a script is currently being generated
 * @param {string} scriptId - Script ID
 * @returns {boolean}
 */
function isGenerating(scriptId) {
  const session = sessions.get(scriptId);
  return session && session.status === 'generating';
}

export {
  sessions,
  generationQueues,
  createSession,
  getSession,
  updateSession,
  addDialogue,
  completeSession,
  failSession,
  getQueue,
  isGenerating
};
