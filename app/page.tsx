'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (user) {
      router.push('/dashboard')
    }
  }

  const loginRoles = [
    { role: 'admin', title: 'Admin', icon: '👑', href: '/login/admin', featured: false },
    { role: 'staff', title: 'Staff Login', icon: '👥', href: '/login/staff', featured: true },
    { role: 'receptionist', title: 'Receptionist', icon: '📝', href: '/login/receptionist', featured: false },
    { role: 'doctor', title: 'Doctor', icon: '👨‍⚕️', href: '/login/doctor', featured: false },
    { role: 'pharmacist', title: 'Pharmacist', icon: '💊', href: '/login/pharmacist', featured: false },
    { role: 'physical_medicine', title: 'Physical Medicine', icon: '🏋️', href: '/login/physical-medicine', featured: false }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Screen with Background Image */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop"
            alt="Hospital Team"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-900/60 md:from-blue-900/70 md:via-blue-800/60 md:to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 w-full">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 sm:px-5 py-2 bg-white/95 rounded-full mb-6 sm:mb-8 shadow-lg">
              <span className="text-blue-600 font-semibold text-xs sm:text-sm">🏥 Professional Healthcare Management</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Hospital Management
              <span className="block text-blue-200">Made Simple</span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-10 md:mb-12 leading-relaxed">
              Streamline your hospital operations with our comprehensive management system. 
              Efficient, secure, and designed for healthcare professionals.
            </p>

            {/* Login Buttons Grid */}
            <div className="mb-8 sm:mb-10 md:mb-12">
              <p className="text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-5 uppercase tracking-wider">Select Your Role to Login</p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-4xl">
                {loginRoles.map((role) => (
                  <a
                    key={role.role}
                    href={role.href}
                    className={`group relative backdrop-blur-md border rounded-xl p-4 sm:p-5 md:p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 text-center active:scale-95 ${
                      role.featured 
                        ? 'bg-gradient-to-br from-yellow-400/30 to-orange-400/30 border-yellow-300/60 ring-2 ring-yellow-300/80 shadow-xl' 
                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {role.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg animate-pulse">
                        ⭐ RECOMMENDED
                      </div>
                    )}
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                      {role.icon}
                    </div>
                    <div className="text-white group-hover:text-white font-bold text-xs sm:text-sm transition-colors leading-tight">
                      {role.title}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Secure & Reliable</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">Enterprise-grade security</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Fast & Efficient</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">Real-time operations</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-lg sm:col-span-2 md:col-span-1">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Role-Based Access</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">Customized dashboards</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Complete Healthcare Solution</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">Everything you need to manage your hospital efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Patient Management</h3>
              <p className="text-sm sm:text-base text-gray-600">Complete patient registration, medical records, and appointment scheduling system.</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Digital Prescriptions</h3>
              <p className="text-sm sm:text-base text-gray-600">Electronic prescription system for medicines and physical therapy treatments.</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Reports & Analytics</h3>
              <p className="text-sm sm:text-base text-gray-600">Real-time statistics, comprehensive reports, and data-driven insights.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">© 2024 Hospital Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
