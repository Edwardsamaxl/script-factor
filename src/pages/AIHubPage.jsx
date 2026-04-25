import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { useAIResults } from '../hooks/useAIResults'
import { usePersonas } from '../hooks/usePersonas'

const StatusIcon = ({ status }) => {
  const icons = {
    pending: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-yellow-500">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5v3l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    processing: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-500 animate-spin" style={{ animationDuration: '2s' }}>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 10"/>
      </svg>
    ),
    success: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-500">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    failed: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  }
  return icons[status] || icons.pending
}

const TypeIcon = ({ type }) => (
  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${type === 'video' ? 'bg-ink-900' : 'bg-accent/10'}`}>
    {type === 'video' ? (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={type === 'video' ? 'text-paper-100' : 'text-accent'}>
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7l4 2-4 2V7z" fill="currentColor"/>
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={type === 'video' ? 'text-paper-100' : 'text-accent'}>
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="6" cy="7" r="1" fill="currentColor"/>
        <path d="M2 12l4-3 3 2 4-4 3 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  </div>
)

const PreviewModal = ({ result, onClose, onDelete }) => {
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
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${result.type === 'video' ? 'bg-ink-900 text-paper-100' : 'bg-accent/20 text-accent'}`}>
              {result.type === 'video' ? '视频' : '图片'}
            </span>
            <span className="text-white/60 text-sm">{result.mode}</span>
          </div>
          <div className="flex items-center gap-2">
            {result.resultUrl && (
              <a
                href={result.resultUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                  <path d="M7 2v7M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            )}
            <button
              onClick={() => { onDelete(result.id); onClose() }}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                <path d="M2 4h10M5 4V3h4v1M3 4v8h8V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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
        {result.prompt && (
          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/90 text-sm font-mono leading-relaxed break-words">{result.prompt}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIHubPage() {
  const navigate = useNavigate()
  const { results, deleteResult, retryTask } = useAIResults()
  const { refreshPersonas } = usePersonas()
  const [filter, setFilter] = useState('all')
  const [previewResult, setPreviewResult] = useState(null)
  const hasRefreshedRef = useRef(false)

  // 当有 persona 模式的任务成功时，刷新 persona 数据（只刷新一次）
  useEffect(() => {
    if (hasRefreshedRef.current) return
    const successPersonaTask = results.find(
      t => t.mode === 'persona' && t.status === 'success' && t.resultUrl
    )
    if (successPersonaTask) {
      hasRefreshedRef.current = true
      refreshPersonas()
    }
  }, [results, refreshPersonas])

  const filteredTasks = results.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'video') return t.type === 'video'
    if (filter === 'image') return t.type === 'image'
    if (filter === 'failed') return t.status === 'failed'
    return true
  })

  const handleRetry = async (resultId) => {
    await retryTask(resultId)
  }

  const handleDelete = async (resultId) => {
    await deleteResult(resultId)
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
        <h1 className="heading-1">创作中心</h1>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: '全部' },
          { key: 'video', label: '视频' },
          { key: 'image', label: '图像' },
          { key: 'failed', label: '失败' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-ink-900 text-paper-100'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div key={task.id} className="card p-4 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TypeIcon type={task.type} />
                  <div>
                    <p className="font-semibold text-ink-800 text-sm">{task.provider}</p>
                    <p className="text-2xs text-ink-400">{task.mode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon status={task.status} />
                  <span className={`text-xs font-medium ${
                    task.status === 'success' ? 'text-green-600' :
                    task.status === 'failed' ? 'text-red-500' :
                    task.status === 'processing' ? 'text-blue-500' : 'text-yellow-600'
                  }`}>
                    {task.status === 'pending' ? '等待中' :
                     task.status === 'processing' ? '处理中' :
                     task.status === 'success' ? '成功' : '失败'}
                  </span>
                </div>
              </div>

              {task.scriptTitle && (
                <p className="text-xs text-ink-500 mb-2">剧本：{task.scriptTitle}</p>
              )}

              {/* 进度条 */}
              {task.status === 'processing' && (
                <div className="w-full bg-ink-100 rounded-full h-1 mb-3">
                  <div className="bg-accent h-1 rounded-full transition-all" style={{ width: '60%' }} />
                </div>
              )}

              {/* 成功结果 */}
              {task.status === 'success' && task.resultUrl && (
                <div
                  className="relative mt-2 mb-3 rounded-lg overflow-hidden bg-ink-100 cursor-pointer group"
                  onClick={() => setPreviewResult(task)}
                >
                  {task.type === 'video' ? (
                    <video
                      src={task.resultUrl}
                      className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
                      preload="metadata"
                      muted
                    />
                  ) : (
                    <img
                      src={task.resultUrl}
                      alt="result"
                      className="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-ink-700">
                        <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* 失败信息 */}
              {task.status === 'failed' && task.error && (
                <p className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-lg">{task.error}</p>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {task.status === 'failed' && (
                  <Button variant="outline" size="sm" onClick={() => handleRetry(task.id)} className="flex-1">
                    重试
                  </Button>
                )}
                {task.resultUrl && (
                  <Button variant="secondary" size="sm" className="flex-1">
                    下载
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4 mx-auto">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-ink-400">
                <rect x="4" y="6" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 12l6 3-6 3V12z" fill="currentColor"/>
              </svg>
            </div>
            <p className="empty-state-title">暂无创作任务</p>
            <p className="empty-state-desc mb-4">开始创作你的第一个作品</p>
            <Button variant="primary" onClick={() => navigate('/')}>去创作剧本</Button>
          </div>
        </div>
      )}

      {/* 预览弹窗 */}
      {previewResult && (
        <PreviewModal
          result={previewResult}
          onClose={() => setPreviewResult(null)}
          onDelete={(id) => { handleDelete(id); setPreviewResult(null) }}
        />
      )}
    </div>
  )
}
