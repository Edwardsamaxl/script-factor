import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import { useScripts } from '../hooks/useScripts'
import PersonaCard from '../components/persona/PersonaCard'
import PersonaPreview from '../components/persona/PersonaPreview'
import SceneSelector from '../components/scene/SceneSelector'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import GenerationProgress from '../components/script/GenerationProgress'

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
  const [personaFilter, setPersonaFilter] = useState('all') // 'all' | 'mine' | 'favorited'
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationRound, setGenerationRound] = useState(0)
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false)
  const [generationError, setGenerationError] = useState(null)
  const generationRef = useRef(false)

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
    // 防止双击/重入
    if (generationRef.current) return
    generationRef.current = true

    setGenerationError(null)
    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationRound(1)

    try {
      // 调用后端 API 生成剧本
      const response = await fetch('/api/scripts/generate-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaA: {
            id: personaA.id,
            name: personaA.name,
            coreView: personaA.coreView,
            speakingStyle: personaA.speakingStyle,
            actionStyle: personaA.actionStyle,
            background: personaA.background,
            imagePrompt: personaA.imagePrompt || '',
          },
          personaB: {
            id: personaB.id,
            name: personaB.name,
            coreView: personaB.coreView,
            speakingStyle: personaB.speakingStyle,
            actionStyle: personaB.actionStyle,
            background: personaB.background,
            imagePrompt: personaB.imagePrompt || '',
          },
          scene: {
            id: scene.id,
            name: scene.name,
            description: scene.description,
            prompt: scene.prompt,
          },
          maxRounds: 10,
        }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        throw new Error(errBody.error || `请求失败 (${response.status})`)
      }

      const { scriptId } = await response.json()

      // 使用 SSE 实时获取进度
      const result = await subscribeToScriptProgress(scriptId)

      if (result) {
        // 对话完成，继续等待故事板和总结版生成
        // 轮询检查是否生成完成
        let finalResult = result
        if (!result.storyboard || !result.summary) {
          const maxWait = 90 // 最多等待90秒
          for (let i = 0; i < maxWait; i++) {
            await new Promise(r => setTimeout(r, 1000))
            const sessionRes = await fetch(`/api/scripts/${scriptId}`)
            const sessionData = await sessionRes.json()
            if (sessionData.result?.storyboard && sessionData.result?.summary) {
              finalResult = sessionData.result
              break
            }
          }
        }

        const newScript = await addScript({
          ...finalResult,
          personaA: {
            id: personaA.id,
            name: personaA.name,
            avatar: personaA.avatar || '',
            coreView: personaA.coreView || '',
            speakingStyle: personaA.speakingStyle || '',
            actionStyle: personaA.actionStyle || '',
            background: personaA.background || '',
            imagePrompt: personaA.imagePrompt || '',
            imageUrl: personaA.imageUrl || '',
          },
          personaB: {
            id: personaB.id,
            name: personaB.name,
            avatar: personaB.avatar || '',
            coreView: personaB.coreView || '',
            speakingStyle: personaB.speakingStyle || '',
            actionStyle: personaB.actionStyle || '',
            background: personaB.background || '',
            imagePrompt: personaB.imagePrompt || '',
            imageUrl: personaB.imageUrl || '',
          },
          scene: { id: scene.id, name: scene.name, description: scene.description || '' },
          creator: '当前用户',
        })

        incrementUsage(personaA.id)
        incrementUsage(personaB.id)

        if (newScript) {
          navigate(`/script/${newScript.id}`)
        } else {
          setGenerationError('剧本保存失败，但生成已完成')
        }
      } else {
        setGenerationError('生成结果为空，请重试')
      }
    } catch (error) {
      console.error('Failed to generate script:', error)
      setGenerationError(error.message || '生成失败，请重试')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationRound(0)
      setIsGeneratingStoryboard(false)
      generationRef.current = false
    }
  }

  // 使用 SSE 实时获取剧本生成进度
  const subscribeToScriptProgress = (scriptId) => {
    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(`/api/scripts/${scriptId}/stream`)

      eventSource.addEventListener('connected', () => {
        console.log('SSE connected')
      })

      eventSource.addEventListener('progress', (event) => {
        const data = JSON.parse(event.data)
        const currentRound = data.round || 1
        const total = data.total || 10
        setGenerationRound(currentRound)
        setGenerationProgress(Math.min(currentRound * 10, 100))
      })

      eventSource.addEventListener('dialogue', (event) => {
        const dialogue = JSON.parse(event.data)
        console.log('New dialogue:', dialogue)
      })

      eventSource.addEventListener('done', (event) => {
        const data = JSON.parse(event.data)
        eventSource.close()
        setGenerationProgress(100)
        // 对话完成，开始等待故事板生成
        setIsGeneratingStoryboard(true)
        resolve(data.result)
      })

      eventSource.addEventListener('error', (event) => {
        eventSource.close()
        try {
          const data = JSON.parse(event.data)
          reject(new Error(data.message || 'Generation failed'))
        } catch {
          reject(new Error('SSE connection error'))
        }
      })

      // 超时处理
      setTimeout(() => {
        eventSource.close()
        reject(new Error('Generation timeout'))
      }, 300000) // 5 分钟超时
    })
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
      {step === 3 && !isGenerating && (
        <div>
          <h2 className="text-lg font-semibold mb-3">第三步：选择场景</h2>

          {/* 生成错误提示 */}
          {generationError && (
            <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {generationError}
              <button
                onClick={() => setGenerationError(null)}
                className="ml-2 text-red-500 hover:text-red-700 font-medium"
              >
                关闭
              </button>
            </div>
          )}

          <SceneSelector selected={scene} onChange={setScene} personaA={personaA} personaB={personaB} />

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
              disabled={!scene}
              className="flex-1"
            >
              开始生成
            </Button>
          </div>
        </div>
      )}

      {/* 生成进度显示 */}
      {step === 3 && isGenerating && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            {isGeneratingStoryboard ? '正在生成故事板...' : '正在生成剧本...'}
          </h2>
          <GenerationProgress
            progress={generationProgress}
            currentRound={isGeneratingStoryboard ? 10 : generationRound}
            animationType="bubbles"
          />
          <p className="text-center text-sm text-gray-500 mt-4">
            {isGeneratingStoryboard
              ? '对话已完成，正在生成故事板...'
              : `${personaA?.name} vs ${personaB?.name} 的对话生成中`}
          </p>
        </div>
      )}

      {/* 人设选择弹窗 */}
      <Modal
        isOpen={showPersonaModal}
        onClose={() => { setShowPersonaModal(false); setSelectingFor(null); }}
        title={`选择人设 ${selectingFor === 'A' ? 'A' : 'B'}`}
      >
        {/* 筛选 Tab */}
        <div className="flex gap-2 mb-3">
          {[
            { key: 'all', label: '全部' },
            { key: 'mine', label: '我的' },
            { key: 'favorited', label: '已收藏' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPersonaFilter(tab.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                personaFilter === tab.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {(() => {
            let filtered = personas
            if (personaFilter === 'mine') {
              filtered = personas.filter(p => p.creator === 'user')
            } else if (personaFilter === 'favorited') {
              filtered = personas.filter(p => p.isFavorited)
            }
            return filtered.length > 0 ? (
              filtered.map((p) => (
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
                <p className="text-gray-500 mb-3">
                  {personaFilter === 'mine' ? '你还没有创建过人设' : personaFilter === 'favorited' ? '你还没有收藏过人设' : '暂没有人设'}
                </p>
                <Button variant="primary" onClick={() => navigate('/persona/create')}>
                  创建人设
                </Button>
              </div>
            )
          })()}
        </div>
      </Modal>
    </div>
  )
}
