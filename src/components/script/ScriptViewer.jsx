import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../common/Button'
import { formatScriptText } from '../../utils/scriptParser'

export default function ScriptViewer({ script, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('storyboard') // 'storyboard' | 'summary' | 'dialogue'
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false)
  const [storyboardError, setStoryboardError] = useState(null)
  const [copiedPrompt, setCopiedPrompt] = useState(null)

  // 从剧本获取已有的故事板和总结
  const storyboard = script?.storyboard
  const summary = script?.summary

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

  const handleCopyPrompt = async (prompt, index) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedPrompt(index)
    setTimeout(() => setCopiedPrompt(null), 2000)
  }

  const handleGenerateStoryboard = async () => {
    if (!script?.id) return
    setIsGeneratingStoryboard(true)
    setStoryboardError(null)

    try {
      const response = await fetch(`/api/scripts/${script.id}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script })
      })

      const data = await response.json()

      if (data.success) {
        window.location.reload()
      } else {
        setStoryboardError(data.error || '生成失败')
      }
    } catch (error) {
      setStoryboardError('生成失败，请重试')
      console.error('Storyboard generation error:', error)
    } finally {
      setIsGeneratingStoryboard(false)
    }
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

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('storyboard')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'storyboard'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎬 故事板
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎥 视频脚本
        </button>
        <button
          onClick={() => setActiveTab('dialogue')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'dialogue'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📝 对话
        </button>
      </div>

      {/* 故事板 Tab */}
      {activeTab === 'storyboard' && (
        storyboard ? (
          <div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-1">{storyboard.title}</h3>
              <p className="text-sm text-gray-600">共 {storyboard.totalScenes} 个场景 · 用于AI生图</p>
            </div>

            <div className="space-y-4">
              {storyboard.scenes?.map((scene, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-900">场景 {scene.id}</span>
                    <span className="ml-2 text-sm px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                      {scene.emotion || 'neutral'}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">环境</p>
                      <p className="text-sm text-gray-700">{scene.setting}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">角色</p>
                      <p className="text-sm text-gray-700">{scene.characters?.join(', ')}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">动作/表情</p>
                      <p className="text-sm text-gray-700">{scene.action}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">对白</p>
                      <p className="text-sm text-gray-700 italic">"{scene.dialogue}"</p>
                    </div>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Visual Prompt (AI生图)</p>
                        <button
                          onClick={() => handleCopyPrompt(scene.visualPrompt, index)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {copiedPrompt === index ? '已复制' : '复制'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-300 font-mono leading-relaxed">
                        {scene.visualPrompt}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-gray-500 mb-4">暂无故事板</p>
            <Button
              variant="primary"
              onClick={handleGenerateStoryboard}
              disabled={isGeneratingStoryboard}
            >
              {isGeneratingStoryboard ? '生成中...' : '点击生成故事板'}
            </Button>
            {storyboardError && (
              <p className="text-red-500 text-sm mt-2">{storyboardError}</p>
            )}
          </div>
        )
      )}

      {/* 总结版/视频脚本 Tab */}
      {activeTab === 'summary' && (
        summary?.videoPrompt ? (
          <div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-4 mb-4">
              <h3 className="font-bold text-gray-900 mb-1">AI视频生成 Prompt</h3>
              <p className="text-sm text-gray-600">约{summary.duration || '10秒'}视频 · 直接用于Runway/Pika/Sora</p>
            </div>

            {/* 主要Prompt展示 */}
            <div className="bg-gray-900 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Video Prompt</span>
                <button
                  onClick={() => handleCopyPrompt(summary.videoPrompt, 'video')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {copiedPrompt === 'video' ? '已复制' : '复制'}
                </button>
              </div>
              <p className="text-gray-100 text-sm leading-relaxed font-mono">
                {summary.videoPrompt}
              </p>
            </div>

            {/* 元信息 */}
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">情绪</p>
                <p className="text-sm font-medium text-gray-900">{summary.emotion || 'neutral'}</p>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">风格</p>
                <p className="text-sm font-medium text-gray-900">{summary.style || '电影感'}</p>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">时长</p>
                <p className="text-sm font-medium text-gray-900">{summary.duration || '10秒'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎥</div>
            <p className="text-gray-500 mb-4">暂无视频脚本</p>
            <p className="text-sm text-gray-400">生成剧本后会自动生成视频脚本</p>
          </div>
        )
      )}

      {/* 对话内容 Tab */}
      {activeTab === 'dialogue' && (
        <div>
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

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap mt-4">
            <Button variant="secondary" onClick={handleCopy} className="flex-1 min-w-[100px]">
              {copied ? '已复制' : '复制台词'}
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex-1 min-w-[100px]">
              导出 JSON
            </Button>
            {script.id && (
              <Link to={`/ai/create/${script.id}`} className="flex-1 min-w-[100px]">
                <Button variant="outline" className="w-full">
                  AI 创作
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

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
