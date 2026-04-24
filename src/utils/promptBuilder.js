// 构建剧本生成的 prompt
export function buildScriptPrompt(personaA, personaB, scene) {
  return `
你是${personaA.name}，性格：${personaA.personality.join('、')}。
说话风格：${personaA.speakingStyle}。
核心观点：${personaA.views.join('；')}。

对方是${personaB.name}，性格：${personaB.personality.join('、')}。
说话风格：${personaB.speakingStyle}。
核心观点：${personaB.views.join('；')}。

场景：${scene.description}

请模拟这两个人物进行对话，生成8-12轮对话，每轮对话50-150字。
对话要体现各自的人设特点，观点碰撞要有戏剧性。
以 JSON 格式输出：
{
  "title": "剧本标题",
  "dialogues": [
    {"speaker": "A", "content": "..."},
    {"speaker": "B", "content": "..."}
  ]
}
`.trim()
}

// 构建 AI 视频生成 prompt（Seedance）
export function buildVideoPrompt(script, mode = 'cover') {
  const { title, dialogues, personaA, personaB, scene } = script
  const prompts = {
    cover: `Create cinematic cover for "${title}". Scene: ${scene?.name || 'conversation'}. Style: dramatic, professional.`,
    storyboard: `Create ${dialogues?.length || 8}-panel storyboard for "${title}". Each panel should capture key dialogue moments.`,
  }
  return prompts[mode] || prompts.cover
}

// 构建 AI 图像生成 prompt（GPT Image / Flux）
export function buildImagePrompt(script, mode = 'cover') {
  const { title, personaA, personaB, scene } = script
  const prompts = {
    cover: `${scene?.description || 'Scene'} - ${personaA?.name || 'Character A'} and ${personaB?.name || 'Character B'} in conversation.`,
    characterA: `Portrait of ${personaA?.name || 'Character'}. ${personaA?.personality?.join(', ') || 'friendly'}. Style: detailed, expressive.`,
    characterB: `Portrait of ${personaB?.name || 'Character'}. ${personaB?.personality?.join(', ') || 'friendly'}. Style: detailed, expressive.`,
  }
  return prompts[mode] || prompts.cover
}
