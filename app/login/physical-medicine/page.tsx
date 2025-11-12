'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'

export default function PhysicalMedicineLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: loginError } = await api.login(email, password, 'physical_medicine')

    if (loginError) {
      setError(loginError)
      setLoading(false)
      return
    }

    if (data) {
      window.location.href = '/dashboard'
    } else {
      setError('Login failed')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-emerald-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pt-[73px]">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(20, 184, 166) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          <div className="bg-white p-10 rounded-2xl shadow-2xl border border-emerald-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl mb-4">
                <span className="text-5xl">🏋️</span>
              </div>
              <h1 className="text-3xl font-bold text-teal-900 mb-2">Physical Medicine Login</h1>
              <p className="text-teal-700">Sign in to manage treatments</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-teal-900 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="physio@hospital.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-teal-900 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-3 rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Signing in...' : 'Sign In as Physical Medicine'}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
