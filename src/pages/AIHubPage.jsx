import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { useLocalStorage } from '../hooks/useLocalStorage'

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'processing': return '🔄'
      case 'success': return '✅'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600'
      case 'processing': return 'text-blue-600'
      case 'success': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">创作中心</h1>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: '全部' },
          { key: 'video', label: '🎬 视频' },
          { key: 'image', label: '🖼️ 图像' },
          { key: 'failed', label: '❌ 失败' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 任务列表 */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{task.type === 'video' ? '🎬' : '🖼️'}</span>
                  <div>
                    <p className="font-medium text-gray-900">{task.provider}</p>
                    <p className="text-xs text-gray-500">{task.mode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{getStatusIcon(task.status)}</span>
                  <span className={`text-sm ${getStatusColor(task.status)}`}>{task.status}</span>
                </div>
              </div>

              {task.scriptTitle && (
                <p className="text-sm text-gray-600 mb-2">剧本：{task.scriptTitle}</p>
              )}

              {task.status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }} />
                </div>
              )}

              {task.status === 'success' && task.output?.resultUrl && (
                <div className="mt-2">
                  <img
                    src={task.output.resultUrl}
                    alt="result"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {task.status === 'failed' && task.output?.error && (
                <p className="text-sm text-red-500 mt-2">错误：{task.output.error}</p>
              )}

              <div className="flex gap-2 mt-3">
                {task.status === 'failed' && (
                  <Button variant="outline" size="sm" className="flex-1">
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
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-gray-500 mb-4">暂无创作任务</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            去创作剧本
          </Button>
        </div>
      )}
    </div>
  )
}
