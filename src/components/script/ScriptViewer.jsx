import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../common/Button'
import { formatScriptText } from '../../utils/scriptParser'

export default function ScriptViewer({ script, onDelete }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = formatScriptText(script)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    const data = JSON.stringify(script, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${script.title || 'script'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* 头部信息 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{script.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <span>{script.personaA?.avatar} {script.personaA?.name}</span>
          <span className="text-gray-400">vs</span>
          <span>{script.personaB?.avatar} {script.personaB?.name}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>📍 {script.scene?.name}</span>
          <span>💬 {script.dialogues?.length || 0} 轮</span>
          <span>📝 {script.wordCount || 0} 字</span>
        </div>
      </div>

      {/* 人设信息 */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">🎭 人设信息</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{script.personaA?.avatar}</span>
              <span className="font-medium text-gray-900">{script.personaA?.name}</span>
            </div>
            <p className="text-xs text-gray-500">{script.personaA?.speakingStyle}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{script.personaB?.avatar}</span>
              <span className="font-medium text-gray-900">{script.personaB?.name}</span>
            </div>
            <p className="text-xs text-gray-500">{script.personaB?.speakingStyle}</p>
          </div>
        </div>
      </div>

      {/* 对话内容 */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">📝 对话内容</h2>
        <div className="space-y-3">
          {script.dialogues?.map((line, i) => {
            const speaker = line.speaker === 'A' ? script.personaA : script.personaB
            return (
              <div key={line.id || i} className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{speaker?.avatar}</span>
                  <span className="font-medium text-gray-900">{speaker?.name}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{line.content}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleCopy} className="flex-1">
          {copied ? '已复制' : '复制台词'}
        </Button>
        <Button variant="outline" onClick={handleExport} className="flex-1">
          导出 JSON
        </Button>
        {script.id && (
          <Link to={`/ai/create/${script.id}`} className="flex-1">
            <Button variant="primary" className="w-full">
              AI 创作
            </Button>
          </Link>
        )}
      </div>

      {onDelete && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="danger" onClick={onDelete} className="w-full">
            删除剧本
          </Button>
        </div>
      )}
    </div>
  )
}
