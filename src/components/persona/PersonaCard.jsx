import { Link } from 'react-router-dom'
import Button from '../common/Button'

export default function PersonaCard({ persona, showActions = true, onUse, onFavorite }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
          {persona.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{persona.name}</h3>
          <p className="text-xs text-gray-500">@{persona.creator}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {persona.personality.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{persona.speakingStyle}</p>

      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <span>使用 {persona.usageCount || 0} 次</span>
        <span>♥ {persona.likeCount || 0}</span>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3">
          {onUse && (
            <Button size="sm" variant="primary" onClick={() => onUse(persona)} className="flex-1">
              使用
            </Button>
          )}
          {onFavorite && (
            <Button size="sm" variant="outline" onClick={() => onFavorite(persona.id)}>
              {persona.isFavorited ? '♥' : '♡'}
            </Button>
          )}
          <Link to={`/persona/${persona.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              详情
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
