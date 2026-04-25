import { useNavigate, useParams } from 'react-router-dom'
import { usePersonas } from '../hooks/usePersonas'
import PersonaForm from '../components/persona/PersonaForm'
import PersonaConfirmStep from '../components/persona/PersonaConfirmStep'
import { useState } from 'react'
import { UserContext } from '../context/UserContext'
import { useContext } from 'react'

const API_BASE = '/api'

export default function PersonaCreatePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { personas, addPersona, updatePersona, deletePersona, getPersona } = usePersonas()
  const { user } = useContext(UserContext)

  // 页面状态：'form' | 'confirm' | 'loading'
  const [pageState, setPageState] = useState('form')
  const [rewritten, setRewritten] = useState(null)
  const [error, setError] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const editingPersona = id ? getPersona(id) : null

  // Step 1: 用户提交表单原始数据 → 调用 rewrite
  const handleFormSubmit = async (formData) => {
    setError(null)
    setPageState('loading')

    try {
      const res = await fetch(`${API_BASE}/personas/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (data.success) {
        setRewritten(data.data)
        setPageState('confirm')
      } else {
        setError(data.error || '润色失败，请重试')
        setPageState('form')
      }
    } catch (err) {
      console.error('Rewrite error:', err)
      setError('网络错误，请重试')
      setPageState('form')
    }
  }

  // Step 2: 用户确认 → 保存
  const handleConfirm = async (confirmedData) => {
    setIsSubmitting(true)
    try {
      let savedPersona

      if (editingPersona) {
        savedPersona = await updatePersona(editingPersona.id, confirmedData)
      } else {
        savedPersona = await addPersona({
          ...confirmedData,
          creator: user?.name || '游客',
        })
      }

      if (!savedPersona) {
        throw new Error('Failed to save persona')
      }

      navigate(`/persona/${savedPersona.id}`)
    } catch (err) {
      console.error('Failed to save persona:', err)
      setIsSubmitting(false)
    }
  }

  // Step 3: 用户要求重新生成
  const handleRegenerate = async () => {
    if (!rewritten) return
    setPageState('loading')

    try {
      const res = await fetch(`${API_BASE}/personas/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rewritten.name,
          coreView: rewritten.coreView,
          speakingStyle: rewritten.speakingStyle,
          actionStyle: rewritten.actionStyle,
          background: rewritten.background,
        })
      })
      const data = await res.json()

      if (data.success) {
        setRewritten(data.data)
        setPageState('confirm')
      } else {
        setError(data.error || '重新生成失败，请重试')
        setPageState('confirm')
      }
    } catch (err) {
      console.error('Regenerate error:', err)
      setError('网络错误，请重试')
      setPageState('confirm')
    }
  }

  // Step 4: 用户取消确认，返回表单继续修改
  const handleCancel = () => {
    setRewritten(null)
    setPageState('form')
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
        <h1 className="text-xl font-bold">
          {editingPersona ? '编辑人设' : '创建人设'}
        </h1>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700 font-medium"
          >
            关闭
          </button>
        </div>
      )}

      {/* 加载中状态 */}
      {pageState === 'loading' && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">正在使用 AI 润色人设...</p>
        </div>
      )}

      {/* 表单填写阶段 */}
      {pageState === 'form' && (
        <>
          <PersonaForm
            initialData={editingPersona}
            onSubmit={handleFormSubmit}
            onCancel={editingPersona ? () => navigate(-1) : undefined}
            isLoading={false}
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
        </>
      )}

      {/* 确认预览阶段 */}
      {pageState === 'confirm' && rewritten && (
        <PersonaConfirmStep
          rewritten={rewritten}
          onConfirm={handleConfirm}
          onRegenerate={handleRegenerate}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
