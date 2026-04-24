import { createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { mockPersonas } from '../data/mockPersonas'

export const PersonaContext = createContext(null)

export function PersonaProvider({ children }) {
  const [personas, setPersonas] = useLocalStorage('scriptstudio_personas', mockPersonas)

  const addPersona = (persona) => {
    const newPersona = {
      ...persona,
      id: `persona-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageCount: 0,
      likeCount: 0,
    }
    setPersonas((prev) => [newPersona, ...prev])
    return newPersona
  }

  const updatePersona = (id, updates) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
    )
  }

  const deletePersona = (id) => {
    setPersonas((prev) => prev.filter((p) => p.id !== id))
  }

  const getPersona = (id) => personas.find((p) => p.id === id)

  const incrementUsage = (id) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p))
    )
  }

  const toggleFavorite = (id) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorited: !p.isFavorited } : p))
    )
  }

  return (
    <PersonaContext.Provider
      value={{
        personas,
        addPersona,
        updatePersona,
        deletePersona,
        getPersona,
        incrementUsage,
        toggleFavorite,
      }}
    >
      {children}
    </PersonaContext.Provider>
  )
}
