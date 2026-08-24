import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] })
      return
    }
    setLoading(true)
    try {
      const data = await api.get('/cart', true)
      setCart(data)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  async function addToCart(productId, qty = 1, size = '') {
    if (!user) throw new Error('NOT_LOGGED_IN')
    const data = await api.post('/cart', { productId, qty, size: size || undefined }, true)
    setCart(data)
  }

  async function updateQty(productId, qty, size = '') {
    const qs = size ? `?size=${encodeURIComponent(size)}` : ''
    const data = await api.put(`/cart/${productId}${qs}`, { qty }, true)
    setCart(data)
  }

  async function removeFromCart(productId, size = '') {
    const qs = size ? `?size=${encodeURIComponent(size)}` : ''
    const data = await api.delete(`/cart/${productId}${qs}`, true)
    setCart(data)
  }

  const itemCount = cart.items?.reduce((sum, i) => sum + i.qty, 0) || 0
  const subtotal = cart.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.qty, 0) || 0

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, subtotal, addToCart, updateQty, removeFromCart, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
