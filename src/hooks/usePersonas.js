import { useContext } from 'react'
import { PersonaContext } from '../context/PersonaContext'

export function usePersonas() {
  const context = useContext(PersonaContext)
  if (!context) {
    throw new Error('usePersonas must be used within a PersonaProvider')
  }
  return context
}
