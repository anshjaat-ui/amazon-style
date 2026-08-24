import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from './ProductCard'

export default function ProductGrid() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const keyword = searchParams.get('keyword') || ''
  const category = searchParams.get('category') || ''
  const subcategory = searchParams.get('subcategory') || ''
  const isDefaultHome = !keyword && !category && !subcategory

  useEffect(() => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (category) params.set('category', category)
    if (subcategory) params.set('subcategory', subcategory)

    const loadProducts = async () => {
      try {
        if (isDefaultHome) {
          const data = await api.get('/products/trending')
          setProducts(data.products || [])
          return
        }

        // The backend returns 12 products per page. For category/search pages,
        // load every page so customers can actually see the complete category
        // (e.g. all 16-17 footwear products) instead of only the first 12.
        const first = await api.get(`/products?${params.toString()}&page=1`)
        const all = [...(first.products || [])]
        const pages = Math.max(1, Number(first.pages) || 1)

        if (pages > 1) {
          const remaining = await Promise.all(
            Array.from({ length: pages - 1 }, (_, index) =>
              api.get(`/products?${params.toString()}&page=${index + 2}`)
            )
          )
          remaining.forEach((data) => all.push(...(data.products || [])))
        }

        setProducts(all)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [keyword, category, subcategory, isDefaultHome])

  const heading = keyword
    ? `Results for "${keyword}"`
    : subcategory
    ? subcategory
    : category
    ? category
    : 'Trending Now'

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 bg-luxe-bg">
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
          {isDefaultHome && (
            <p className="text-xs text-slate-500 mt-1">Top discounts · Most viewed · High-stock picks</p>
          )}
        </div>
      </div>

      {loading && <p className="text-slate-500 text-sm">Loading products...</p>}

      {error && (
        <p className="text-sm text-blush-from">
          Products load nahi ho paaye. Backend chal raha hai aur VITE_API_URL sahi hai? ({error})
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-sm text-slate-500">
          Koi product nahi mila. Backend mein products available hain ya nahi check karo.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  )
}
