import { useNavigate, useParams } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import PersonaForm from '../components/persona/PersonaForm'
import { useState } from 'react'
import { UserContext } from '../context/UserContext'
import { useContext } from 'react'

export default function PersonaCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { personas, addPersona, updatePersona, deletePersona, getPersona } = usePersonas()
  const { user } = useContext(UserContext)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const editingPersona = id ? getPersona(id) : null

  const handleSubmit = async (formData) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (editingPersona) {
        await updatePersona(editingPersona.id, formData)
        navigate(`/persona/${editingPersona.id}`)
      } else {
        const newPersona = await addPersona({
          ...formData,
          creator: user?.name || '游客',
        })
        if (newPersona) {
          navigate(`/persona/${newPersona.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to save persona:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editingPersona || isDeleting) return
    setIsDeleting(true)

    try {
      const success = await deletePersona(editingPersona.id)
      if (success) {
        navigate('/profile')
      }
    } catch (error) {
      console.error('Failed to delete persona:', error)
    } finally {
      setIsDeleting(false)
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
        isLoading={isSubmitting}
      />

      {editingPersona && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {isDeleting ? '删除中...' : '删除人设'}
          </button>
        </div>
      )}
    </div>
  )
}
