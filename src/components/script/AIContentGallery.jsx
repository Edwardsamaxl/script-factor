import { useState, useEffect } from 'react'
import Button from '../common/Button'

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  }
  const labels = {
    pending: '等待中',
    processing: '生成中',
    success: '成功',
    failed: '失败',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] || styles.pending}`}>
      {labels[status] || status}
    </span>
  )
}

const TypeBadge = ({ type }) => {
  return type === 'video' ? (
    <span className="text-xs px-2 py-0.5 rounded-full bg-ink-900 text-paper-100 font-medium">
      视频
    </span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
      图片
    </span>
  )
}

const PersonaBadge = ({ personaImages, script }) => {
  const names = []
  if (personaImages?.aUrl && script?.personaA?.name) {
    names.push(script.personaA.name)
  }
  if (personaImages?.bUrl && script?.personaB?.name) {
    names.push(script.personaB.name)
  }
  if (names.length === 0) return null

  return (
    <div className="flex gap-1">
      {names.map((name, i) => (
        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
          {name}
        </span>
      ))}
    </div>
  )
}

const PersonaImageCard = ({ persona, imageUrl, onPreview }) => (
  <div className="relative rounded-xl overflow-hidden bg-ink-100 group">
    <div className="cursor-pointer" onClick={onPreview}>
      <img
        src={imageUrl}
        alt={`${persona.name} 人设图`}
        className="w-full h-36 object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/90 text-white font-medium">
              人设图
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 text-ink-700 font-medium">
              {persona.name}
            </span>
          </div>
          <span className="text-white text-xs font-medium">查看</span>
        </div>
      </div>
    </div>
  </div>
)

const ImageCard = ({ result, script, onPreview, onDelete }) => (
  <div className="relative rounded-xl overflow-hidden bg-ink-100 group">
    <div
      className="cursor-pointer"
      onClick={() => onPreview(result)}
    >
      <img
        src={result.resultUrl}
        alt="AI生成内容"
        className="w-full h-36 object-cover transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TypeBadge type={result.type} />
            <PersonaBadge personaImages={result.personaImages} script={script} />
          </div>
          <span className="text-white text-xs font-medium">查看</span>
        </div>
      </div>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(result.id) }}
      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
        <path d="M2 3h8M4 3V2h4v1M3 3v7h6V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </div>
)

const VideoCard = ({ result, script, onPreview, onDelete }) => (
  <div className="relative rounded-xl overflow-hidden bg-ink-100 group">
    <div
      className="cursor-pointer"
      onClick={() => onPreview(result)}
    >
      <video
        src={result.resultUrl}
        className="w-full h-36 object-cover transition-transform duration-200 group-hover:scale-105"
        preload="metadata"
        muted
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-0.5">
            <path d="M4 3l9 5-9 5V3z" fill="currentColor" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        <TypeBadge type={result.type} />
        <PersonaBadge personaImages={result.personaImages} script={script} />
      </div>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(result.id) }}
      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
        <path d="M2 3h8M4 3V2h4v1M3 3v7h6V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </div>
)

const PreviewModal = ({ result, script, onClose, onDelete }) => {
  if (!result) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {result.mode === '人设图' ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/90 text-white font-medium">
                人设图
              </span>
            ) : (
              <>
                <TypeBadge type={result.type} />
                <span className="text-white/60 text-sm">{result.mode}</span>
                <PersonaBadge personaImages={result.personaImages} script={script} />
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {result.mode !== '人设图' && (
              <button
                onClick={() => onDelete(result.id)}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                  <path d="M2 4h10M5 4V3h4v1M3 4v8h8V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 媒体内容 */}
        <div className="flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-black/50">
          {result.type === 'video' ? (
            <video
              src={result.resultUrl}
              controls
              autoPlay
              className="max-w-full max-h-[70vh] rounded-xl"
            />
          ) : (
            <img
              src={result.resultUrl}
              alt="AI生成内容"
              className="max-w-full max-h-[70vh] object-contain rounded-xl"
            />
          )}
        </div>

        {/* Prompt 信息 */}
        <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <p className="text-white/90 text-sm font-mono leading-relaxed break-words">{result.prompt}</p>
        </div>
      </div>
    </div>
  )
}

export default function AIContentGallery({ scriptId, script }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewResult, setPreviewResult] = useState(null)
  const [filter, setFilter] = useState('all')
  const [personaImageMap, setPersonaImageMap] = useState({})

  // Build persona image lookup map from both built-in and user personas
  useEffect(() => {
    async function fetchPersonaImages() {
      try {
        const [builtInRes, userRes] = await Promise.all([
          fetch('/api/personas/built-in'),
          fetch('/api/personas')
        ])
        const builtInData = await builtInRes.json()
        const userData = await userRes.json()
        const map = {}
        if (builtInData.success) {
          builtInData.data.forEach(p => { if (p.imageUrl) map[p.id] = p.imageUrl })
        }
        if (userData.success) {
          userData.data.forEach(p => { if (p.imageUrl) map[p.id] = p.imageUrl })
        }
        setPersonaImageMap(map)
      } catch (e) {
        console.error('Failed to fetch persona images:', e)
      }
    }
    fetchPersonaImages()
  }, [])

  // Resolve persona image: check script data first, then fallback to persona lookup
  const getPersonaImageUrl = (persona) => {
    if (!persona) return null
    return persona.imageUrl || personaImageMap[persona.id] || null
  }

  useEffect(() => {
    if (!scriptId) return

    async function fetchResults() {
      try {
        const res = await fetch(`/api/ai/results?scriptId=${scriptId}`)
        const data = await res.json()
        if (data.success) {
          setResults(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch AI results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchResults, 5000)
    return () => clearInterval(interval)
  }, [scriptId])

  const handleDelete = async (resultId) => {
    try {
      const res = await fetch(`/api/ai/results/${resultId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setResults(prev => prev.filter(r => r.id !== resultId))
        if (previewResult?.id === resultId) {
          setPreviewResult(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete result:', error)
    }
  }

  const filteredResults = results.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  const imageResults = filteredResults.filter(t => t.type === 'image' && t.status === 'success')
  const videoResults = filteredResults.filter(t => t.type === 'video' && t.status === 'success')
  const processingResults = filteredResults.filter(t => t.status !== 'success')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* 筛选栏 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: '全部' },
          { key: 'image', label: '图片' },
          { key: 'video', label: '视频' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-accent text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 角色人设图 */}
      {(getPersonaImageUrl(script.personaA) || getPersonaImageUrl(script.personaB)) && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-purple-500">
              <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3 14c0-2.5 2.5-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            角色人设图
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {script.personaA && getPersonaImageUrl(script.personaA) && (
              <div className="animate-slide-up">
                <PersonaImageCard
                  persona={script.personaA}
                  imageUrl={getPersonaImageUrl(script.personaA)}
                  onPreview={() => setPreviewResult({
                    id: 'persona-a',
                    type: 'image',
                    resultUrl: getPersonaImageUrl(script.personaA),
                    mode: '人设图',
                    personaImages: null,
                    prompt: `${script.personaA.name} 人设图`
                  })}
                />
              </div>
            )}
            {script.personaB && getPersonaImageUrl(script.personaB) && (
              <div className="animate-slide-up" style={{ animationDelay: '60ms' }}>
                <PersonaImageCard
                  persona={script.personaB}
                  imageUrl={getPersonaImageUrl(script.personaB)}
                  onPreview={() => setPreviewResult({
                    id: 'persona-b',
                    type: 'image',
                    resultUrl: getPersonaImageUrl(script.personaB),
                    mode: '人设图',
                    personaImages: null,
                    prompt: `${script.personaB.name} 人设图`
                  })}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 处理中/失败状态 */}
      {processingResults.length > 0 && (
        <div className="mb-4 space-y-2">
          {processingResults.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 group">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${task.type === 'video' ? 'bg-ink-900' : 'bg-accent/10'}`}>
                {task.type === 'video' ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-paper-100">
                    <rect x="2" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5.5 5.5l3 1.5-3 1.5V5.5z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent">
                    <rect x="2" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                    <circle cx="5" cy="5.5" r="0.75" fill="currentColor"/>
                    <path d="M2 9l3-2.5 2.5 1.8 3-3 2 3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800 truncate">{task.mode}</p>
                <p className="text-xs text-ink-400">{task.prompt?.substring(0, 40)}...</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                <button
                  onClick={() => handleDelete(task.id)}
                  className="w-7 h-7 rounded-lg bg-ink-100 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="删除"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-ink-500 hover:text-red-500">
                    <path d="M2 3h8M4 3V2h4v1M3 3v7h6V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink-400">
              <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 12l6 3-6 3V12z" fill="currentColor"/>
            </svg>
          </div>
          <p className="text-ink-500 mb-1">暂无生成内容</p>
          <p className="text-ink-400 text-sm">在剧本详情页点击"AI创作"生成</p>
        </div>
      )}

      {/* 图片网格 */}
      {imageResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="5.5" cy="6" r="1" fill="currentColor"/>
              <path d="M2 10l3.5-3 3 2 3-3 2.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            图片 {imageResults.length}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {imageResults.map((result, index) => (
              <div
                key={result.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <ImageCard
                  result={result}
                  script={script}
                  onPreview={setPreviewResult}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 视频网格 */}
      {videoResults.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink-800">
              <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M6.5 6l3 2-3 2V6z" fill="currentColor"/>
            </svg>
            视频 {videoResults.length}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {videoResults.map((result, index) => (
              <div
                key={result.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <VideoCard
                  result={result}
                  script={script}
                  onPreview={setPreviewResult}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {previewResult && (
        <PreviewModal
          result={previewResult}
          script={script}
          onClose={() => setPreviewResult(null)}
          onDelete={(id) => { handleDelete(id); setPreviewResult(null) }}
        />
      )}
    </div>
  )
}
