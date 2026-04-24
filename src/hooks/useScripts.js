import { useContext } from 'react'
import { ScriptContext } from '../context/ScriptContext'

export function useScripts() {
  const context = useContext(ScriptContext)
  if (!context) {
    throw new Error('useScripts must be used within a ScriptProvider')
  }
  return context
}
