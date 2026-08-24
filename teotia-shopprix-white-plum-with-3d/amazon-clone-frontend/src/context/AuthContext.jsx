import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  function persist(userData) {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    persist(data)
    return data
  }

  async function signup(name, email, password) {
    const data = await api.post('/auth/signup', { name, email, password })
    persist(data)
    return data
  }

  async function updateProfile(profileData) {
    const data = await api.put('/auth/profile', profileData, true)
    const nextUser = { ...user, ...data }
    localStorage.setItem('user', JSON.stringify(nextUser))
    setUser(nextUser)
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
