/**
 * In-memory session store for multi-turn dialogue generation
 * Structure: { id, status: 'generating'|'completed'|'failed', dialogues: [], progress: 0, error?: string }
 */
const sessions = new Map();

/**
 * Queue for concurrent request control per scriptId
 */
const generationQueues = new Map();

/**
 * Create a new session
 * @param {string} id - Session ID
 * @returns {Object} - Created session
 */
function createSession(id) {
  const session = {
    id,
    status: 'generating',
    dialogues: [],
    progress: 0,
    error: null
  };
  sessions.set(id, session);
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
