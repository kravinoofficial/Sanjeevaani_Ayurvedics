'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PharmacistPrescriptionsPage() {
  const [opRegistrations, setOpRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const router = useRouter()

  useEffect(() => {
    loadOPRegistrations()
  }, [selectedDate])

  const loadOPRegistrations = async () => {
    setLoading(true)
    
    // Get completed OP registrations for selected date with medicine prescriptions
    const { data, error } = await supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone),
        medicine_prescriptions (
          id,
          medicine_id,
          quantity,
          status,
          medicines (name, unit)
        ),
        physical_treatment_prescriptions (
          id,
          treatment_type,
          status
        )
      `)
      .eq('status', 'completed')
      .eq('registration_date', selectedDate)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading OP registrations:', error)
    }

    // Show all completed OPs (including those with only physical treatments)
    setOpRegistrations(data || [])
    setLoading(false)
  }

  const getOPNumber = (op: any) => {
    // Get all OPs for the same date to calculate the correct index
    const sameDate = opRegistrations.filter(o => o.registration_date === op.registration_date)
    const sortedByTime = sameDate.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const index = sortedByTime.findIndex(o => o.id === op.id)
    return `OP${String(index + 1).padStart(2, '0')}`
  }

  const getPendingMedicinesCount = (op: any) => {
    return op.medicine_prescriptions?.filter((m: any) => m.status === 'pending').length || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">OP Prescriptions</h2>
            <p className="text-gray-600 text-sm mt-1">View and manage medicine prescriptions by OP</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No prescriptions</h3>
            <p className="mt-2 text-sm text-gray-500">
              No OP prescriptions for {new Date(selectedDate).toLocaleDateString('en-US', { 
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prescriptions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opRegistrations.map((op) => {
                  const pendingCount = getPendingMedicinesCount(op)
                  const totalMedicines = op.medicine_prescriptions?.length || 0
                  
                  return (
                    <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-teal-600">{getOPNumber(op)}</span>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {totalMedicines > 0 ? (
                            <span>{totalMedicines} medicine(s)</span>
                          ) : (
                            <span className="text-gray-400 italic">No medicines</span>
                          )}
                        </div>
                        {op.physical_treatment_prescriptions && op.physical_treatment_prescriptions.length > 0 && (
                          <div className="text-xs text-purple-600 mt-1">
                            {op.physical_treatment_prescriptions.length} physical treatment(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pendingCount > 0 ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            {pendingCount} Pending
                          </span>
                        ) : totalMedicines > 0 ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            No Medicines
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/dashboard/pharmacist/prescriptions/${op.id}`)}
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

      <div className="card bg-emerald-50 border border-emerald-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-teal-900 mb-1">Prescription Information</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• All completed OPs are shown, including those with only physical treatments</li>
              <li>• Click "View Details" to see the full OP ticket with all prescriptions</li>
              <li>• You can mark medicines as served or cancelled</li>
              <li>• Add medicines for physical treatments if needed</li>
              <li>• Download PDF ticket for patient records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

