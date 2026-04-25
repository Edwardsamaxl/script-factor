import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callDeepSeekAWithSystem } from './llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a persona based on user input
 * @param {Object} input - Persona generation input
 * @param {string} input.name - Persona name
 * @param {string[]} input.personality - Personality tags
 * @param {string} input.speakingStyle - Speaking style description
 * @param {string[]} input.views - Core viewpoints
 * @param {string} input.background - Background story (optional)
 * @returns {Promise<Object>} - Generated Persona JSON
 */
async function generatePersona(input) {
  const promptPath = path.join(__dirname, '../prompts/persona-generation.md');
  const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

  const userMessage = `Generate a persona based on the following input:

\`\`\`json
${JSON.stringify(input, null, 2)}
\`\`\`

Please generate a complete Persona JSON object that conforms to the PRD data model format specified in the prompt.`;

  const response = await callDeepSeekAWithSystem(promptTemplate, userMessage, {
    temperature: 0.7,
    max_tokens: 4096
  });

  // Extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse persona JSON from LLM response');
  }

  const persona = JSON.parse(jsonMatch[0]);

  // Ensure required fields
  const timestamp = Date.now();
  return {
    id: persona.id || `persona_${timestamp}`,
    name: persona.name || input.name,
    avatar: persona.avatar || '',
    creator: persona.creator || 'system',
    personality: persona.personality || input.personality || [],
    speakingStyle: persona.speakingStyle || input.speakingStyle || '',
    views: persona.views || input.views || [],
    background: persona.background || input.background || '',
    exampleDialogs: persona.exampleDialogs || [],
    usageCount: 0,
    likeCount: 0,
    isPublic: false,
    isPremium: false,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export {
  generatePersona
};
