import { createContext, useState, useEffect } from 'react'

export const ScriptContext = createContext(null)

const API_BASE = '/api'

export function ScriptProvider({ children }) {
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)

  // 从后端加载剧本
  useEffect(() => {
    async function loadScripts() {
      try {
        const res = await fetch(`${API_BASE}/scripts`)
        const data = await res.json()
        if (data.success) {
          setScripts(data.data)
        }
      } catch (error) {
        console.error('Failed to load scripts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadScripts()
  }, [])

  const addScript = async (script) => {
    // 剧本已在后端自动保存（multiTurnGenerator.js）
    // 此处只更新前端状态
    const newScript = {
      ...script,
      id: script.id || `script-${Date.now()}`,
      createdAt: script.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    setScripts(prev => [newScript, ...prev])
    return newScript
  }

  const updateScript = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/scripts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (data.success) {
        setScripts(prev =>
          prev.map(s => s.id === id ? data.data : s)
        )
        return data.data
      }
    } catch (error) {
      console.error('Failed to update script:', error)
    }
    return null
  }

  const deleteScript = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/scripts/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setScripts(prev => prev.filter(s => s.id !== id))
        return true
      }
    } catch (error) {
      console.error('Failed to delete script:', error)
    }
    return false
  }

  const getScript = (id) => scripts.find(s => s.id === id)

  return (
    <ScriptContext.Provider value={{ scripts, loading, addScript, updateScript, deleteScript, getScript }}>
      {children}
    </ScriptContext.Provider>
  )
}
