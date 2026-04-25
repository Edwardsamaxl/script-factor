import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api/ai'

/**
 * Hook to fetch and manage AI generation results
 */
export function useAIResults(scriptId) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch results
  const fetchResults = useCallback(async () => {
    try {
      const url = scriptId
        ? `${API_BASE}/results?scriptId=${scriptId}`
        : `${API_BASE}/results`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setResults(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err.message)
    }
  }, [scriptId])

  // Initial fetch
  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  // Poll for updates (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchResults()
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchResults])

  // Create a new generation task
  const createTask = async ({ type, provider, mode, prompt, personaImages, personaId }) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId,
          type,
          provider,
          mode,
          prompt,
          personaImages,
          personaId
        })
      })
      const data = await res.json()
      if (data.success) {
        await fetchResults()
        return data.data
      } else {
        throw new Error(data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  // Delete a result
  const deleteResult = async (resultId) => {
    const res = await fetch(`${API_BASE}/results/${resultId}`, {
      method: 'DELETE'
    })
    const data = await res.json()
    if (data.success) {
      setResults(results.filter(r => r.id !== resultId))
    }
    return data.success
  }

  // Retry a failed task
  const retryTask = async (resultId) => {
    const res = await fetch(`${API_BASE}/tasks/${resultId}/retry`, {
      method: 'POST'
    })
    const data = await res.json()
    if (data.success) {
      await fetchResults()
    }
    return data.success
  }

  return {
    results,
    loading,
    error,
    createTask,
    deleteResult,
    retryTask,
    refetch: fetchResults
  }
}
