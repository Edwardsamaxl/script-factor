import { useState } from 'react'
import Button from '../common/Button'

function EditableField({ label, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  const handleBlur = () => {
    setEditing(false)
    if (draft !== value) {
      onChange(draft)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
    }
    if (e.key === 'Escape') {
      setDraft(value)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm font-medium text-gray-500 mb-2">{label}</label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-3 py-2 border border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={draft.split('\n').length + 1}
        />
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-gray-100 cursor-text" onClick={() => setEditing(true)}>
      <label className="block text-sm font-medium text-gray-500 mb-2">{label}</label>
      <div className="text-sm text-gray-800 whitespace-pre-wrap">{value || '（未填写）'}</div>
    </div>
  )
}

export default function PersonaConfirmStep({ rewritten, onConfirm, onRegenerate, onCancel }) {
  const AVATARS = ['😀', '😎', '🤔', '😅', '😭', '🤣', '🎬', '🎭', '🎨', '🎯', '💡', '🔥', '🌟', '💫']

  const [form, setForm] = useState({ ...rewritten })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm(form)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          AI 已完成人设润色，你可以编辑以下内容进行微调，确认后保存。（点击任意字段即可编辑）
        </p>
      </div>

      {/* 头像选择 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-500 mb-2">头像</label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setForm({ ...form, avatar })}
                className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${
                  form.avatar === avatar ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
        <EditableField label="名称" value={form.name} onChange={(v) => handleChange('name', v)} />
        <EditableField label="核心观点" value={form.coreView} onChange={(v) => handleChange('coreView', v)} />
        <EditableField label="说话风格" value={form.speakingStyle} onChange={(v) => handleChange('speakingStyle', v)} />
        <EditableField label="行动风格" value={form.actionStyle} onChange={(v) => handleChange('actionStyle', v)} />
        <EditableField label="背景故事" value={form.background} onChange={(v) => handleChange('background', v)} />
        <EditableField label="形象描述（用于AI生图）" value={form.imagePrompt} onChange={(v) => handleChange('imagePrompt', v)} />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
          返回修改
        </Button>
        <Button variant="secondary" onClick={onRegenerate} className="flex-1" disabled={isSubmitting}>
          重新生成
        </Button>
        <Button variant="primary" onClick={handleConfirm} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '确认保存'}
        </Button>
      </div>
    </div>
  )
}
