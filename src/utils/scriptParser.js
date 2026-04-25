// 格式化对话为可读文本
export function formatScriptText(script) {
  const lines = script.dialogues.map((d) => {
    const speaker = d.speaker === 'A' ? script.personaA?.name : script.personaB?.name
    return `${speaker}：${d.content}`
  })
  return `${script.title}\n\n${lines.join('\n\n')}`
}
