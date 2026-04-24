import { useState } from 'react'
import { builtInScenes } from '../../data/scenes'

export default function SceneSelector({ selected, onChange }) {
  const [customScene, setCustomScene] = useState('')

  return (
    <div>
      <div className="space-y-2">
        {builtInScenes.map((scene) => (
          <label
            key={scene.id}
            className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              selected?.id === scene.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <input
              type="radio"
              name="scene"
              checked={selected?.id === scene.id}
              onChange={() => onChange(scene)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{scene.name}</div>
              <div className="text-sm text-gray-500">{scene.description}</div>
            </div>
          </label>
        ))}

        {/* 自定义场景 */}
        <label
          className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
            selected?.isCustom
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <input
            type="radio"
            name="scene"
            checked={selected?.isCustom === true}
            onChange={() => onChange({ id: 'custom', name: '自定义', isCustom: true })}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium text-gray-900">自定义场景</div>
            <textarea
              value={customScene}
              onChange={(e) => {
                setCustomScene(e.target.value)
                if (e.target.value) {
                  onChange({ id: 'custom', name: '自定义', description: e.target.value, isCustom: true })
                }
              }}
              placeholder="描述你的场景..."
              rows={2}
              className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </label>
      </div>
    </div>
  )
}
