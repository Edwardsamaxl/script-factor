import { callDeepSeekAWithSystem } from './llm.js';

/**
 * Summarize a script's dialogues into a storyboard format suitable for AI image/video generation
 * @param {Object} script - The script object with dialogues
 * @returns {Promise<Object>} - Storyboard with scenes
 */
async function summarizeToStoryboard(script) {
  const { title, personaA, personaB, scene, dialogues } = script;

  // Helper to get persona description flexibly
  const getPersonaDesc = (persona) => {
    const traits = [];
    if (persona.name) traits.push(`名字: ${persona.name}`);
    if (persona.speakingStyle) traits.push(`说话风格: ${persona.speakingStyle}`);
    if (persona.coreView) traits.push(`核心观点: ${persona.coreView}`);
    if (persona.personality) traits.push(`性格: ${Array.isArray(persona.personality) ? persona.personality.join(', ') : persona.personality}`);
    if (persona.actionStyle) traits.push(`行动风格: ${persona.actionStyle}`);
    if (persona.background) traits.push(`背景: ${persona.background}`);
    return traits.join('; ');
  };

  const personaContext = `
角色信息:
- ${getPersonaDesc(personaA)}
- ${getPersonaDesc(personaB)}
场景: ${scene?.name || '未指定'} - ${scene?.description || ''}
`;

  // Build dialogue history
  const dialogueHistory = dialogues.map((d, i) => {
    const speaker = d.speaker === 'A' ? personaA.name : personaB.name;
    return `${i + 1}. ${speaker}: ${d.content}`;
  }).join('\n');

  const prompt = `你是一个专业的AI视频创作助手。你的任务是将一段对话剧本转换为"故事板"格式，这种格式非常适合用于AI图像生成和AI视频生成。

## 任务
将下面的对话剧本分析并转换为一个故事板（Storyboard），每个场景（shot）包含：
- 场景编号和场景描述
- 环境/背景设定
- 出现的角色
- 动作/表情/情绪
- 关键动作对白（精简到20字以内）
- 视觉描述（用于AI生图的prompt）

## 输出格式
请以JSON格式输出，结构如下：
{
  "title": "故事板标题",
  "totalScenes": 场景数量,
  "scenes": [
    {
      "shotNumber": 1,
      "setting": "场景环境描述（地点、时间，光线等）",
      "characters": ["角色名1", "角色名2"],
      "action": "角色动作和表情描述",
      "dialogue": "关键对白（20字以内）",
      "emotion": "整体情绪基调",
      "visualPrompt": "中文AI图像生成prompt，包含人物描述、场景、风格、光线等"
    }
  ]
}

## 规则
1. 场景数量建议为对话轮数的1/3到1/2，确保每个场景有足够的戏剧性
2. visualPrompt应该是详细的中文描述，包含：人物外观、表情、动作、服装、环境、构图、风格，光线等
3. 每段对话如果内容丰富可以拆成多个场景
4. 保持故事的戏剧性和节奏感
5. visualPrompt使用中文描述，适合即梦、可灵、海螺等中文AI图像工具
6. 【重要】人物一致性：同一人物在不同场景中外观特征（发型、服装、五官）必须保持一致，只有表情、动作、姿态可以变化
7. 【重要】情绪递进：场景之间要有情绪的递进或转折，如从平静→紧张→爆发，或从疏远→试探→亲近，避免所有场景都是同一种情绪基调

## 原始剧本
${personaContext}

对话内容:
${dialogueHistory}

请生成故事板JSON。`;

  const response = await callDeepSeekAWithSystem(
    '',
    prompt,
    {
      temperature: 0.7,
      max_tokens: 4096
    }
  );

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse storyboard JSON from LLM response');
  }

  const storyboard = JSON.parse(jsonMatch[0]);

  // Validate and normalize the storyboard structure
  if (!storyboard.scenes || !Array.isArray(storyboard.scenes)) {
    throw new Error('Invalid storyboard format: missing scenes array');
  }

  // Ensure each scene has required fields
  storyboard.scenes = storyboard.scenes.map((scene, index) => ({
    id: scene.shotNumber || index + 1,
    setting: scene.setting || '未知场景',
    characters: scene.characters || [],
    action: scene.action || '',
    dialogue: scene.dialogue || '',
    emotion: scene.emotion || 'neutral',
    visualPrompt: scene.visualPrompt || ''
  }));

  return {
    title: storyboard.title || `Storyboard: ${title}`,
    totalScenes: storyboard.scenes.length,
    scenes: storyboard.scenes
  };
}

/**
 * Summarize a script into a video-ready prompt
 * @param {Object} script - The script object with dialogues
 * @returns {Promise<Object>} - Video prompt for AI video generation
 */
async function summarizeToScriptSummary(script) {
  const { title, personaA, personaB, scene, dialogues } = script;

  // Helper to get persona description
  const getPersonaDesc = (persona) => {
    const traits = [];
    if (persona.name) traits.push(`名字: ${persona.name}`);
    if (persona.speakingStyle) traits.push(`说话风格: ${persona.speakingStyle}`);
    if (persona.coreView) traits.push(`核心观点: ${persona.coreView}`);
    if (persona.personality) traits.push(`性格: ${Array.isArray(persona.personality) ? persona.personality.join(', ') : persona.personality}`);
    if (persona.actionStyle) traits.push(`行动风格: ${persona.actionStyle}`);
    if (persona.background) traits.push(`背景: ${persona.background}`);
    return traits.join('; ');
  };

  const personaContext = `
角色信息:
- ${getPersonaDesc(personaA)}
- ${getPersonaDesc(personaB)}
场景: ${scene?.name || '未指定'} - ${scene?.description || ''}
`;

  // Build dialogue history
  const dialogueHistory = dialogues.map((d, i) => {
    const speaker = d.speaker === 'A' ? personaA.name : personaB.name;
    return `${i + 1}. ${speaker}: ${d.content}`;
  }).join('\n');

  const prompt = `你是一个AI视频生成prompt工程师。你的任务是将一段对话剧本转换为一个丰富的、适合AI视频生成的详细描述。

## 要求
用户只能生成约10秒的视频，所以prompt必须：
1. 生动：包含具体的动作、神态、语气描写，让AI能理解人物的情绪和状态
2. 详细：prompt应在150-200字之间，充分描述画面
3. 具体：包含具体的身体动作、面部表情、眼神、手势、姿态变化等细节
4. 可执行：适合即梦、可灵、海螺等中文AI视频工具
5. 画面感：描述要有镜头感，包括人物站位、视线方向、互动方式

## 重点描写要素（每个场景都要涵盖）
- 动作描写：具体的身体动作，如抬手、转身、低头、靠近、后退等
- 神态描写：面部表情、眼神变化、眉毛、嘴角等微表情
- 语气暗示：通过姿态暗示人物说话的语气（激动、温柔、愤怒、犹豫等）
- 场景细节：环境物品、光线氛围、人物位置关系
- 镜头感：画面构图、视野角度

## 输出格式
请以JSON格式输出，结构如下：
{
  "videoPrompt": "详细的中文AI视频生成prompt，150-200字，包含动作、神态、场景细节",
  "duration": "10秒",
  "emotion": "整体情绪基调",
  "style": "建议的视频风格如'电影感'、'动漫风'、'写实'等"
}

## 原始剧本
${personaContext}

对话内容:
${dialogueHistory}

请生成JSON。`;

  const response = await callDeepSeekAWithSystem(
    '',
    prompt,
    {
      temperature: 0.7,
      max_tokens: 2048
    }
  );

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse video prompt JSON from LLM response');
  }

  const summary = JSON.parse(jsonMatch[0]);

  return {
    videoPrompt: summary.videoPrompt || '',
    duration: summary.duration || '10秒',
    emotion: summary.emotion || 'neutral',
    style: summary.style || '电影感'
  };
}

/**
 * Generate a visual prompt for a specific scene
 * @param {Object} scene - Scene object
 * @param {Object} personaA - Persona A info
 * @param {Object} personaB - Persona B info
 * @returns {Promise<string>} - Enhanced visual prompt
 */
async function enhanceScenePrompt(scene, personaA, personaB) {
  const prompt = `增强这个场景描述，生成一个详细的中文AI图像生成prompt。

场景信息:
- 场景: ${scene.setting}
- 角色: ${scene.characters?.join(', ') || '未知'}
- 动作: ${scene.action}
- 情绪: ${scene.emotion}

角色详情:
- ${personaA.name}: ${(personaA.personality || []).join(', ')}, ${personaA.speakingStyle || '自然'}
- ${personaB.name}: ${(personaB.personality || []).join(', ')}, ${personaB.speakingStyle || '自然'}

请只输出增强后的中文prompt，不要输出其他内容。要生动详细，适合即梦、可灵、海螺等中文AI图像工具。`;

  const response = await callDeepSeekAWithSystem(
    'You are an expert at writing AI image generation prompts.',
    prompt,
    {
      temperature: 0.8,
      max_tokens: 512
    }
  );

  return response.trim();
}

export {
  summarizeToStoryboard,
  summarizeToScriptSummary,
  enhanceScenePrompt
};
