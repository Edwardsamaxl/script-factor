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
    characterA: `Portrait of ${personaA?.name || 'Character'}. ${personaA?.coreView || 'friendly'}. Style: detailed, expressive.`,
    characterB: `Portrait of ${personaB?.name || 'Character'}. ${personaB?.coreView || 'friendly'}. Style: detailed, expressive.`,
  }
  return prompts[mode] || prompts.cover
}
