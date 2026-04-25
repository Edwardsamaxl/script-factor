import { Link } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import { useScripts } from '../hooks/useScripts'

export default function ProfilePage() {
  const { personas } = usePersonas()
  const { scripts } = useScripts()

  const myPersonas = personas.filter(p => p.creator === 'user')
  const myScripts = scripts

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 三大板块入口 */}
      <div className="grid grid-cols-1 gap-4">
        {/* 人设 */}
        <Link
          to="/my/personas"
          className="card-elevated p-6 flex items-center gap-4 group hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div className="flex-1">
            <h2 className="heading-3 text-ink-900 mb-1">我的人设</h2>
            <p className="body-small text-ink-500">管理你创建的角色</p>
          </div>
          <div className="text-3xl font-bold text-blue-500">{myPersonas.length}</div>
        </Link>

        {/* 剧本 */}
        <Link
          to="/my/scripts"
          className="card-elevated p-6 flex items-center gap-4 group hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <span className="text-3xl">📝</span>
          </div>
          <div className="flex-1">
            <h2 className="heading-3 text-ink-900 mb-1">我的剧本</h2>
            <p className="body-small text-ink-500">查看所有对话剧本</p>
          </div>
          <div className="text-3xl font-bold text-purple-500">{myScripts.length}</div>
        </Link>

        {/* 创作中心 */}
        <Link
          to="/ai/hub"
          className="card-elevated p-6 flex items-center gap-4 group hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <span className="text-3xl">✨</span>
          </div>
          <div className="flex-1">
            <h2 className="heading-3 text-ink-900 mb-1">创作中心</h2>
            <p className="body-small text-ink-500">AI 生图/视频作品</p>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-400 group-hover:text-ink-600 transition-colors">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}
