import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function SubcategoryBar() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  const categoryName = searchParams.get('category')
  const activeSubcategory = searchParams.get('subcategory') || ''

  useEffect(() => {
    api.get('/categories').then(setCategories).catch(() => setCategories([]))
  }, [])

  if (!categoryName) return null

  const parentCat = categories.find((c) => !c.parent && c.name === categoryName)
  if (!parentCat) return null

  const subcategories = categories.filter((c) => c.parent === parentCat._id)
  if (subcategories.length === 0) return null

  function selectSubcategory(subName) {
    const params = new URLSearchParams(searchParams)
    if (subName) {
      params.set('subcategory', subName)
    } else {
      params.delete('subcategory')
    }
    navigate(`/?${params.toString()}`)
  }

  return (
    <div className="bg-luxe-panel border-b border-gold/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4 overflow-x-auto">
        <div
          onClick={() => selectSubcategory('')}
          className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
        >
          <span className={`w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 ${!activeSubcategory ? 'border-gold bg-gold/10' : 'border-transparent bg-white'}`}>
            {parentCat.emoji}
          </span>
          <span className={`text-[11px] whitespace-nowrap ${!activeSubcategory ? 'text-gold font-medium' : 'text-slate-500'}`}>All</span>
        </div>

        {subcategories.map((sub) => (
          <div
            key={sub._id}
            onClick={() => selectSubcategory(sub.name)}
            className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
          >
            <span className={`w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 ${activeSubcategory === sub.name ? 'border-gold bg-gold/10' : 'border-transparent bg-white'}`}>
              {sub.emoji}
            </span>
            <span className={`text-[11px] whitespace-nowrap ${activeSubcategory === sub.name ? 'text-gold font-medium' : 'text-slate-500'}`}>
              {sub.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
