import { Link } from 'react-router-dom'

export default function ScriptCard({ script }) {
  const formatDate = (ts) => {
    const d = new Date(ts)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  const lineCount = script.totalLines || script.dialogues?.length || 0

  return (
    <Link to={`/script/${script.id}`} className="block group">
      <div className="card p-4 transition-all duration-200 group-hover:shadow-lifted group-hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-ink-900 truncate flex-1 text-sm leading-snug">
            {script.title}
          </h3>
          <span className="text-2xs text-ink-400 shrink-0">{formatDate(script.createdAt)}</span>
        </div>

        {/* 角色对决 */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-900 text-paper-100">
            <span className="text-base">{script.personaA?.avatar}</span>
            <span className="text-2xs font-medium">{script.personaA?.name}</span>
          </div>
          <span className="text-ink-400 text-xs font-medium">VS</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-100 text-ink-700">
            <span className="text-base">{script.personaB?.avatar}</span>
            <span className="text-2xs font-medium">{script.personaB?.name}</span>
          </div>
        </div>

        {/* 场景和统计 */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
          <div className="flex items-center gap-2">
            <span className="tag">{script.scene?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-2xs text-ink-400">
            <span>{lineCount} 轮</span>
            <span>约 {script.wordCount || 0} 字</span>
          </div>
        </div>

        {/* 预览 */}
        {script.dialogues?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-ink-100 space-y-1.5">
            {script.dialogues.slice(0, 2).map((d, i) => {
              const speaker = d.speaker === 'A' ? script.personaA?.name : script.personaB?.name
              return (
                <p key={i} className="text-xs text-ink-500 truncate">
                  <span className="font-medium text-ink-600">{speaker}：</span>
                  {d.content}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </Link>
  )
}
