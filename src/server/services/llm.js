import OpenAI from 'openai';

// DeepSeek LLM A
const deepseekA = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

// DeepSeek LLM B (uses the same API key for dual-LLM conversation)
const deepseekB = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com'
});

// Validate API key is configured
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('ERROR: DEEPSEEK_API_KEY must be configured');
  process.exit(1);
}

/**
 * Call DeepSeek LLM A with retry logic
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Options including temperature, max_tokens
 * @returns {Promise<string>} - The response content
 */
async function callDeepSeekA(messages, options = {}) {
  const {
    temperature = 0.8,
    max_tokens = 1024,
    max_retries = 3,
    model = 'deepseek-chat'
  } = options;

  let lastError;

  for (let attempt = 0; attempt < max_retries; attempt++) {
    try {
      const response = await deepseekA.chat.completions.create({
        model,
        max_tokens,
        temperature,
        messages
      });

      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      }

      throw new Error('Empty response from DeepSeek A');
    } catch (error) {
      lastError = error;
      console.error(`DeepSeek A attempt ${attempt + 1} failed:`, error.message);

      if (attempt < max_retries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`DeepSeek A failed after ${max_retries} attempts: ${lastError.message}`);
}

/**
 * Call DeepSeek LLM B with retry logic
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Options including temperature, max_tokens
 * @returns {Promise<string>} - The response content
 */
async function callDeepSeekB(messages, options = {}) {
  const {
    temperature = 0.8,
    max_tokens = 1024,
    max_retries = 3,
    model = 'deepseek-chat'
  } = options;

  let lastError;

  for (let attempt = 0; attempt < max_retries; attempt++) {
    try {
      const response = await deepseekB.chat.completions.create({
        model,
        max_tokens,
        temperature,
        messages
      });

      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content;
      }

      throw new Error('Empty response from DeepSeek B');
    } catch (error) {
      lastError = error;
      console.error(`DeepSeek B attempt ${attempt + 1} failed:`, error.message);

      if (attempt < max_retries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`DeepSeek B failed after ${max_retries} attempts: ${lastError.message}`);
}

/**
 * Call DeepSeek A with system prompt and user message
 */
async function callDeepSeekAWithSystem(systemPrompt, userMessage, options = {}) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });
  return callDeepSeekA(messages, options);
}

/**
 * Call DeepSeek B with system prompt and user message
 */
async function callDeepSeekBWithSystem(systemPrompt, userMessage, options = {}) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });
  return callDeepSeekB(messages, options);
}

export {
  deepseekA,
  deepseekB,
  callDeepSeekA,
  callDeepSeekB,
  callDeepSeekAWithSystem,
  callDeepSeekBWithSystem
};
