import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import { useScripts } from '../hooks/useScripts'
import PersonaCard from '../components/persona/PersonaCard'
import PersonaPreview from '../components/persona/PersonaPreview'
import SceneSelector from '../components/scene/SceneSelector'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { buildScriptPrompt } from '../utils/promptBuilder'
import { parseScriptResponse } from '../utils/scriptParser'

export default function ScriptCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { personas, getPersona, incrementUsage } = usePersonas()
  const { addScript } = useScripts()

  const [step, setStep] = useState(1)
  const [personaA, setPersonaA] = useState(null)
  const [personaB, setPersonaB] = useState(null)
  const [scene, setScene] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [selectingFor, setSelectingFor] = useState(null) // 'A' or 'B'

  // 初始化：如果 URL 中有 personaA 参数
  useEffect(() => {
    const personaAId = searchParams.get('personaA')
    if (personaAId) {
      const p = getPersona(personaAId)
      if (p) setPersonaA(p)
    }
  }, [searchParams, getPersona])

  const selectPersona = (persona) => {
    if (selectingFor === 'A') {
      setPersonaA(persona)
    } else {
      setPersonaB(persona)
    }
    setShowPersonaModal(false)
    setSelectingFor(null)
  }

  const handleGenerate = async () => {
    if (!personaA || !personaB || !scene) return

    setIsGenerating(true)

    try {
      const prompt = buildScriptPrompt(personaA, personaB, scene)

      // 模拟 AI 生成（实际项目中应调用 LLM API）
      // 这里用 setTimeout 模拟网络请求
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 模拟生成的剧本
      const mockResponse = {
        title: `${personaA.name} vs ${personaB.name}：${scene.name}`,
        dialogues: [
          { speaker: 'A', content: `${personaA.speakingStyle.split('，')[0]}...这个问题我觉得很有意思。` },
          { speaker: 'B', content: `${personaB.speakingStyle.split('，')[0]}...嗯，我倒是有些不同的看法。` },
          { speaker: 'A', content: `你说的有道理，但我觉得核心问题在于...` },
          { speaker: 'B', content: `话虽如此，但是我们也要考虑到...` },
          { speaker: 'A', content: `这正是我想说的！让我们深入探讨一下。` },
          { speaker: 'B', content: `好吧，我承认你说的有几分道理。` },
          { speaker: 'A', content: `所以最终我们的共识是...` },
          { speaker: 'B', content: `不完全是，但我们可以求同存异。` },
        ],
      }

      const parsedScript = parseScriptResponse(JSON.stringify(mockResponse))

      if (parsedScript) {
        const newScript = addScript({
          ...parsedScript,
          personaA: { id: personaA.id, name: personaA.name, avatar: personaA.avatar, speakingStyle: personaA.speakingStyle },
          personaB: { id: personaB.id, name: personaB.name, avatar: personaB.avatar, speakingStyle: personaB.speakingStyle },
          scene: { id: scene.id, name: scene.name, description: scene.description },
          creator: '当前用户',
        })

        incrementUsage(personaA.id)
        incrementUsage(personaB.id)

        navigate(`/script/${newScript.id}`)
      }
    } catch (error) {
      console.error('Failed to generate script:', error)
      alert('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">创作剧本</h1>
      </div>

      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1">
            <div
              className={`h-1 rounded-full transition-colors ${
                s <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
            <p className={`text-xs mt-1 ${s <= step ? 'text-blue-500' : 'text-gray-400'}`}>
              {s === 1 ? '选择人设A' : s === 2 ? '选择人设B' : '选择场景'}
            </p>
          </div>
        ))}
      </div>

      {/* 步骤 1: 选择人设 A */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">第一步：选择人设 A</h2>
          {personaA ? (
            <div>
              <PersonaPreview persona={personaA} />
              <Button variant="secondary" onClick={() => { setPersonaA(null); setSelectingFor('A'); setShowPersonaModal(true); }} className="mt-3 w-full">
                重新选择
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => { setSelectingFor('A'); setShowPersonaModal(true); }} className="w-full">
              + 选择人设 A
            </Button>
          )}
          {personaA && (
            <Button variant="primary" onClick={() => setStep(2)} className="mt-4 w-full">
              下一步 →
            </Button>
          )}
        </div>
      )}

      {/* 步骤 2: 选择人设 B */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">第二步：选择人设 B</h2>
          {personaB ? (
            <div>
              <PersonaPreview persona={personaB} />
              <Button variant="secondary" onClick={() => { setPersonaB(null); setSelectingFor('B'); setShowPersonaModal(true); }} className="mt-3 w-full">
                重新选择
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => { setSelectingFor('B'); setShowPersonaModal(true); }} className="w-full">
              + 选择人设 B
            </Button>
          )}
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              ← 返回
            </Button>
            {personaB && (
              <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
                下一步 →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 步骤 3: 选择场景 */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">第三步：选择场景</h2>
          <SceneSelector selected={scene} onChange={setScene} />

          {/* 匹配度预览 */}
          {personaA && personaB && scene && (
            <div className="mt-4 bg-yellow-50 rounded-xl p-3">
              <p className="text-sm text-yellow-800">
                ⚡ {personaA.name} 和 {personaB.name} 性格差异较大，可能产生有趣的碰撞！
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
              ← 返回
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={!scene || isGenerating}
              className="flex-1"
            >
              {isGenerating ? '生成中...' : '开始生成'}
            </Button>
          </div>
        </div>
      )}

      {/* 人设选择弹窗 */}
      <Modal
        isOpen={showPersonaModal}
        onClose={() => { setShowPersonaModal(false); setSelectingFor(null); }}
        title={`选择人设 ${selectingFor === 'A' ? 'A' : 'B'}`}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {personas.length > 0 ? (
            personas.map((p) => (
              <div
                key={p.id}
                onClick={() => selectPersona(p)}
                className="cursor-pointer"
              >
                <PersonaCard persona={p} showActions={false} />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">还没有人设</p>
              <Button variant="primary" onClick={() => navigate('/persona/create')}>
                创建人设
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
