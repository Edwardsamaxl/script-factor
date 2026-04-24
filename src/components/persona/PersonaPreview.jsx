export default function PersonaPreview({ persona }) {
  if (!persona) return null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm">
          {persona.avatar}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{persona.name}</h3>
          <p className="text-xs text-gray-500">@{persona.creator}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {persona.personality.map((tag) => (
          <span key={tag} className="px-2 py-0.5 bg-white/80 text-blue-700 text-xs rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">说话风格：</span>{persona.speakingStyle}
      </p>

      <div className="text-sm text-gray-700">
        <span className="font-medium">核心观点：</span>
        <ul className="mt-1 space-y-1">
          {persona.views.slice(0, 3).map((view, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-blue-500">•</span>
              <span>{view}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
