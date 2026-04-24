import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useScripts } from '../hooks/useScripts'
import Button from '../components/common/Button'
import { buildVideoPrompt, buildImagePrompt } from '../utils/promptBuilder'

const AI_TOOLS = [
  { id: 'seedance', name: 'Seedance', icon: '🎬', type: 'video', description: 'AI 视频生成' },
  { id: 'gpt-image', name: 'GPT Image', icon: '🖼️', type: 'image', description: 'AI 图像生成' },
  { id: 'flux', name: 'Flux', icon: '✨', type: 'image', description: '高质量图像生成' },
]

const MODES = {
  video: [
    { id: 'cover', name: '生成视频封面', icon: '🎞️' },
    { id: 'storyboard', name: '生成分镜图', icon: '🎬' },
  ],
  image: [
    { id: 'cover', name: '生成场景图', icon: '🖼️' },
    { id: 'characterA', name: '生成分镜图', icon: '👤' },
    { id: 'characterB', name: '角色图 B', icon: '👤' },
  ],
}

export default function AICreatePage() {
  const { scriptId } = useParams()
  const navigate = useNavigate()
  const { getScript } = useScripts()

  const script = getScript(scriptId)

  const [selectedTool, setSelectedTool] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)
  const [prompt, setPrompt] = useState('')

  if (!script) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-gray-500 mb-4">剧本不存在</p>
        <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">
          返回首页
        </button>
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
    // 生成默认 prompt
    if (tool?.type === 'video') {
      setPrompt(buildVideoPrompt(script, modeId))
    } else if (tool?.type === 'image') {
      setPrompt(buildImagePrompt(script, modeId))
    }
  }

  const handleSendToAI = () => {
    if (!prompt) return

    // 构建跳转 URL（这里只是示例，实际应根据各平台接口调整）
    const encodedPrompt = encodeURIComponent(prompt)

    if (selectedTool === 'seedance') {
      // Seedance 的 URL 格式（示例）
      window.open(`https://seedance.ai/create?prompt=${encodedPrompt}`, '_blank')
    } else if (selectedTool === 'gpt-image') {
      // GPT Image 的 URL 格式（示例）
      window.open(`https://chat.openai.com/?prompt=${encodedPrompt}`, '_blank')
    } else if (selectedTool === 'flux') {
      // Flux 的 URL 格式（示例）
      window.open(`https://flux.ai/create?prompt=${encodedPrompt}`, '_blank')
    }

    // 跳转到创作中心
    navigate('/ai/hub')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">AI 创作</h1>
      </div>

      {/* 剧本信息 */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 mb-4">
        <p className="font-semibold text-gray-900 mb-1">{script.title}</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{script.personaA?.avatar} {script.personaA?.name}</span>
          <span className="text-gray-400">vs</span>
          <span>{script.personaB?.avatar} {script.personaB?.name}</span>
        </div>
      </div>

      {/* 选择 AI 工具 */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">选择 AI 工具</h2>
        <div className="grid grid-cols-3 gap-2">
          {AI_TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleToolSelect(t.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedTool === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <div className="text-xs font-medium">{t.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 选择生成模式 */}
      {tool && modes.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">选择生成模式</h2>
          <div className="space-y-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedMode === m.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="font-medium">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt 预览/编辑 */}
      {selectedMode && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">生成的 Prompt</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      {/* 发送按钮 */}
      {selectedMode && (
        <Button variant="primary" onClick={handleSendToAI} className="w-full">
          发送到 {tool?.name} →
        </Button>
      )}
    </div>
  )
}
