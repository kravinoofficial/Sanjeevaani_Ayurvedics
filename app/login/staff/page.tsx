'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'

export default function StaffLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Use 'staff' role for unified access
    const { data, error: loginError } = await api.login(email, password, 'staff')

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
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-blue-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-[73px]">
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59, 130, 246) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-10 rounded-2xl shadow-2xl border border-blue-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mb-4">
                  <span className="text-5xl">👥</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Staff Login</h1>
                <p className="text-gray-600">Unified access to all staff functions</p>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>📝 Receptionist</span>
                  <span>•</span>
                  <span>👨‍⚕️ Doctor</span>
                  <span>•</span>
                  <span>💊 Pharmacist</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="staff@hospital.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                  className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In as Staff'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
