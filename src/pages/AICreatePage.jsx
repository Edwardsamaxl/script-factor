import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScripts } from '../hooks/useScripts'
import { useAIResults } from '../hooks/useAIResults'
import Button from '../components/common/Button'
import { buildVideoPrompt, buildImagePrompt } from '../utils/promptBuilder'

const AI_TOOLS = [
  { id: 'video', name: '视频生成', icon: 'video', type: 'video', description: 'AI 生成视频' },
  { id: 'image', name: '图片生成', icon: 'image', type: 'image', description: 'AI 生成图片' },
]

const MODES = {
  video: [
    { id: 'cover', name: '生成视频封面', icon: 'film' },
    { id: 'storyboard', name: '生成分镜图', icon: 'layout' },
  ],
  image: [
    { id: 'cover', name: '生成场景图', icon: 'image' },
    { id: 'characterA', name: '角色 A 图', icon: 'user' },
    { id: 'characterB', name: '角色 B 图', icon: 'user-check' },
  ],
}

const ToolIcon = ({ type, className }) => {
  const icons = {
    video: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8l4 2-4 2V8z" fill="currentColor"/>
      </svg>
    ),
    image: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
        <path d="M2 13l4-3 3 2 4-4 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    sparkle: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.93 4.93l2.12 2.12M12.95 12.95l2.12 2.12M4.93 15.07l2.12-2.12M12.95 7.05l2.12-2.12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    film: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="5" cy="6" r="0.75" fill="currentColor"/>
        <circle cx="5" cy="12" r="0.75" fill="currentColor"/>
        <circle cx="13" cy="6" r="0.75" fill="currentColor"/>
        <circle cx="13" cy="12" r="0.75" fill="currentColor"/>
      </svg>
    ),
    layout: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    user: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'user-check': (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
        <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 16c0-3.314 2.239-6 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="13" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 11l1.5 1.5L20 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
  return icons[type] || null
}

export default function AICreatePage() {
  const { scriptId } = useParams()
  const navigate = useNavigate()
  const { getScript } = useScripts()
  const { createTask } = useAIResults(scriptId)

  const script = getScript(scriptId)

  const [selectedTool, setSelectedTool] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)
  const [prompt, setPrompt] = useState('')

  if (!script) {
    return (
      <div className="text-center py-12">
        <div className="empty-state">
          <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4 mx-auto">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink-400">
              <circle cx="13" cy="13" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 9v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="empty-state-title">剧本不存在</p>
          <p className="empty-state-desc mb-4">请返回首页选择剧本</p>
          <Button variant="primary" onClick={() => navigate('/')}>返回首页</Button>
        </div>
      </div>
    )
  }

  const tool = AI_TOOLS.find((t) => t.id === selectedTool)
  const modes = tool ? MODES[tool.type] : []

  const handleToolSelect = (toolId) => {
    setSelectedTool(toolId)
    setSelectedMode(null)
    setPrompt('')
  }

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId)
    if (tool?.type === 'video') {
      setPrompt(buildVideoPrompt(script, modeId))
    } else if (tool?.type === 'image') {
      setPrompt(buildImagePrompt(script, modeId))
    }
  }

  const handleSendToAI = async () => {
    if (!prompt) return

    const tool = AI_TOOLS.find(t => t.id === selectedTool)
    const type = tool?.type || 'image'

    try {
      await createTask({
        type,
        provider: selectedTool,
        mode: selectedMode,
        prompt,
        personaImages: {
          aUrl: script.personaA?.imageUrl,
          bUrl: script.personaB?.imageUrl
        }
      })
      navigate('/ai/hub')
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('发送失败: ' + error.message)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center text-ink-600 hover:bg-ink-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="heading-1">AI 创作</h1>
      </div>

      {/* 剧本信息 */}
      <div className="card-paper p-4 mb-5">
        <p className="font-semibold text-ink-900 mb-2">{script.title}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-ink-600">
            <span className="text-base">{script.personaA?.avatar}</span>
            <span className="font-medium">{script.personaA?.name}</span>
          </div>
          <span className="text-ink-400 text-xs font-bold">VS</span>
          <div className="flex items-center gap-1.5 text-sm text-ink-600">
            <span className="text-base">{script.personaB?.avatar}</span>
            <span className="font-medium">{script.personaB?.name}</span>
          </div>
        </div>
      </div>

      {/* 选择 AI 工具 */}
      <div className="mb-5">
        <h2 className="heading-3 mb-3">选择 AI 工具</h2>
        <div className="grid grid-cols-3 gap-3">
          {AI_TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleToolSelect(t.id)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                selectedTool === t.id
                  ? 'border-accent bg-accent/5'
                  : 'border-ink-200/50 bg-paper-50 hover:border-ink-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center mx-auto mb-2">
                <ToolIcon type={t.icon} className="text-paper-100" />
              </div>
              <div className="text-xs font-semibold text-ink-700">{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 选择生成模式 */}
      {tool && modes.length > 0 && (
        <div className="mb-5 animate-slide-up">
          <h2 className="heading-3 mb-3">选择生成模式</h2>
          <div className="space-y-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                  selectedMode === m.id
                    ? 'border-accent bg-accent/5'
                    : 'border-ink-200/50 bg-paper-50 hover:border-ink-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center">
                  <ToolIcon type={m.icon} className="text-ink-600" />
                </div>
                <span className="font-medium text-ink-700">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt 预览/编辑 */}
      {selectedMode && (
        <div className="mb-5 animate-fade-in">
          <h2 className="heading-3 mb-3">生成的 Prompt</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="input-field resize-none font-mono text-sm"
            placeholder="输入 prompt..."
          />
        </div>
      )}

      {/* 发送按钮 */}
      {selectedMode && (
        <Button variant="primary" onClick={handleSendToAI} className="w-full">
          发送到 {tool?.name}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      )}
    </div>
  )
}
