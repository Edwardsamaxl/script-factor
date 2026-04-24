import { createContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useLocalStorage('scriptstudio_user', {
    id: 'user-1',
    name: '游客',
    avatar: '👤',
    personas: [],
    scripts: [],
    favorites: [],
    createdAt: Date.now(),
  })

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
