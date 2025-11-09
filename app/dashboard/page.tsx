'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const profile: any = await getCurrentUser()
    setUser(profile)

    if (profile && profile.role) {
      await loadStats(profile.role as string)
    }
    setLoading(false)
  }

  const loadStats = async (role: string) => {
    const today = new Date().toISOString().split('T')[0]

    if (role === 'admin') {
      const [patients, todayOPs, pendingMeds, pendingTreatments, lowStock] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('op_registrations').select('*', { count: 'exact', head: true }).eq('registration_date', today),
        supabase.from('medicine_prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('physical_treatment_prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('medicines').select('*', { count: 'exact', head: true }).lt('stock_quantity', 10),
      ])

      setStats({
        totalPatients: patients.count || 0,
        todayRegistrations: todayOPs.count || 0,
        pendingPrescriptions: pendingMeds.count || 0,
        pendingTreatments: pendingTreatments.count || 0,
        lowStockMedicines: lowStock.count || 0,
      })
    } else if (role === 'receptionist') {
      const [patients, todayOPs] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('op_registrations').select('*', { count: 'exact', head: true }).eq('registration_date', today),
      ])

      setStats({
        totalPatients: patients.count || 0,
        todayRegistrations: todayOPs.count || 0,
      })
    } else if (role === 'doctor') {
      const [waiting, completed] = await Promise.all([
        supabase.from('op_registrations').select('*', { count: 'exact', head: true }).eq('status', 'waiting'),
        supabase.from('op_registrations').select('*', { count: 'exact', head: true }).eq('status', 'completed').eq('doctor_id', user?.id),
      ])

      setStats({
        waitingPatients: waiting.count || 0,
        completedToday: completed.count || 0,
      })
    } else if (role === 'pharmacist') {
      const [pending, served] = await Promise.all([
        supabase.from('medicine_prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('medicine_prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'served'),
      ])

      setStats({
        pendingPrescriptions: pending.count || 0,
        servedToday: served.count || 0,
      })
    } else if (role === 'physical_medicine') {
      const [pending, served] = await Promise.all([
        supabase.from('physical_treatment_prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('physical_treatment_prescriptions').select('*', { count: 'exact', head: true }).eq('status', 'served'),
      ])

      setStats({
        pendingTreatments: pending.count || 0,
        servedToday: served.count || 0,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const getRoleGreeting = () => {
    const greetings: Record<string, string> = {
      admin: 'Manage your hospital operations',
      receptionist: 'Register patients and manage appointments',
      doctor: 'View and serve your patients',
      pharmacist: 'Manage medicine prescriptions',
      physical_medicine: 'Handle physical treatment prescriptions',
    }
    return greetings[user.role] || 'Welcome to your dashboard'
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">{getTimeGreeting()}</p>
            <h1 className="text-4xl font-bold mb-2">{user.full_name}</h1>
            <p className="text-blue-100">{getRoleGreeting()}</p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-blue-100 text-xs font-medium mb-1">TODAY</p>
              <p className="text-xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              <p className="text-blue-100 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Total Patients</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.totalPatients}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/receptionist/patients" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Today's OPs</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.todayRegistrations}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/receptionist/daily-ops" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View Details
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Pending Prescriptions</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.pendingPrescriptions}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/pharmacist/prescriptions" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                Manage
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Low Stock Items</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.lowStockMedicines}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/admin/stock" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View Stock
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {user.role === 'receptionist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Total Patients</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.totalPatients}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/receptionist/patients" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View All →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Today's Registrations</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.todayRegistrations}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/receptionist/daily-ops" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View Details →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Quick Action</p>
            <p className="text-lg font-bold text-blue-900 mt-2">Register OP</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/receptionist/registration" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                Register Now →
              </a>
            </div>
          </div>
        </div>
      )}

      {user.role === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Waiting Patients</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.waitingPatients}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/doctor/op-list" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View Queue →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Completed Today</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.completedToday}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/doctor/served" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View History →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Quick Action</p>
            <p className="text-lg font-bold text-blue-900 mt-2">Serve Patient</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/doctor/op-list" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                Start Now →
              </a>
            </div>
          </div>
        </div>
      )}

      {user.role === 'pharmacist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Pending Prescriptions</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.pendingPrescriptions}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/pharmacist/prescriptions" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                Process Now →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Served Today</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.servedToday}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/pharmacist/prescriptions" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View Details →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Stock Management</p>
            <p className="text-lg font-bold text-blue-900 mt-2">View Stock</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/pharmacist/stock" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                Manage Stock →
              </a>
            </div>
          </div>
        </div>
      )}

      {user.role === 'physical_medicine' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Pending Treatments</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.pendingTreatments}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/physical-medicine/treatments" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View Queue →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Served Today</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">{stats.servedToday}</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/physical-medicine/treatments" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                View History →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-blue-700 text-sm font-semibold">Manage Treatments</p>
            <p className="text-lg font-bold text-blue-900 mt-2">Settings</p>
            <div className="mt-4 pt-3 border-t border-blue-200">
              <a href="/dashboard/physical-medicine/manage-treatments" className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center">
                Configure →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'admin' && (
            <>
              <a href="/dashboard/admin/users" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Manage Users</h4>
                <p className="text-sm text-blue-700">Add or edit staff</p>
              </a>
              <a href="/dashboard/admin/medicines" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Medicines</h4>
                <p className="text-sm text-blue-700">Manage inventory</p>
              </a>
              <a href="/dashboard/admin/stock" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Stock</h4>
                <p className="text-sm text-blue-700">Manage stock</p>
              </a>
              <a href="/dashboard/admin/reports" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Reports</h4>
                <p className="text-sm text-blue-700">View analytics</p>
              </a>
            </>
          )}
          {user.role === 'receptionist' && (
            <>
              <a href="/dashboard/receptionist/registration" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">OP Registration</h4>
                <p className="text-sm text-blue-700">Register patient</p>
              </a>
              <a href="/dashboard/receptionist/patients" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Patient List</h4>
                <p className="text-sm text-blue-700">View all patients</p>
              </a>
            </>
          )}
          {user.role === 'doctor' && (
            <>
              <a href="/dashboard/doctor/op-list" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">OP List</h4>
                <p className="text-sm text-blue-700">View queue</p>
              </a>
              <a href="/dashboard/doctor/served" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Served</h4>
                <p className="text-sm text-blue-700">View history</p>
              </a>
            </>
          )}
          {user.role === 'pharmacist' && (
            <>
              <a href="/dashboard/pharmacist/prescriptions" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Prescriptions</h4>
                <p className="text-sm text-blue-700">Manage medicines</p>
              </a>
              <a href="/dashboard/pharmacist/stock" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Stock</h4>
                <p className="text-sm text-blue-700">View inventory</p>
              </a>
            </>
          )}
          {user.role === 'physical_medicine' && (
            <>
              <a href="/dashboard/physical-medicine/treatments" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Treatments</h4>
                <p className="text-sm text-blue-700">Manage treatments</p>
              </a>
              <a href="/dashboard/physical-medicine/manage-treatments" className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Settings</h4>
                <p className="text-sm text-blue-700">Configure</p>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
