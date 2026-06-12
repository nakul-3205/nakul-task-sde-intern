import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from './api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  userId: string | null
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      setIsLoading(true)
      const response = await api<{ userId: string }>('/auth/me')
      setUserId(response.userId)
      setIsAuthenticated(true)
    } catch {
      setIsAuthenticated(false)
      setUserId(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function logout() {
    try {
      await api('/auth/logout', {
        method: 'POST',
      })
      setIsAuthenticated(false)
      setUserId(null)
      navigate({ to: '/login' })
    } catch (err) {
      console.error('Logout failed:', err)
      // Even if logout fails on server, clear local state
      setIsAuthenticated(false)
      setUserId(null)
      navigate({ to: '/login' })
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userId, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
