import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callDeepSeekAWithSystem } from './llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a script based on personas and scene
 * @param {Object} params - Script generation parameters
 * @param {Object} params.personaA - First persona
 * @param {Object} params.personaB - Second persona
 * @param {Object} params.scene - Scene context
 * @param {number} params.maxRounds - Maximum dialogue rounds
 * @returns {Promise<Object>} - Generated script
 */
async function generateScript({ personaA, personaB, scene, maxRounds = 10 }) {
  const promptPath = path.join(__dirname, '../prompts/script-generation.md');
  const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

  const userMessage = `Generate a script based on the following parameters:

\`\`\`json
{
  "personaA": ${JSON.stringify(personaA, null, 2)},
  "personaB": ${JSON.stringify(personaB, null, 2)},
  "scene": ${JSON.stringify(scene, null, 2)},
  "maxRounds": ${maxRounds}
}
\`\`\`

Please generate a complete script JSON object that conforms to the output format specified in the prompt.`;

  const response = await callDeepSeekAWithSystem(promptTemplate, userMessage, {
    temperature: 0.8,
    max_tokens: 8192
  });

  // Extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse script JSON from LLM response');
  }

  const script = JSON.parse(jsonMatch[0]);

  // Calculate word count
  let wordCount = 0;
  if (script.dialogues && Array.isArray(script.dialogues)) {
    script.dialogues.forEach(d => {
      wordCount += d.content ? d.content.length : 0;
    });
  }

  return {
    title: script.title || 'Untitled Script',
    personaA: {
      id: personaA.id,
      name: personaA.name
    },
    personaB: {
      id: personaB.id,
      name: personaB.name
    },
    scene: {
      id: scene.id,
      name: scene.name
    },
    dialogues: script.dialogues || [],
    totalLines: script.dialogues ? script.dialogues.length : 0,
    wordCount
  };
}

export {
  generateScript
};
