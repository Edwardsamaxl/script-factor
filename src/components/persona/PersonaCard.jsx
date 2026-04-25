import { Link } from 'react-router-dom'
import Button from '../common/Button'

export default function PersonaCard({ persona, showActions = true, onUse, onFavorite }) {
  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div className="w-11 h-11 rounded-xl bg-ink-900 flex items-center justify-center text-xl shrink-0">
          {persona.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink-900 truncate text-sm">{persona.name}</h3>
          <p className="text-2xs text-ink-400">@{persona.creator}</p>
        </div>
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {persona.personality.slice(0, 2).map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
        {persona.personality.length > 2 && (
          <span className="tag">+{persona.personality.length - 2}</span>
        )}
      </div>

      {/* 风格描述 */}
      <p className="mt-2.5 text-xs text-ink-500 line-clamp-2 leading-relaxed">
        {persona.speakingStyle}
      </p>

      {/* 统计 */}
      <div className="flex items-center gap-4 mt-auto pt-3 text-2xs text-ink-400">
        <span>{persona.usageCount || 0} 使用</span>
        <span className="text-accent-muted">♥ {persona.likeCount || 0}</span>
      </div>

      {showActions && (
        <div className="flex gap-2 mt-3">
          {onUse && (
            <Button size="sm" variant="primary" onClick={() => onUse(persona)} className="flex-1">
              使用
            </Button>
          )}
          {onFavorite && (
            <Button size="sm" variant="outline" onClick={() => onFavorite(persona.id)} className="px-2.5">
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
