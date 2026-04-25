import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { useLocalStorage } from '../hooks/useLocalStorage'

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

export default function AIHubPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useLocalStorage('scriptstudio_ai_tasks', [])
  const [filter, setFilter] = useState('all')

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true
    if (filter === 'video') return t.type === 'video'
    if (filter === 'image') return t.type === 'image'
    if (filter === 'failed') return t.status === 'failed'
    return true
  })

  const handleRetry = (taskId) => {
    // TODO: 实现重试逻辑
    console.log('Retry task:', taskId)
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
              {task.status === 'success' && task.output?.resultUrl && (
                <div className="mt-2 mb-3 rounded-lg overflow-hidden bg-ink-100">
                  <img
                    src={task.output.resultUrl}
                    alt="result"
                    className="w-full h-28 object-cover"
                  />
                </div>
              )}

              {/* 失败信息 */}
              {task.status === 'failed' && task.output?.error && (
                <p className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded-lg">{task.output.error}</p>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                {task.status === 'failed' && (
                  <Button variant="outline" size="sm" onClick={() => handleRetry(task.id)} className="flex-1">
                    重试
                  </Button>
                )}
                {task.output?.resultUrl && (
                  <Button variant="secondary" size="sm" className="flex-1">
                    下载
                  </Button>
                )}
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
    </div>
  )
}
