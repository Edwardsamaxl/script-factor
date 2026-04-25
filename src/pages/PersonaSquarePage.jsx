import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import PersonaCard from '../components/persona/PersonaCard'

export default function PersonaSquarePage() {
  const navigate = useNavigate()
  const { personas, toggleFavorite } = usePersonas()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredPersonas = personas.filter((p) => {
    if (filter === 'hot') return p.usageCount > 50
    if (filter === 'new') return Date.now() - p.createdAt < 86400000 * 7
    return p.isPublic !== false
  }).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.personality.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  )

  const handleUse = (persona) => {
    navigate(`/script/create?personaA=${persona.id}`)
  }

  return (
    <div className="animate-fade-in">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-ink-100 flex items-center justify-center text-ink-600 hover:bg-ink-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="heading-1">人设广场</h1>
      </div>

      {/* 搜索 */}
      <div className="mb-5">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
            width="16" height="16" viewBox="0 0 16 16" fill="none"
          >
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索人设..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* 筛选 Tab */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: '全部' },
          { key: 'hot', label: '热门' },
          { key: 'new', label: '最新' },
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

      {/* 人设列表 */}
      <div className="space-y-3">
        {filteredPersonas.length > 0 ? (
          filteredPersonas.map((persona, index) => (
            <div key={persona.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
              <PersonaCard
                persona={persona}
                onUse={handleUse}
                onFavorite={toggleFavorite}
              />
            </div>
          ))
        ) : (
          <div className="card p-12">
            <div className="empty-state">
              <div className="w-14 h-14 rounded-xl bg-ink-100 flex items-center justify-center mb-3 mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-400">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="empty-state-title">暂无匹配的人设</p>
              <p className="empty-state-desc">试试其他关键词</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
