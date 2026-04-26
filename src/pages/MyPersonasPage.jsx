import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import PersonaCard from '../components/persona/PersonaCard'
import Button from '../components/common/Button'

const TABS = [
  { key: 'mine', label: '我的' },
  { key: 'favorited', label: '收藏' },
]

export default function MyPersonasPage() {
  const navigate = useNavigate()
  const { personas } = usePersonas()
  const [tab, setTab] = useState('mine')

  const filteredPersonas = personas.filter(p => {
    if (tab === 'mine') return p.creator === 'user'
    if (tab === 'favorited') return p.isFavorited
    return true
  })

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
        {tab === 'mine' && (
          <Link to="/persona/create" className="ml-auto">
            <Button variant="primary" size="sm">+ 创建</Button>
          </Link>
        )}
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-ink-900 text-paper-100'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 人设列表 */}
      {filteredPersonas.length > 0 ? (
        <div className="space-y-3">
          {filteredPersonas.map((persona) => (
            <Link key={persona.id} to={`/persona/${persona.id}`}>
              <PersonaCard persona={persona} showActions={false} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4 mx-auto">
              <span className="text-4xl">{tab === 'mine' ? '👤' : '⭐'}</span>
            </div>
            <p className="empty-state-title">
              {tab === 'mine' ? '还没有人设' : '还没有收藏的人设'}
            </p>
            <p className="empty-state-desc mb-4">
              {tab === 'mine' ? '创建你的人设资产' : '去广场发现更多有趣的人设'}
            </p>
            {tab === 'mine' ? (
              <Link to="/persona/create">
                <Button variant="primary">创建人设</Button>
              </Link>
            ) : (
              <Link to="/persona/square">
                <Button variant="primary">去广场</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
