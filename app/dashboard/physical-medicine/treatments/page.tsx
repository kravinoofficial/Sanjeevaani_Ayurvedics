'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PhysicalMedicineTreatmentsPage() {
  const [opRegistrations, setOpRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const router = useRouter()

  useEffect(() => {
    loadOPRegistrations()
  }, [selectedDate])

  const loadOPRegistrations = async () => {
    setLoading(true)
    
    // Get completed OP registrations for selected date with physical treatment prescriptions
    const { data, error } = await supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone),
        physical_treatment_prescriptions (
          id,
          treatment_type,
          duration,
          instructions,
          status
        )
      `)
      .eq('status', 'completed')
      .eq('registration_date', selectedDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading OP registrations:', error)
    }

    // Filter to only show OPs that have physical treatment prescriptions
    const opsWithTreatments = (data || []).filter(op => 
      op.physical_treatment_prescriptions && op.physical_treatment_prescriptions.length > 0
    )

    setOpRegistrations(opsWithTreatments)
    setLoading(false)
  }

  const getOPNumber = (op: any) => {
    const sameDate = opRegistrations.filter(o => o.registration_date === op.registration_date)
    const sortedByTime = sameDate.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const index = sortedByTime.findIndex(o => o.id === op.id)
    return `OP${String(index + 1).padStart(2, '0')}`
  }

  const getPendingTreatmentsCount = (op: any) => {
    return op.physical_treatment_prescriptions?.filter((t: any) => t.status === 'pending').length || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading treatments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Physical Treatment Prescriptions</h2>
            <p className="text-gray-600 text-sm mt-1">View and manage physical treatment prescriptions by OP</p>
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

        {opRegistrations.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No treatments</h3>
            <p className="mt-2 text-sm text-gray-500">
              No physical treatment prescriptions for {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">OP #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Age/Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Treatments</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opRegistrations.map((op) => {
                  const pendingCount = getPendingTreatmentsCount(op)
                  const totalTreatments = op.physical_treatment_prescriptions?.length || 0
                  
                  return (
                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-blue-600">{getOPNumber(op)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{op.patients?.full_name}</div>
                          <div className="text-xs text-gray-500">ID: {op.patients?.patient_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {op.patients?.age} / {op.patients?.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(op.registration_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {totalTreatments} treatment(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pendingCount > 0 ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            {pendingCount} Pending
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/dashboard/physical-medicine/treatments/${op.id}`)}
                          className="btn-primary text-sm"
                        >
                          View Details
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

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Treatment Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "View Details" to see full treatment details</li>
              <li>• Add notes and mark treatments as served or cancelled</li>
              <li>• Filter by date to view historical treatments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
