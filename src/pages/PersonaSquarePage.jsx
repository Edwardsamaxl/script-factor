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
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">人设广场</h1>
      </div>

      {/* 搜索 */}
      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索人设..."
          className="w-full px-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 筛选 Tab */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: '全部' },
          { key: 'hot', label: '🔥 热门' },
          { key: 'new', label: '✨ 最新' },
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

      {/* 人设列表 */}
      <div className="space-y-3">
        {filteredPersonas.length > 0 ? (
          filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onUse={handleUse}
              onFavorite={toggleFavorite}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500">暂无匹配的人设</p>
          </div>
        )}
      </div>
    </div>
  )
}
