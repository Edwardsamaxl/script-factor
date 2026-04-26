import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callDeepSeekAWithSystem } from './llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a scene based on two character personas using LLM
 * @param {Object} personaA - First persona
 * @param {Object} personaB - Second persona
 * @returns {Promise<Object>} - Generated scene with { id, name, description, prompt, isGenerated }
 */
async function generateScene(personaA, personaB) {
  const promptPath = path.join(__dirname, '../prompts/scene-generate.md');
  const promptTemplate = fs.readFileSync(promptPath, 'utf-8');

  const userMessage = `Generate a scene for these two characters:

Character A:
\`\`\`json
${JSON.stringify({
    name: personaA.name || '',
    coreView: personaA.coreView || '',
    speakingStyle: personaA.speakingStyle || '',
    actionStyle: personaA.actionStyle || '',
    background: personaA.background || ''
  }, null, 2)}
\`\`\`

Character B:
\`\`\`json
${JSON.stringify({
    name: personaB.name || '',
    coreView: personaB.coreView || '',
    speakingStyle: personaB.speakingStyle || '',
    actionStyle: personaB.actionStyle || '',
    background: personaB.background || ''
  }, null, 2)}
\`\`\``;

  const response = await callDeepSeekAWithSystem(promptTemplate, userMessage, {
    temperature: 0.8,
    max_tokens: 2048
  });

  // Extract JSON from the response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse generated scene JSON from LLM response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields
  if (!parsed.name || !parsed.description || !parsed.prompt) {
    throw new Error('Generated scene missing required fields (name, description, prompt)');
  }

  const id = `场景-生成-${Date.now()}`;

  return {
    id,
    name: parsed.name,
    description: parsed.description,
    prompt: parsed.prompt,
    isGenerated: true
  };
}

export {
  generateScene
};
