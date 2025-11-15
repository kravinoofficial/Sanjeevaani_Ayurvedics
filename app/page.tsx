'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          // User is logged in, redirect to dashboard
          router.replace('/dashboard')
        }
      }
    } catch (error) {
      // Not logged in, stay on landing page
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
            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop"
            alt="Ayurvedic Wellness"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-800/85 to-emerald-900/80 md:from-teal-900/85 md:via-teal-800/75 md:to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 w-full">
          <div className="max-w-4xl">
            {/* Logo - Much Larger */}
            <div className="mb-10">
              <img src="/logo1.png" alt="Sanjeevani Ayurvedics" className="h-32 sm:h-40 md:h-48 lg:h-56 w-auto" />
            </div>
            
            {/* Ayurvedic Tagline */}
            <div className="mb-6">
              <p className="text-xl sm:text-2xl md:text-3xl text-emerald-200 font-semibold mb-2">
                🌿 Ancient Wisdom. Modern Care.
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90">
                Holistic Ayurvedic Treatments for Complete Wellness
              </p>
            </div>
            
            {/* Services Badge */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">🧘‍♀️ Panchakarma</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">💆‍♀️ Abhyanga</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">🌿 Herbal Medicine</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">🧘 Yoga Therapy</span>
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-8 inline-block">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-semibold">8589007205</span>
                </div>
                <div className="h-6 w-px bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Chanthavila, Thiruvananthapuram</span>
                </div>
              </div>
            </div>

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
                        ? 'bg-gradient-to-br from-emerald-400/30 to-teal-400/30 border-emerald-300/60 ring-2 ring-emerald-300/80 shadow-xl' 
                        : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {role.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-400 text-gray-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg animate-pulse">
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
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Authentic Ayurveda</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm">Traditional healing methods</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Personalized Care</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm">Tailored treatments</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-lg sm:col-span-2 md:col-span-1">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/80 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">Expert Practitioners</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm">Experienced Ayurvedic doctors</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Ayurvedic Treatments Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-900 mb-3 sm:mb-4">Our Ayurvedic Treatments</h2>
            <p className="text-base sm:text-lg md:text-xl text-teal-700 px-4">Traditional therapies for holistic healing and wellness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all border-2 border-emerald-200 hover:border-teal-400">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-3xl">
                🧘‍♀️
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2 sm:mb-3">Panchakarma Therapy</h3>
              <p className="text-sm sm:text-base text-teal-700">Complete detoxification and rejuvenation through five purification procedures for deep cleansing.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all border-2 border-emerald-200 hover:border-teal-400">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-3xl">
                💆‍♀️
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2 sm:mb-3">Abhyanga & Massage</h3>
              <p className="text-sm sm:text-base text-teal-700">Therapeutic oil massage treatments to balance doshas, improve circulation, and promote relaxation.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-all border-2 border-emerald-200 hover:border-teal-400">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-3xl">
                🌿
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-teal-900 mb-2 sm:mb-3">Herbal Medicine</h3>
              <p className="text-sm sm:text-base text-teal-700">Personalized herbal formulations and natural remedies for various health conditions and wellness.</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-teal-900 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-emerald-300 mb-2">15+</div>
                <p className="text-emerald-100">Years of Experience</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-300 mb-2">5000+</div>
                <p className="text-emerald-100">Patients Treated</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-emerald-300 mb-2">100%</div>
                <p className="text-emerald-100">Natural Treatments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo2.png" alt="Sanjeevani Ayurvedics" className="w-10 h-10 rounded-lg" />
              <div>
                <p className="font-bold text-gray-800">Sanjeevani Ayurvedics</p>
                <p className="text-xs text-gray-600">Authentic Ayurveda • Personalized Treatments</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">📞 8589007205</p>
              <p className="text-xs text-gray-500">Sanjeevani Ayurvedics, Chanthavila, Thiruvananthapuram 695584</p>
            </div>
          </div>
          <div className="text-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">© 2025 Sanjeevani Ayurvedics. All rights reserved.</p>
            <p className="text-xs text-gray-400 mt-1">
              Website built by <a href="https://touchpointe.digital/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Touchpointe Digital</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
