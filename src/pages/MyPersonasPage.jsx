import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { usePersonas } from '../hooks/usePersonas'
import PersonaCard from '../components/persona/PersonaCard'
import Button from '../components/common/Button'

export default function MyPersonasPage() {
  const navigate = useNavigate()
  const { personas } = usePersonas()

  const myPersonas = personas.filter(p => p.creator === 'user')

  // 页面加载时滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="animate-fade-in">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center text-ink-600 hover:bg-ink-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="heading-1">我的人设</h1>
        <Link to="/persona/create" className="ml-auto">
          <Button variant="primary" size="sm">+ 创建</Button>
        </Link>
      </div>

      {/* 人设列表 */}
      {myPersonas.length > 0 ? (
        <div className="space-y-3">
          {myPersonas.map((persona) => (
            <Link key={persona.id} to={`/persona/${persona.id}`}>
              <PersonaCard persona={persona} showActions={false} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4 mx-auto">
              <span className="text-4xl">👤</span>
            </div>
            <p className="empty-state-title">还没有人设</p>
            <p className="empty-state-desc mb-4">创建你的人设资产</p>
            <Link to="/persona/create">
              <Button variant="primary">创建人设</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
