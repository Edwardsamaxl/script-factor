import { Link } from 'react-router-dom'

export default function ScriptCard({ script }) {
  const formatDate = (ts) => {
    const d = new Date(ts)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  return (
    <Link to={`/script/${script.id}`}>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1">{script.title}</h3>
          <span className="text-xs text-gray-400 ml-2">{formatDate(script.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{script.personaA?.avatar}</span>
          <span className="text-gray-300">vs</span>
          <span>{script.personaB?.avatar}</span>
          <span className="text-gray-300">|</span>
          <span>{script.scene?.name}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{script.totalLines || script.dialogues?.length || 0} 轮对话</span>
          <span>约 {script.wordCount || 0} 字</span>
        </div>

        {/* 预览前两句对话 */}
        {script.dialogues?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            {script.dialogues.slice(0, 2).map((d, i) => {
              const speaker = d.speaker === 'A' ? script.personaA?.name : script.personaB?.name
              return (
                <p key={i} className="text-sm text-gray-600 truncate">
                  <span className="font-medium text-gray-900">{speaker}：</span>
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
