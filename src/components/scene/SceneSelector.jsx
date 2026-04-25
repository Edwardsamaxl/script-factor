import { useState, useEffect } from 'react'

const EMPTY_CUSTOM = {
  time: '',
  location: '',
  environment: '',
  relations: '',
  supplement: ''
}

const FIELD_LABELS = {
  time: '时间',
  location: '地点',
  environment: '环境',
  relations: '人物关系',
  supplement: '补充'
}

const FIELD_HINTS = {
  time: '如：唐朝、傍晚、深夜、梅雨季节...',
  location: '如：长安街头、破旧茶馆、奢华宫殿...',
  environment: '如：细雨绵绵、烛光摇曳、烈日当空...',
  relations: '如：主仆关系、仇人、陌生人、挚友...',
  supplement: '如：氛围要求、特定道具、剧情触发条件...'
}

const FIELD_DESCRIPTIONS = {
  time: '宏观的时期如唐朝，微观的时间点如傍晚',
  location: '所处场景，周围布置',
  environment: '天气、光影',
  relations: '故事当中不同人物之间的关系',
  supplement: '其他需要说明的设定'
}

export default function SceneSelector({ selected, onChange }) {
  const [scenes, setScenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [customFields, setCustomFields] = useState(EMPTY_CUSTOM)

  useEffect(() => {
    async function loadScenes() {
      try {
        const res = await fetch('/api/scenes')
        const data = await res.json()
        if (data.success) {
          setScenes(data.data)
        }
      } catch (error) {
        console.error('Failed to load scenes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadScenes()
  }, [])

  const handleFieldChange = (field, value) => {
    const updated = { ...customFields, [field]: value }
    setCustomFields(updated)
    emitCustomScene(updated)
  }

  const emitCustomScene = (fields) => {
    const parts = []
    if (fields.time) parts.push(`时间：${fields.time}`)
    if (fields.location) parts.push(`地点：${fields.location}`)
    if (fields.environment) parts.push(`环境：${fields.environment}`)
    if (fields.relations) parts.push(`人物关系：${fields.relations}`)
    if (fields.supplement) parts.push(`补充：${fields.supplement}`)
    const description = parts.join(' | ')
    onChange(description ? {
      id: 'custom',
      name: '自定义场景',
      description,
      fields: { ...fields },
      isCustom: true
    } : { id: 'custom', name: '自定义场景', isCustom: true })
  }

  const handleBuiltInSelect = (scene) => {
    setExpanded(false)
    setCustomFields(EMPTY_CUSTOM)
    onChange(scene)
  }

  const toggleExpand = () => {
    if (expanded) {
      setExpanded(false)
      setCustomFields(EMPTY_CUSTOM)
      onChange(null)
    } else {
      setExpanded(true)
      onChange({ id: 'custom', name: '自定义场景', isCustom: true })
    }
  }

  const isCustomSelected = selected?.isCustom || expanded

  return (
    <div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">加载中...</div>
      ) : (
        <div className="space-y-3">
          {/* 内置场景列表 */}
          <div className="space-y-2">
            {scenes.map((scene) => (
              <label
                key={scene.id}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selected?.id === scene.id && !isCustomSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="scene"
                  checked={selected?.id === scene.id && !isCustomSelected}
                  onChange={() => handleBuiltInSelect(scene)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{scene.name}</div>
                  <div className="text-sm text-gray-500">{scene.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* 自定义场景下拉开关 */}
          <div
            className={`rounded-xl border-2 transition-all ${
              isCustomSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white'
            }`}
          >
            <button
              type="button"
              onClick={toggleExpand}
              className="w-full flex items-center gap-3 p-3"
            >
              <input
                type="radio"
                name="scene"
                checked={isCustomSelected}
                onChange={() => {}}
                className="shrink-0"
              />
              <span className="font-medium text-gray-900 flex-1 text-left">自定义场景</span>
              <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>

            {/* 展开的表单 */}
            {expanded && (
              <div className="px-3 pb-3 space-y-3">
                <div className="h-px bg-gray-200" />
                {['time', 'location', 'environment', 'relations', 'supplement'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {FIELD_LABELS[field]}
                      <span className="text-gray-400 text-xs font-normal ml-1">
                        （{FIELD_DESCRIPTIONS[field]}）
                      </span>
                    </label>
                    {field === 'supplement' ? (
                      <textarea
                        value={customFields[field]}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={FIELD_HINTS[field]}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={customFields[field]}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={FIELD_HINTS[field]}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
