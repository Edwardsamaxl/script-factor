import { useNavigate, useParams } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import PersonaForm from '../components/persona/PersonaForm'
import { useContext } from 'react'
import { UserContext } from '../context/UserContext'

export default function PersonaCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { personas, addPersona, updatePersona, deletePersona, getPersona } = usePersonas()
  const { user } = useContext(UserContext)

  const editingPersona = id ? getPersona(id) : null

  const handleSubmit = (formData) => {
    if (editingPersona) {
      updatePersona(editingPersona.id, formData)
      navigate(`/persona/${editingPersona.id}`)
    } else {
      const newPersona = addPersona({
        ...formData,
        creator: user?.name || '游客',
      })
      navigate(`/persona/${newPersona.id}`)
    }
  }

  const handleDelete = () => {
    if (editingPersona) {
      deletePersona(editingPersona.id)
      navigate('/profile')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
          ←
        </button>
        <h1 className="text-xl font-bold">{editingPersona ? '编辑人设' : '创建人设'}</h1>
      </div>

      <PersonaForm
        initialData={editingPersona}
        onSubmit={handleSubmit}
        onCancel={editingPersona ? () => navigate(-1) : undefined}
      />

      {editingPersona && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            删除人设
          </button>
        </div>
      )}
    </div>
  )
}
