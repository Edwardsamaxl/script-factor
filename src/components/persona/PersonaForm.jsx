import { useState } from 'react'
import Button from '../common/Button'

const AVATARS = ['😀', '😎', '🤔', '😅', '😭', '🤣', '🎬', '🎭', '🎨', '🎯', '💡', '🔥', '🌟', '💫']

export default function PersonaForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    avatar: initialData?.avatar || AVATARS[0],
    coreView: initialData?.coreView || '',        // 核心观点（必填）
    speakingStyle: initialData?.speakingStyle || '', // 说话风格（必填）
    actionStyle: initialData?.actionStyle || '',    // 行动风格（必填）
    background: initialData?.background || '',      // 背景故事
    isPublic: initialData?.isPublic ?? true,
  })

  const handleSubmit = () => {
    if (!form.name.trim() || !form.coreView.trim() || !form.speakingStyle.trim() || !form.actionStyle.trim()) return
    onSubmit(form)
  }

  return (
    <div className="space-y-4">
      {/* 头像选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">选择头像</label>
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

      {/* 名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="如：毒舌影评人老王"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 核心观点（必填） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          核心观点 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.coreView}
          onChange={(e) => setForm({ ...form, coreView: e.target.value })}
          placeholder="这个角色坚信什么？主要立场和观点是？"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 说话风格（必填） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          说话风格 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.speakingStyle}
          onChange={(e) => setForm({ ...form, speakingStyle: e.target.value })}
          placeholder="方言、口头禅、语气特点等"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 行动风格（必填） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          行动风格 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.actionStyle}
          onChange={(e) => setForm({ ...form, actionStyle: e.target.value })}
          placeholder="小动作、习惯性动作、行为模式等"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 背景故事 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">背景故事</label>
        <textarea
          value={form.background}
          onChange={(e) => setForm({ ...form, background: e.target.value })}
          placeholder="性格、长相、身份、年龄等描述..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 发布选项 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={form.isPublic}
          onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
          className="w-4 h-4 text-blue-500"
        />
        <label htmlFor="isPublic" className="text-sm text-gray-700">发布到广场（其他人可见）</label>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            取消
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!form.name.trim() || !form.coreView.trim() || !form.speakingStyle.trim() || !form.actionStyle.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  )
}
