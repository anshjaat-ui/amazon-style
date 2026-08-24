import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [productIds, setProductIds] = useState(new Set())
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user) {
      setProductIds(new Set())
      setProducts([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.get('/wishlist', true)
      setProducts(data.products || [])
      setProductIds(new Set((data.products || []).map((p) => p._id)))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function toggle(productId) {
    if (!user) throw new Error('NOT_LOGGED_IN')
    const data = await api.post(`/wishlist/${productId}`, {}, true)
    setProducts(data.wishlist.products || [])
    setProductIds(new Set((data.wishlist.products || []).map((p) => p._id)))
    return data.added
  }

  function isWishlisted(productId) {
    return productIds.has(productId)
  }

  return (
    <WishlistContext.Provider value={{ products, loading, error, isWishlisted, toggle, refresh }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
