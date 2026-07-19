import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X } from 'lucide-react'
import { api } from '../api/client'

const COMMON_EMOJIS = [
  '📱','👗','🏠','📚','💄','⚽','🧸','🛒','📞','💻',
  '👟','🎮','🍔','🚗','⌚','🎧','🛋️','💍','🧴','🎁'
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🛍️')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      setCategories(await api.get('/categories'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(c) {
    setEditingId(c._id)
    setName(c.name)
    setEmoji(c.emoji)
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
    setEmoji('🛍️')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, emoji }, true)
      } else {
        await api.post('/categories', {
          name,
          emoji,
          order: categories.length
        }, true)
      }

      cancelEdit()
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Products already assigned to it will keep the old category name as text.')) return

    await api.delete(`/categories/${id}`, true)
    await load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1">Categories</h1>
      <p className="text-sm text-gray-500 mb-4">
        Ye categories customer site ke header aur product form dono mein dikhti hain.
      </p>

      <div className="bg-luxe-panel border border-gold/10 rounded-lg p-5 mb-5 max-w-lg">
        {error && (
          <div className="bg-blush-from/10 border border-blush-from/30 text-blush-from text-sm px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              className="w-16 bg-black/40 border border-gold/30 text-white rounded-md px-2 py-2 text-center text-lg"
            />

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Category name e.g. Electronics"
              className="flex-1 bg-black/40 border border-gold/30 text-white rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {COMMON_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-gold hover:bg-gold-light text-black rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-400 text-sm flex items-center gap-1"
              >
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div
              key={c._id}
              className="bg-luxe-panel border border-gold/10 rounded-lg p-3 flex items-center justify-between"
            >
              <span className="flex items-center gap-2 text-sm text-white">
                <span className="text-xl">{c.emoji}</span>
                {c.name}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(c)}
                  className="text-gold hover:scale-110 transition-transform"
                >
                  <Pencil size={14} />
                </button>

                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-blush-from hover:scale-110 transition-transform"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">
              Koi category nahi hai. Upar se add karo.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
