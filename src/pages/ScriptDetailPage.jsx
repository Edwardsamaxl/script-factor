import { useParams, useNavigate } from 'react-router-dom'
import { useScripts } from '../hooks/useScripts'
import ScriptViewer from '../components/script/ScriptViewer'
import { useState } from 'react'

export default function ScriptDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getScript, deleteScript } = useScripts()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const script = getScript(id)

  if (!script) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-gray-500 mb-4">剧本不存在</p>
        <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">
          返回首页
        </button>
      </div>
    )
  }

  const handleDelete = () => {
    deleteScript(script.id)
    navigate('/profile')
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">剧本详情</h1>
      </div>

      <ScriptViewer script={script} onDelete={handleDelete} />
    </div>
  )
}
