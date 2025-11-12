'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DoctorOPListPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadRegistrations()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRegistrations, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadRegistrations = async () => {
    const { data } = await supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone)
      `)
      .eq('status', 'waiting')
      .order('created_at')

    setRegistrations(data || [])
    setLoading(false)
    setRefreshing(false)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadRegistrations()
  }

  const handleServe = (regId: string) => {
    router.push(`/dashboard/doctor/serve/${regId}`)
  }

  const getWaitTime = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000)
    
    if (diffMinutes < 60) return { text: `${diffMinutes} min`, minutes: diffMinutes }
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    return { text: `${hours}h ${mins}m`, minutes: diffMinutes }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading OP list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">OP Waiting List</h2>
            <p className="text-gray-600 text-sm mt-1">
              {registrations.length} {registrations.length === 1 ? 'patient' : 'patients'} waiting
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center"
          >
            <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {registrations.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No patients waiting</h3>
            <p className="mt-2 text-sm text-gray-500">All patients have been served. Great job!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Wait Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((reg, index) => {
                  const waitTime = getWaitTime(reg.created_at)
                  const isUrgent = waitTime.minutes > 30
                  
                  return (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{reg.patients?.patient_id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reg.patients?.full_name}</div>
                          {reg.patients?.phone && (
                            <div className="text-xs text-gray-500">{reg.patients.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reg.patients?.age || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {reg.patients?.gender || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${isUrgent ? 'badge-danger' : 'badge-info'}`}>
                          {waitTime.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {reg.notes ? (
                          <p className="text-sm text-gray-600 max-w-xs truncate" title={reg.notes}>
                            {reg.notes}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400">No notes</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleServe(reg.id)}
                          className="btn-primary text-sm"
                        >
                          Serve Patient
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card bg-emerald-50 border border-emerald-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-teal-900 mb-1">Queue Information</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• Patients are listed in order of registration time</li>
              <li>• Red badges indicate patients waiting more than 30 minutes</li>
              <li>• List auto-refreshes every 30 seconds</li>
              <li>• Click "Serve Patient" to start consultation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

