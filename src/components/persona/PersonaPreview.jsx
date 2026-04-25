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

      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">核心观点：</span>{persona.coreView}
      </p>

      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">说话风格：</span>{persona.speakingStyle}
      </p>

      <p className="text-sm text-gray-700 mb-2">
        <span className="font-medium">行动风格：</span>{persona.actionStyle}
      </p>

      {persona.background && (
        <p className="text-sm text-gray-700">
          <span className="font-medium">背景故事：</span>{persona.background}
        </p>
      )}
    </div>
  )
}
