import { loadSessions as loadSessionsFromFile, saveSessions as saveSessionsToFile } from './dataStore.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory session store
const sessions = new Map();

// Queue for concurrent request control per scriptId
const generationQueues = new Map();

// Dirty flag for batch saving
let isDirty = false;
let saveTimeout = null;

// Auto-cleanup: keep only the latest N completed sessions, delete the rest
const MAX_COMPLETED_SESSIONS = 10;

// Batch save: delay write to reduce I/O
function scheduleSave() {
  if (saveTimeout) return;
  isDirty = true;
  saveTimeout = setTimeout(() => {
    if (isDirty) {
      const data = {};
      for (const [id, session] of sessions) {
        data[id] = session;
      }
      saveSessionsToFile(data);
      isDirty = false;
    }
    saveTimeout = null;
  }, 1000); // 1 second delay for batch writes
}

// Load sessions from file on startup
const loadedSessions = loadSessionsFromFile();
for (const [id, session] of Object.entries(loadedSessions)) {
  sessions.set(id, session);
}
console.log(`Loaded ${sessions.size} sessions from persistent storage`);

/**
 * Create a new session
 * @param {string} id - Session ID
 * @param {Object} data - Optional initial data (personaA, personaB, scene)
 * @returns {Object} - Created session
 */
function createSession(id, data = {}) {
  const now = Date.now();
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
    summary: null,
    maxRounds: data.maxRounds || 10,
    createdAt: now,
    updatedAt: now
  };
  sessions.set(id, session);
  scheduleSave(); // Batch persist to file
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
    Object.assign(session, updates, { updatedAt: Date.now() });
    scheduleSave(); // Batch persist to file
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
    session.progress = Math.round((session.dialogues.length / (session.maxRounds || 10)) * 100);
    session.updatedAt = Date.now();
    scheduleSave(); // Batch persist to file
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
    session.updatedAt = Date.now();
    scheduleSave();
    cleanupCompletedSessions();
  }
}

/**
 * Auto-cleanup: keep only the latest MAX_COMPLETED_SESSIONS completed sessions
 * Called after each session completion to prevent sessions.json from growing indefinitely
 */
function cleanupCompletedSessions() {
  const allSessions = [];
  for (const [sid, s] of sessions) {
    allSessions.push({ id: sid, session: s });
  }

  // Only completed sessions are candidates for cleanup
  const completed = allSessions
    .filter(({ session }) => session.status === 'completed')
    .sort((a, b) => (b.session.updatedAt || 0) - (a.session.updatedAt || 0));

  // Keep the latest N, delete the rest
  const toDelete = completed.slice(MAX_COMPLETED_SESSIONS);

  if (toDelete.length > 0) {
    for (const { id } of toDelete) {
      sessions.delete(id);
      generationQueues.delete(id);
    }
    console.log(`[sessionStore] Cleaned up ${toDelete.length} old completed sessions, kept latest ${MAX_COMPLETED_SESSIONS}`);
    isDirty = true;
    // Trigger immediate save since we modified session list
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    const data = {};
    for (const [sid, s] of sessions) {
      data[sid] = s;
    }
    saveSessionsToFile(data);
    isDirty = false;
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
    session.updatedAt = Date.now();
    scheduleSave(); // Batch persist to file
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
