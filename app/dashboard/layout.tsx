'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, signOut } from '@/lib/auth'
import { UserRole } from '@/lib/database.types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const profile = await getCurrentUser()
    if (!profile) {
      router.push('/')
      return
    }
    setUser(profile)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const roleLinks: Record<UserRole, { label: string; href: string; icon: string }[]> = {
    admin: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
      { label: 'Doctors', href: '/dashboard/admin/doctors', icon: '👨‍⚕️' },
      { label: 'Medicines', href: '/dashboard/admin/medicines', icon: '💊' },
      { label: 'Physical Treatments', href: '/dashboard/admin/physical-treatments', icon: '🏋️' },
      { label: 'Stock Management', href: '/dashboard/admin/stock', icon: '📦' },
      { label: 'Consultation Fee', href: '/dashboard/admin/charges', icon: '💰' },
      { label: 'Reports', href: '/dashboard/admin/reports', icon: '📈' },
    ],
    receptionist: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'OP Registration', href: '/dashboard/receptionist/registration', icon: '📝' },
      { label: 'Daily OPs', href: '/dashboard/receptionist/daily-ops', icon: '📅' },
      { label: 'Patients', href: '/dashboard/receptionist/patients', icon: '🏥' },
    ],
    doctor: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'OP List', href: '/dashboard/doctor/op-list', icon: '📋' },
      { label: 'Served Patients', href: '/dashboard/doctor/served', icon: '✅' },
    ],
    pharmacist: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Prescriptions', href: '/dashboard/pharmacist/prescriptions', icon: '💊' },
      { label: 'Billing', href: '/dashboard/pharmacist/billing', icon: '💰' },
      { label: 'Medicines', href: '/dashboard/pharmacist/medicines', icon: '💉' },
      { label: 'Physical Treatments', href: '/dashboard/pharmacist/physical-treatments', icon: '🏋️' },
      { label: 'Stock Management', href: '/dashboard/pharmacist/stock', icon: '📦' },
    ],
    physical_medicine: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'Treatments', href: '/dashboard/physical-medicine/treatments', icon: '🏋️' },
      { label: 'Manage Treatments', href: '/dashboard/physical-medicine/manage-treatments', icon: '⚙️' },
    ],
    staff: [
      { label: 'Dashboard', href: '/dashboard', icon: '📊' },
      { label: 'OP Registration', href: '/dashboard/receptionist/registration', icon: '📝' },
      { label: 'Daily OPs', href: '/dashboard/receptionist/daily-ops', icon: '📅' },
      { label: 'Patients', href: '/dashboard/receptionist/patients', icon: '🏥' },
      { label: 'OP List', href: '/dashboard/doctor/op-list', icon: '📋' },
      { label: 'Served Patients', href: '/dashboard/doctor/served', icon: '✅' },
      { label: 'Prescriptions', href: '/dashboard/pharmacist/prescriptions', icon: '💊' },
      { label: 'Billing', href: '/dashboard/pharmacist/billing', icon: '💰' },
      { label: 'Medicines', href: '/dashboard/pharmacist/medicines', icon: '💉' },
      { label: 'Physical Treatments', href: '/dashboard/pharmacist/physical-treatments', icon: '🏋️' },
      { label: 'Stock Management', href: '/dashboard/pharmacist/stock', icon: '📦' },
    ],
  }

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-purple-100 text-purple-800',
      receptionist: 'bg-blue-100 text-blue-800',
      doctor: 'bg-green-100 text-green-800',
      pharmacist: 'bg-orange-100 text-orange-800',
      physical_medicine: 'bg-pink-100 text-pink-800',
      staff: 'bg-indigo-100 text-indigo-800',
    }
    return colors[role]
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-50/80 backdrop-blur-sm border-r border-blue-100 flex-shrink-0 hidden md:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-blue-200">
          <div className="flex items-center">
            <img src="/logo2.png" alt="Sanjeevani Ayurvedica" className="w-10 h-10 rounded-lg shadow-md" />
            <span className="ml-3 text-lg font-bold text-blue-900">Sanjeevani Ayurvedica</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {roleLinks[user.role as UserRole]?.map((link: any) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-700 hover:bg-blue-100'
                }`}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-blue-200">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">
                {user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-blue-900 truncate">{user.full_name}</p>
              <span className="text-xs text-blue-600">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900 text-white rounded-lg shadow-lg"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-64 bg-blue-50/95 backdrop-blur-md border-r border-blue-100 h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-blue-200">
              <div className="flex items-center">
                <img src="/logo2.png" alt="Sanjeevani Ayurvedica" className="w-10 h-10 rounded-lg shadow-md" />
                <span className="ml-3 text-lg font-bold text-blue-900">Sanjeevani Ayurvedica</span>
              </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {roleLinks[user.role as UserRole]?.map((link: any) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <span className="mr-3 text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-blue-900 truncate">{user.full_name}</p>
                  <span className="text-xs text-blue-600">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center justify-center shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
