import { createContext, useState, useEffect } from 'react'

export const PersonaContext = createContext(null)

const API_BASE = '/api'

export function PersonaProvider({ children }) {
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)

  // 从后端加载内置人物、用户人物和点赞状态
  useEffect(() => {
    async function loadPersonas() {
      try {
        // 并行加载所有数据
        const [builtInRes, userRes, favRes] = await Promise.all([
          fetch(`${API_BASE}/personas/built-in`),
          fetch(`${API_BASE}/personas`),
          fetch(`${API_BASE}/personas/favorites`)
        ])

        const builtInData = await builtInRes.json()
        const userData = await userRes.json()
        const favData = await favRes.json()

        const builtIn = builtInData.success ? builtInData.data : []
        const users = userData.success ? userData.data : []
        const favorites = favData.success ? favData.data : { favoritedBuiltInIds: [], favoritedUserIds: [] }

        // 过滤掉统计数据记录（builtInId 是内部统计标记，不是真实人设）
        const realUsers = users.filter(p => !p.builtInId)
        // 合并点赞状态
        const allPersonas = [...builtIn, ...realUsers].map(p => {
          const isFavorited = p.creator === 'user'
            ? favorites.favoritedUserIds.includes(p.id)
            : favorites.favoritedBuiltInIds.includes(p.id)
          return { ...p, isFavorited }
        })

        setPersonas(allPersonas)
      } catch (error) {
        console.error('Failed to load personas:', error)
        setPersonas([])
      } finally {
        setLoading(false)
      }
    }
    loadPersonas()
  }, [])

  // 刷新人物列表
  const refreshPersonas = async () => {
    setLoading(true)
    try {
      const [builtInRes, userRes, favRes] = await Promise.all([
        fetch(`${API_BASE}/personas/built-in`),
        fetch(`${API_BASE}/personas`),
        fetch(`${API_BASE}/personas/favorites`)
      ])

      const builtInData = await builtInRes.json()
      const userData = await userRes.json()
      const favData = await favRes.json()

      const builtIn = builtInData.success ? builtInData.data : []
      const users = userData.success ? userData.data : []
      const favorites = favData.success ? favData.data : { favoritedBuiltInIds: [], favoritedUserIds: [] }

      // 过滤掉统计数据记录
      const realUsers = users.filter(p => !p.builtInId)

      const allPersonas = [...builtIn, ...realUsers].map(p => {
        const isFavorited = p.creator === 'user'
          ? favorites.favoritedUserIds.includes(p.id)
          : favorites.favoritedBuiltInIds.includes(p.id)
        return { ...p, isFavorited }
      })

      setPersonas(allPersonas)
    } catch (error) {
      console.error('Failed to refresh personas:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPersona = async (persona) => {
    try {
      const res = await fetch(`${API_BASE}/personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      })
      const data = await res.json()
      if (data.success) {
        setPersonas(prev => [{ ...data.data, isFavorited: false }, ...prev])
        return data.data
      }
    } catch (error) {
      console.error('Failed to add persona:', error)
    }
    return null
  }

  const updatePersona = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/personas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      if (data.success) {
        setPersonas(prev =>
          prev.map(p => p.id === id ? { ...data.data, isFavorited: p.isFavorited } : p)
        )
        return data.data
      }
    } catch (error) {
      console.error('Failed to update persona:', error)
    }
    return null
  }

  const deletePersona = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/personas/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setPersonas(prev => prev.filter(p => p.id !== id))
        return true
      }
    } catch (error) {
      console.error('Failed to delete persona:', error)
    }
    return false
  }

  const getPersona = (id) => personas.find(p => p.id === id)

  const incrementUsage = async (id) => {
    // 先乐观更新本地
    setPersonas(prev =>
      prev.map(p =>
        p.id === id ? { ...p, usageCount: (p.usageCount || 0) + 1 } : p
      )
    )
    // 调用后端 API
    try {
      await fetch(`${API_BASE}/personas/${id}/use`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to increment usage:', error)
    }
  }

  const toggleFavorite = async (id) => {
    const persona = personas.find(p => p.id === id)
    if (!persona) return

    const isCurrentlyFavorited = persona.isFavorited
    const action = isCurrentlyFavorited ? 'unlike' : 'like'

    // 乐观更新本地
    setPersonas(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              isFavorited: !p.isFavorited,
              likeCount: action === 'like' ? (p.likeCount || 0) + 1 : Math.max(0, (p.likeCount || 0) - 1)
            }
          : p
      )
    )

    // 调用后端 API
    try {
      const res = await fetch(`${API_BASE}/personas/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (data.success) {
        setPersonas(prev =>
          prev.map(p =>
            p.id === id ? { ...p, likeCount: data.data.likeCount } : p
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // 回滚本地状态
      setPersonas(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, isFavorited: isCurrentlyFavorited, likeCount: persona.likeCount }
            : p
        )
      )
    }
  }

  return (
    <PersonaContext.Provider
      value={{
        personas,
        loading,
        addPersona,
        updatePersona,
        deletePersona,
        getPersona,
        incrementUsage,
        toggleFavorite,
        refreshPersonas
      }}
    >
      {children}
    </PersonaContext.Provider>
  )
}
