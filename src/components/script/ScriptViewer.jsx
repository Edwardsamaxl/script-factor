import { useState, useRef, useEffect } from 'react'
import Button from '../common/Button'
import { formatScriptText } from '../../utils/scriptParser'

function sendToSeedance(prompt) {
  window.open(`https://seedance.ai/create?prompt=${encodeURIComponent(prompt)}`, '_blank')
}

function sendToGPTImage(prompt) {
  window.open(`https://chat.openai.com/?prompt=${encodeURIComponent(prompt)}`, '_blank')
}

export default function ScriptViewer({ script, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('storyboard')
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false)
  const [storyboardError, setStoryboardError] = useState(null)
  const [copiedPrompt, setCopiedPrompt] = useState(null)

  // Inline rename state
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(script?.title || '')
  const renameInputRef = useRef(null)

  // Editable prompt state — 'video' for videoPrompt, number for scene index
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [promptDraft, setPromptDraft] = useState('')

  const startEditPrompt = (key, value) => {
    setEditingPrompt(key)
    setPromptDraft(value)
  }

  const cancelEditPrompt = () => {
    setEditingPrompt(null)
    setPromptDraft('')
  }

  const savePrompt = (key) => {
    const newValue = promptDraft.trim()
    if (!newValue) { cancelEditPrompt(); return }

    if (typeof key === 'number') {
      // scene visualPrompt
      const updated = [...(script.storyboard.scenes)]
      updated[key] = { ...updated[key], visualPrompt: newValue }
      script.storyboard.scenes = updated
      fetch(`/api/scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyboard: script.storyboard }),
      })
    } else if (key === 'video') {
      script.summary = { ...script.summary, videoPrompt: newValue }
      fetch(`/api/scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: script.summary }),
      })
    }
    cancelEditPrompt()
  }

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [isRenaming])

  const handleRenameConfirm = () => {
    const newTitle = renameValue.trim()
    if (newTitle && newTitle !== script.title) {
      fetch(`/api/scripts/${script.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      }).then(() => {
        script.title = newTitle
        window.location.reload()
      })
    } else {
      setIsRenaming(false)
    }
  }

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameConfirm()
    if (e.key === 'Escape') {
      setRenameValue(script.title)
      setIsRenaming(false)
    }
  }

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
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 mb-4">
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameConfirm}
            onKeyDown={handleRenameKeyDown}
            className="w-full text-xl font-bold bg-white/80 rounded-lg px-3 py-1 border border-accent/30 outline-none focus:border-accent transition-colors"
          />
        ) : (
          <h1
            className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-accent transition-colors flex items-center gap-2 group"
            onClick={() => { setRenameValue(script.title); setIsRenaming(true) }}
          >
            {script.title}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0">
              <path d="M9.5 2.5l2 2M2 12l1.5-5L11 4.5l2-2L4.5 11 2 12z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </h1>
        )}
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
                    <div className="bg-gray-900 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Visual Prompt (AI生图)</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyPrompt(scene.visualPrompt, index)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            {copiedPrompt === index ? '已复制' : '复制'}
                          </button>
                          <button
                            onClick={() => startEditPrompt(index, scene.visualPrompt)}
                            className="text-xs text-gray-400 hover:text-gray-200"
                          >
                            编辑
                          </button>
                        </div>
                      </div>
                      {editingPrompt === index ? (
                        <div>
                          <textarea
                            value={promptDraft}
                            onChange={(e) => setPromptDraft(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 font-mono leading-relaxed resize-none outline-none border border-gray-600 focus:border-blue-400 transition-colors"
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => savePrompt(index)}
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors"
                            >
                              保存
                            </button>
                            <button
                              onClick={cancelEditPrompt}
                              className="px-3 py-1 rounded-lg bg-gray-700 text-gray-300 text-xs hover:bg-gray-600 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p
                          onClick={() => startEditPrompt(index, scene.visualPrompt)}
                          className="text-xs text-gray-300 font-mono leading-relaxed cursor-pointer hover:text-gray-100 transition-colors"
                          title="点击编辑"
                        >
                          {scene.visualPrompt}
                        </p>
                      )}
                    </div>
                    {/* AI 快捷操作 */}
                    <button
                      onClick={() => sendToGPTImage(scene.visualPrompt)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-ink-900 text-paper-100 text-xs font-medium hover:bg-ink-700 active:scale-[0.97] transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      发送到 GPT Image
                    </button>
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

            {/* 主要操作按钮 */}
            <button
              onClick={() => sendToSeedance(summary.videoPrompt)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ink-900 text-paper-100 text-sm font-semibold hover:bg-ink-700 active:scale-[0.97] transition-all mb-4"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              发送到 Seedance
            </button>

            {/* 主要Prompt展示 */}
            <div className="bg-gray-900 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">Video Prompt</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(summary.videoPrompt, 'video')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {copiedPrompt === 'video' ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={() => startEditPrompt('video', summary.videoPrompt)}
                    className="text-xs text-gray-400 hover:text-gray-200"
                  >
                    编辑
                  </button>
                </div>
              </div>
              {editingPrompt === 'video' ? (
                <div>
                  <textarea
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm text-gray-200 font-mono leading-relaxed resize-none outline-none border border-gray-600 focus:border-blue-400 transition-colors"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => savePrompt('video')}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-500 transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditPrompt}
                      className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 text-xs hover:bg-gray-600 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  onClick={() => startEditPrompt('video', summary.videoPrompt)}
                  className="text-gray-100 text-sm leading-relaxed font-mono cursor-pointer hover:text-white transition-colors"
                  title="点击编辑"
                >
                  {summary.videoPrompt}
                </p>
              )}
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
