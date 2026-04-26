import path from 'path';
import { fileURLToPath } from 'url';
import { callDeepSeekAWithSystem, callDeepSeekBWithSystem } from './llm.js';
import { addDialogue, completeSession, failSession, getQueue, getSession, updateSession } from './sessionStore.js';
import { summarizeToStoryboard, summarizeToScriptSummary } from './scriptSummarizer.js';
import { loadScripts, saveScripts, withExclusiveAccess, FILES } from './dataStore.js';

const MAX_ROUNDS = 10;
const SHORT_RESPONSE_THRESHOLD = 20;

/**
 * Call LLM A (for Persona A) to generate a dialogue line
 */
async function callLMA(speakerPersona, listenerPersona, history, scene, round) {
  const historyText = history.length > 0
    ? history.map((d, i) => `${i + 1}. ${d.speaker}: ${d.content}`).join('\n')
    : 'No previous dialogue.';

  const prompt = `You are roleplaying as ${speakerPersona.name}${speakerPersona.background ? ` - ${speakerPersona.background}` : ''}.

The current scene is: ${scene.name}${scene.description ? ` - ${scene.description}` : ''}

The opponent is ${listenerPersona.name}${listenerPersona.background ? ` - ${listenerPersona.background}` : ''}.

Core view: ${speakerPersona.coreView || 'no specific view'}
Speaking style: ${speakerPersona.speakingStyle || 'natural'}
Action style: ${speakerPersona.actionStyle || 'none'}

Previous dialogue:
${historyText}

Round ${round}: Generate the next line of dialogue as ${speakerPersona.name}.
Keep it natural and in character. Reflect the core view and speaking style in your response.
The dialogue should be engaging and move the conversation forward.
Do not include the speaker name in your response, just the dialogue content.
If the conversation has reached a natural ending point, respond with exactly: [END]`;

  const response = await callDeepSeekAWithSystem(prompt, '', {
    temperature: 0.8,
    max_tokens: 1024
  });

  return response.trim();
}

/**
 * Call LLM B (for Persona B) to generate a dialogue line
 */
async function callLMB(speakerPersona, listenerPersona, history, scene, round) {
  const historyText = history.length > 0
    ? history.map((d, i) => `${i + 1}. ${d.speaker}: ${d.content}`).join('\n')
    : 'No previous dialogue.';

  const prompt = `You are roleplaying as ${speakerPersona.name}${speakerPersona.background ? ` - ${speakerPersona.background}` : ''}.

The current scene is: ${scene.name}${scene.description ? ` - ${scene.description}` : ''}

The opponent is ${listenerPersona.name}${listenerPersona.background ? ` - ${listenerPersona.background}` : ''}.

Core view: ${speakerPersona.coreView || 'no specific view'}
Speaking style: ${speakerPersona.speakingStyle || 'natural'}
Action style: ${speakerPersona.actionStyle || 'none'}

Previous dialogue:
${historyText}

Round ${round}: Generate the next line of dialogue as ${speakerPersona.name}.
Keep it natural and in character. Reflect the personality and speaking style in your response.
The dialogue should be engaging and move the conversation forward.
Do not include the speaker name in your response, just the dialogue content.
If the conversation has reached a natural ending point, respond with exactly: [END]`;

  const response = await callDeepSeekBWithSystem(prompt, '', {
    temperature: 0.8,
    max_tokens: 1024
  });

  return response.trim();
}

/**
 * Check if dialogue should end
 * @param {string} line - Generated line
 * @param {number} round - Current round
 * @param {Array} dialogues - All dialogues so far
 * @returns {boolean} - True if should end
 */
function shouldEndDialogue(line, round, dialogues) {
  // Explicit end marker
  if (line === '[END]') {
    return true;
  }

  // Too early to end (at least 2 rounds)
  if (round <= 2) {
    return false;
  }

  // Short response after round 2
  if (line.length < SHORT_RESPONSE_THRESHOLD) {
    const prevDialogue = dialogues[dialogues.length - 1];
    if (prevDialogue && prevDialogue.content.length < SHORT_RESPONSE_THRESHOLD) {
      return true; // Two consecutive short responses
    }
  }

  return false;
}

/**
 * Generate multi-turn dialogue with dual LLM
 * @param {string} scriptId - Script session ID
 * @param {Object} personaA - First persona (controlled by LLM A)
 * @param {Object} personaB - Second persona (controlled by LLM B)
 * @param {Object} scene - Scene context
 * @param {number} maxRounds - Maximum rounds (default 10)
 * @param {Function} onEvent - Callback for SSE events
 */
async function generateMultiTurn(scriptId, personaA, personaB, scene, maxRounds = MAX_ROUNDS, onEvent) {
  const dialogues = [];
  const effectiveMaxRounds = Math.min(maxRounds, MAX_ROUNDS);

  try {
    for (let round = 1; round <= effectiveMaxRounds; round++) {
      // Determine current speaker (AB alternating)
      const isLLMA = round % 2 === 1; // A speaks on odd rounds
      const current = isLLMA ? personaA : personaB;
      const opponent = isLLMA ? personaB : personaA;

      // Get dialogue history
      const history = dialogues.map(d => ({ speaker: d.speaker, content: d.content }));

      // Send progress event
      onEvent('progress', { round: dialogues.length, total: effectiveMaxRounds });

      // Call appropriate LLM based on speaker
      // LLM A handles Persona A, LLM B handles Persona B
      const line = isLLMA
        ? await callLMA(current, opponent, history, scene, round)
        : await callLMB(current, opponent, history, scene, round);

      // Check if should end
      if (shouldEndDialogue(line, round, dialogues)) {
        break;
      }

      // Add dialogue
      const speakerLabel = isLLMA ? 'A' : 'B';
      const dialogue = { speaker: speakerLabel, content: line };
      dialogues.push(dialogue);

      // Update session store
      addDialogue(scriptId, dialogue);

      // Send dialogue event
      onEvent('dialogue', { speaker: speakerLabel, content: line });
    }

    // Auto-generate storyboard and summary after dialogue completion
    let storyboard = null;
    let summary = null;
    try {
      const scriptData = {
        title: `Dialogue between ${personaA.name} and ${personaB.name}`,
        personaA: {
          id: personaA.id,
          name: personaA.name,
          coreView: personaA.coreView || '',
          speakingStyle: personaA.speakingStyle || '',
          actionStyle: personaA.actionStyle || '',
          background: personaA.background || ''
        },
        personaB: {
          id: personaB.id,
          name: personaB.name,
          coreView: personaB.coreView || '',
          speakingStyle: personaB.speakingStyle || '',
          actionStyle: personaB.actionStyle || '',
          background: personaB.background || ''
        },
        scene: { id: scene.id, name: scene.name, description: scene.description || '' },
        dialogues
      };
      // Generate both storyboard and summary in parallel
      [storyboard, summary] = await Promise.all([
        summarizeToStoryboard(scriptData),
        summarizeToScriptSummary(scriptData)
      ]);
      updateSession(scriptId, { storyboard, summary });
    } catch (error) {
      console.error('Failed to generate storyboard/summary:', error);
      // Continue even if generation fails
    }

    // Mark session complete AFTER storyboard and summary generation
    completeSession(scriptId);

    // Auto-save completed script to scripts.json (with exclusive access to prevent race conditions)
    try {
      const session = getSession(scriptId);
      if (session) {
        await withExclusiveAccess(FILES.SCRIPTS, () => {
          const scripts = loadScripts();
          const newScript = {
            id: `script-${Date.now()}`,
            title: `Dialogue between ${personaA.name} and ${personaB.name}`,
            dialogues: session.dialogues,
            totalLines: session.dialogues.length,
            wordCount: session.dialogues.reduce((sum, d) => sum + d.content.length, 0),
            storyboard: session.storyboard || null,
            summary: session.summary || null,
            personaA: {
              id: personaA.id,
              name: personaA.name,
              coreView: personaA.coreView || '',
              speakingStyle: personaA.speakingStyle || '',
              actionStyle: personaA.actionStyle || '',
              background: personaA.background || ''
            },
            personaB: {
              id: personaB.id,
              name: personaB.name,
              coreView: personaB.coreView || '',
              speakingStyle: personaB.speakingStyle || '',
              actionStyle: personaB.actionStyle || '',
              background: personaB.background || ''
            },
            scene: { id: scene.id, name: scene.name, description: scene.description || '' },
            creator: '当前用户',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          scripts.unshift(newScript);
          saveScripts(scripts);
        });
      }
    } catch (err) {
      console.error('Failed to auto-save script:', err);
    }

    return dialogues;
  } catch (error) {
    console.error(`Error generating multi-turn dialogue for ${scriptId}:`, error);
    failSession(scriptId, error.message);
    onEvent('error', { message: error.message });
    throw error;
  }
}

/**
 * Queue and process generation request
 * @param {string} scriptId - Script session ID
 * @param {Object} personaA - First persona
 * @param {Object} personaB - Second persona
 * @param {Object} scene - Scene context
 * @param {number} maxRounds - Maximum rounds
 * @param {Function} onEvent - Callback for SSE events
 */
async function queueAndGenerate(scriptId, personaA, personaB, scene, maxRounds, onEvent) {
  const queue = getQueue(scriptId);

  // Add to queue
  const promise = new Promise((resolve, reject) => {
    queue.push({ scriptId, personaA, personaB, scene, maxRounds, onEvent, resolve, reject });
  });

  // If this is the only item in queue, process it
  if (queue.length === 1) {
    processQueue(scriptId);
  }

  return promise;
}

/**
 * Process the generation queue for a scriptId
 * @param {string} scriptId - Script session ID
 */
async function processQueue(scriptId) {
  const queue = getQueue(scriptId);

  while (queue.length > 0) {
    const item = queue[0];

    try {
      await generateMultiTurn(
        item.scriptId,
        item.personaA,
        item.personaB,
        item.scene,
        item.maxRounds,
        item.onEvent
      );
      item.resolve();
    } catch (error) {
      item.reject(error);
    }

    queue.shift();

    // Process next in queue
    if (queue.length > 0) {
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

export {
  generateMultiTurn,
  queueAndGenerate,
  MAX_ROUNDS,
  SHORT_RESPONSE_THRESHOLD
};
