import { useState } from 'react'
import Button from '../common/Button'
import TagInput from '../common/TagInput'

const AVATARS = ['😀', '😎', '🤔', '😅', '😭', '🤣', '🎬', '🎭', '🎨', '🎯', '💡', '🔥', '🌟', '💫', '🎭']

export default function PersonaForm({ initialData, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    avatar: initialData?.avatar || AVATARS[0],
    personality: initialData?.personality || [],
    speakingStyle: initialData?.speakingStyle || '',
    views: initialData?.views || ['', '', ''],
    background: initialData?.background || '',
    isPublic: initialData?.isPublic ?? true,
  })

  const handleSubmit = () => {
    if (!form.name.trim()) return
    onSubmit({
      ...form,
      personality: form.personality.filter(Boolean),
      views: form.views.filter((v) => v.trim()),
    })
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
        <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="如：毒舌影评人老王"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 性格标签 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">性格标签</label>
        <TagInput
          tags={form.personality}
          onChange={(tags) => setForm({ ...form, personality: tags })}
          placeholder="输入后回车添加标签"
        />
      </div>

      {/* 说话风格 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">说话风格</label>
        <textarea
          value={form.speakingStyle}
          onChange={(e) => setForm({ ...form, speakingStyle: e.target.value })}
          placeholder="如：直接犀利，喜欢用比喻和反讽"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* 核心观点 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">核心观点（3-5条）</label>
        {form.views.map((view, i) => (
          <input
            key={i}
            type="text"
            value={view}
            onChange={(e) => {
              const views = [...form.views]
              views[i] = e.target.value
              setForm({ ...form, views })
            }}
            placeholder={`观点 ${i + 1}`}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
        ))}
        {form.views.length < 5 && (
          <button
            type="button"
            onClick={() => setForm({ ...form, views: [...form.views, ''] })}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            + 添加观点
          </button>
        )}
      </div>

      {/* 背景故事 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">背景故事（选填）</label>
        <textarea
          value={form.background}
          onChange={(e) => setForm({ ...form, background: e.target.value })}
          placeholder="简单描述这个角色的背景..."
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
          disabled={!form.name.trim() || isLoading}
          className="flex-1"
        >
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  )
}
