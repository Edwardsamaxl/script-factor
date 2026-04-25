import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callDeepSeekAWithSystem } from './llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rewrite and enrich a persona with LLM
 * @param {Object} input - Raw persona data from form
 * @param {string} input.name - Persona name
 * @param {string} input.coreView - Core viewpoints
 * @param {string} input.speakingStyle - Speaking style
 * @param {string} input.actionStyle - Action style
 * @param {string} input.background - Background story (optional)
 * @returns {Promise<Object>} - Rewritten persona with imagePrompt
 */
async function rewritePersona(input) {
  const promptPath = path.join(__dirname, '../prompts/persona-rewrite.md');
  const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

  const userMessage = `Please refine the following persona:

\`\`\`json
${JSON.stringify({
    name: input.name || '',
    coreView: input.coreView || '',
    speakingStyle: input.speakingStyle || '',
    actionStyle: input.actionStyle || '',
    background: input.background || ''
  }, null, 2)}
\`\`\`

Return the refined persona JSON with all fields polished and an imagePrompt added.`;

  const response = await callDeepSeekAWithSystem(promptTemplate, userMessage, {
    temperature: 0.7,
    max_tokens: 4096
  });

  // Extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse rewritten persona JSON from LLM response');
  }

  const rewritten = JSON.parse(jsonMatch[0]);

  // Validate and ensure required fields
  return {
    name: rewritten.name || input.name,
    coreView: rewritten.coreView || input.coreView || '',
    speakingStyle: rewritten.speakingStyle || input.speakingStyle || '',
    actionStyle: rewritten.actionStyle || input.actionStyle || '',
    background: rewritten.background || input.background || '',
    imagePrompt: rewritten.imagePrompt || ''
  };
}

export {
  rewritePersona
};
