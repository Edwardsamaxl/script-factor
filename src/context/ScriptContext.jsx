import { createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export const ScriptContext = createContext(null)

export function ScriptProvider({ children }) {
  const [scripts, setScripts] = useLocalStorage('scriptstudio_scripts', [])

  const addScript = (script) => {
    const newScript = {
      ...script,
      id: `script-${Date.now()}`,
      createdAt: Date.now(),
    }
    setScripts((prev) => [newScript, ...prev])
    return newScript
  }

  const updateScript = (id, updates) => {
    setScripts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const deleteScript = (id) => {
    setScripts((prev) => prev.filter((s) => s.id !== id))
  }

  const getScript = (id) => scripts.find((s) => s.id === id)

  return (
    <ScriptContext.Provider value={{ scripts, addScript, updateScript, deleteScript, getScript }}>
      {children}
    </ScriptContext.Provider>
  )
}
