import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { signup } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setSubmitting(true)
    try {
      await signup(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="bg-luxe-bg min-h-[80vh] flex justify-center py-10 px-4 font-sans">
      <div className="bg-luxe-panel border border-gold/20 rounded-sm p-6 w-full max-w-sm h-fit">
        <h1 className="text-2xl font-medium mb-4 text-slate-900">Create account</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1 text-slate-600">Your name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gold/30 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1 text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gold/30 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1 text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gold/30 rounded-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <p className="text-xs text-slate-500 mt-1">At least 6 characters</p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold hover:bg-gold-light text-white rounded-full py-1.5 text-sm font-medium border border-gold/40 disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create your Teotia Shopprix account'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
