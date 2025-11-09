'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DailyOPsPage() {
  const [ops, setOps] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    loadDailyOPs()
  }, [selectedDate])

  const loadDailyOPs = async () => {
    setLoading(true)
    try {
      // Get OPs for selected date using registration_date
      const { data, error } = await supabase
        .from('op_registrations')
        .select(`
          *,
          patient:patients(full_name, patient_id, age, gender, phone),
          doctor:users!op_registrations_doctor_id_fkey(full_name)
        `)
        .eq('registration_date', selectedDate)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading OPs:', error)
        throw error
      }

      console.log('Loaded OPs:', data)
      const opsData = data || []
      setOps(opsData)

      // Calculate stats
      const total = opsData.length
      const waiting = opsData.filter((op: any) => op.status === 'waiting').length
      const completed = opsData.filter((op: any) => op.status === 'completed').length
      const cancelled = opsData.filter((op: any) => op.status === 'cancelled').length

      setStats({ total, waiting, completed, cancelled })
    } catch (error: any) {
      console.error('Error loading OPs:', error)
      alert('Error loading OPs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      waiting: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold',
      completed: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold',
      cancelled: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold'
    }
    return badges[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold'
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {/* Header with Date Selector */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Daily OP Registrations</h2>
            <p className="text-gray-600 text-sm mt-1">
              {isToday ? "Today's" : 'Selected day'} outpatient registrations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn-secondary mt-6"
            >
              Today
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="stat-card">
            <div className="text-blue-700 text-sm font-semibold mb-1">Total OPs</div>
            <div className="text-3xl font-bold text-blue-900">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="text-blue-700 text-sm font-semibold mb-1">Waiting</div>
            <div className="text-3xl font-bold text-blue-900">{stats.waiting}</div>
          </div>
          <div className="stat-card">
            <div className="text-blue-700 text-sm font-semibold mb-1">Completed</div>
            <div className="text-3xl font-bold text-blue-900">{stats.completed}</div>
          </div>
          <div className="stat-card">
            <div className="text-blue-700 text-sm font-semibold mb-1">Cancelled</div>
            <div className="text-3xl font-bold text-blue-900">{stats.cancelled}</div>
          </div>
        </div>
      </div>

      {/* OP List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          OP List - {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading OPs...</p>
          </div>
        ) : ops.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No OPs registered</h3>
            <p className="mt-1 text-sm text-gray-500">No outpatient registrations for this date.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">OP #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Age/Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ops.map((op, index) => (
                  <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600">OP{String(index + 1).padStart(2, '0')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatTime(op.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{op.patient?.full_name}</div>
                      <div className="text-sm text-gray-500">{op.patient?.patient_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {op.patient?.age} / {op.patient?.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {op.doctor?.full_name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {op.notes || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(op.status)}>
                        {op.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
