import { useNavigate, useParams } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import PersonaPreview from '../components/persona/PersonaPreview'
import Button from '../components/common/Button'

export default function PersonaDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getPersona, deletePersona } = usePersonas()

  const persona = getPersona(id)

  if (!persona) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">人设不存在</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">人设详情</h1>
      </div>

      <PersonaPreview persona={persona} />

      {persona.background && (
        <div className="mt-4 bg-gray-50 rounded-xl p-4">
          <h3 className="font-medium text-gray-900 mb-2">背景故事</h3>
          <p className="text-sm text-gray-600">{persona.background}</p>
        </div>
      )}

      {persona.exampleDialogs?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">示例对话</h3>
          <div className="space-y-2">
            {persona.exampleDialogs.map((dialog) => (
              <div
                key={dialog.id}
                className={`p-3 rounded-xl ${
                  dialog.role === 'user' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">
                  {dialog.role === 'user' ? '你' : persona.name}：
                </p>
                <p className="text-sm text-gray-700">{dialog.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={() => navigate(-1)} className="flex-1">
          返回
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate(`/script/create?personaA=${persona.id}`)}
          className="flex-1"
        >
          使用此人设
        </Button>
        {persona.creator === 'user' && (
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm(`确定要删除人设「${persona.name}」吗？此操作不可撤销。`)) return
              const ok = await deletePersona(persona.id)
              if (ok) navigate(-1)
            }}
            className="px-3"
          >
            删除
          </Button>
        )}
      </div>
    </div>
  )
}
