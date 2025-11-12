'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-client'

export default function DoctorServedPatientsPage() {
  const [servedPatients, setServedPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filter, setFilter] = useState('today') // today, week, month, all
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 })
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedOP, setSelectedOP] = useState<any>(null)

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      loadServedPatients()
      loadStats()
    }
  }, [currentUser, filter])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadStats = async () => {
    if (!currentUser) return

    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      supabase
        .from('op_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', currentUser.id)
        .eq('status', 'completed')
        .eq('registration_date', today),
      supabase
        .from('op_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', currentUser.id)
        .eq('status', 'completed')
        .gte('registration_date', weekAgo),
      supabase
        .from('op_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', currentUser.id)
        .eq('status', 'completed')
        .gte('registration_date', monthAgo),
      supabase
        .from('op_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', currentUser.id)
        .eq('status', 'completed'),
    ])

    setStats({
      today: todayCount.count || 0,
      week: weekCount.count || 0,
      month: monthCount.count || 0,
      total: totalCount.count || 0,
    })
  }

  const loadServedPatients = async () => {
    if (!currentUser) return

    // Use tableLoading for filter changes, loading for initial load
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setTableLoading(true)
    }

    let query = supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone)
      `)
      .eq('doctor_id', currentUser.id)
      .eq('status', 'completed')
      .order('registration_date', { ascending: false })

    // Apply date filter
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.eq('registration_date', today)
    } else if (filter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      query = query.gte('registration_date', weekAgo)
    } else if (filter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      query = query.gte('registration_date', monthAgo)
    }

    const { data } = await query

    setServedPatients(data || [])
    setLoading(false)
    setTableLoading(false)
    setIsInitialLoad(false)
  }

  const getOPNumber = (op: any) => {
    // Get all OPs for the same date to calculate the correct index
    const sameDate = servedPatients.filter(o => o.registration_date === op.registration_date)
    const sortedByTime = sameDate.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const index = sortedByTime.findIndex(o => o.id === op.id)
    return `OP${String(index + 1).padStart(2, '0')}`
  }

  const viewPrescriptions = async (op: any) => {
    // Load full OP data with prescriptions
    const { data, error } = await supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone),
        doctor:users!op_registrations_doctor_id_fkey (full_name),
        medicine_prescriptions (
          id,
          medicine_id,
          quantity,
          dosage,
          instructions,
          status,
          medicines (name, unit)
        ),
        physical_treatment_prescriptions (
          id,
          treatment_type,
          duration,
          instructions,
          status
        )
      `)
      .eq('id', op.id)
      .single()

    if (error) {
      console.error('Error loading OP data:', error)
      alert('Error loading prescription details')
      return
    }

    setSelectedOP(data)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading served patients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Served Patients</h2>
            <p className="text-gray-600 text-sm mt-1">View your completed consultations</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-teal-100 border border-emerald-200 p-4 rounded-lg">
            <p className="text-teal-600 text-sm font-medium">Today</p>
            <p className="text-3xl font-bold text-teal-700 mt-1">{stats.today}</p>
          </div>
          <div className="bg-teal-100 border border-emerald-200 p-4 rounded-lg">
            <p className="text-teal-600 text-sm font-medium">This Week</p>
            <p className="text-3xl font-bold text-teal-700 mt-1">{stats.week}</p>
          </div>
          <div className="bg-teal-100 border border-emerald-200 p-4 rounded-lg">
            <p className="text-teal-600 text-sm font-medium">This Month</p>
            <p className="text-3xl font-bold text-teal-700 mt-1">{stats.month}</p>
          </div>
          <div className="bg-teal-100 border border-emerald-200 p-4 rounded-lg">
            <p className="text-teal-600 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold text-teal-700 mt-1">{stats.total}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'today'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'week'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'month'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Time
          </button>
        </div>

        {tableLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        ) : servedPatients.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No served patients</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === 'today' && "You haven't served any patients today yet."}
              {filter === 'week' && "You haven't served any patients this week yet."}
              {filter === 'month' && "You haven't served any patients this month yet."}
              {filter === 'all' && "You haven't served any patients yet."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">OP #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Age/Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servedPatients.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-teal-600">{getOPNumber(op)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{op.patients?.full_name}</div>
                        <div className="text-xs text-gray-500">ID: {op.patients?.patient_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {op.patients?.age || 'N/A'} / {op.patients?.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {op.patients?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(op.registration_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {op.notes ? (
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={op.notes}>
                          {op.notes}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-400">No notes</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewPrescriptions(op)}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        View Prescriptions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card bg-emerald-50 border border-emerald-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-teal-900 mb-1">Served Patients Information</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• View all patients you have consulted and served</li>
              <li>• Filter by time period (today, week, month, or all time)</li>
              <li>• Click "View Prescriptions" to see what you prescribed</li>
              <li>• Track your consultation statistics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* OP Ticket Modal */}
      {showModal && selectedOP && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b-4 border-teal-600 pb-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Sanjeevani Ayurvedics 🌿</h1>
                  <p className="text-sm text-gray-600 mt-1">Outpatient Department</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-teal-600">{getOPNumber(selectedOP)}</div>
                  <div className="text-sm text-gray-600">{new Date(selectedOP.registration_date).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h2 className="text-lg font-bold text-teal-900 mb-3">Patient Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Patient ID</p>
                    <p className="text-gray-900 font-semibold">{selectedOP.patients?.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Name</p>
                    <p className="text-gray-900 font-semibold">{selectedOP.patients?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Age / Gender</p>
                    <p className="text-gray-900 font-semibold">{selectedOP.patients?.age} / {selectedOP.patients?.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Phone</p>
                    <p className="text-gray-900 font-semibold">{selectedOP.patients?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-teal-600 font-medium">Doctor</p>
                    <p className="text-gray-900 font-semibold">{selectedOP.doctor?.full_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Doctor's Notes */}
              {selectedOP.notes && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h2 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Doctor&apos;s Notes
                  </h2>
                  <div className="bg-white p-4 rounded border border-green-300">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedOP.notes}</p>
                  </div>
                </div>
              )}

              {/* Medicine Prescriptions */}
              {selectedOP.medicine_prescriptions && selectedOP.medicine_prescriptions.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Medicine Prescriptions
                  </h2>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Medicine</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dosage</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOP.medicine_prescriptions.map((med: any, index: number) => (
                          <tr key={med.id}>
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{med.medicines?.name}</div>
                              <div className="text-xs text-gray-500">{med.medicines?.unit}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{med.quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{med.dosage || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{med.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Physical Treatment Prescriptions */}
              {selectedOP.physical_treatment_prescriptions && selectedOP.physical_treatment_prescriptions.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    Physical Treatment Prescriptions
                  </h2>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Treatment Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOP.physical_treatment_prescriptions.map((treatment: any, index: number) => (
                          <tr key={treatment.id}>
                            <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{treatment.treatment_type}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{treatment.duration || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{treatment.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

