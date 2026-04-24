import { useState } from 'react'

export default function TagInput({ tags, onChange, placeholder = '输入后回车添加', maxTags = 10 }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      if (tags.length < maxTags) {
        onChange([...tags, input.trim()])
        setInput('')
      }
    }
  }

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            {tag}
            <button onClick={() => removeTag(i)} className="hover:text-blue-900">
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
