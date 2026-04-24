// 解析 AI 返回的剧本 JSON
export function parseScriptResponse(responseText) {
  try {
    // 尝试提取 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    const data = JSON.parse(jsonMatch[0])

    // 验证必要字段
    if (!data.title || !Array.isArray(data.dialogues)) {
      throw new Error('Invalid script format')
    }

    return {
      title: data.title,
      dialogues: data.dialogues.map((d, i) => ({
        id: `line-${i}`,
        speaker: d.speaker === 'A' ? 'A' : 'B',
        content: d.content,
        emotion: d.emotion || null,
      })),
      totalLines: data.dialogues.length,
      wordCount: data.dialogues.reduce((acc, d) => acc + (d.content?.length || 0), 0),
    }
  } catch (error) {
    console.error('Failed to parse script response:', error)
    return null
  }
}

// 格式化对话为可读文本
export function formatScriptText(script) {
  const lines = script.dialogues.map((d) => {
    const speaker = d.speaker === 'A' ? script.personaA?.name : script.personaB?.name
    return `${speaker}：${d.content}`
  })
  return `${script.title}\n\n${lines.join('\n\n')}`
}
