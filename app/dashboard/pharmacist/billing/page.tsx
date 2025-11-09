'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PharmacistBillingPage() {
  const [ops, setOps] = useState<any[]>([])
  const [consultationFee, setConsultationFee] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const router = useRouter()

  useEffect(() => {
    loadConsultationFee()
    loadOPs()
  }, [selectedDate])

  const loadConsultationFee = async () => {
    const { data } = await (supabase as any)
      .from('charges')
      .select('amount')
      .eq('charge_type', 'consultation')
      .single()

    if (data) {
      setConsultationFee(Number(data.amount))
    }
  }

  const loadOPs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone, address),
        doctor:users!op_registrations_doctor_id_fkey (full_name),
        medicine_prescriptions (
          id,
          medicine_id,
          quantity,
          dosage,
          status,
          medicines (name, unit, price)
        ),
        physical_treatment_prescriptions (
          id,
          treatment_id,
          treatment_type,
          duration,
          status,
          physical_treatments (name, price)
        )
      `)
      .eq('status', 'completed')
      .eq('registration_date', selectedDate)
      .order('created_at', { ascending: false })

    if (!error) {
      setOps(data || [])
    }
    setLoading(false)
  }

  const calculateTotal = (op: any) => {
    let total = consultationFee
    
    // Add served medicines
    op.medicine_prescriptions?.forEach((med: any) => {
      if (med.status === 'served' && med.medicines?.price) {
        total += Number(med.medicines.price) * med.quantity
      }
    })
    
    // Add served treatments
    op.physical_treatment_prescriptions?.forEach((treatment: any) => {
      if (treatment.status === 'served' && treatment.physical_treatments?.price) {
        total += Number(treatment.physical_treatments.price)
      }
    })
    
    return total
  }

  const filteredOps = ops.filter(op =>
    op.patients?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.patients?.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading billing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Billing & Invoices</h2>
            <p className="text-gray-600 text-sm mt-1">Generate bills for completed OPs</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="btn-secondary whitespace-nowrap"
            >
              Today
            </button>
          </div>
        </div>

        {filteredOps.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No completed OPs</h3>
            <p className="mt-2 text-sm text-gray-500">No completed OPs found for the selected date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase">OP #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filteredOps.map((op, index) => {
                  const servedMeds = op.medicine_prescriptions?.filter((m: any) => m.status === 'served').length || 0
                  const servedTreatments = op.physical_treatment_prescriptions?.filter((t: any) => t.status === 'served').length || 0
                  const total = calculateTotal(op)
                  
                  return (
                    <tr key={op.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-600">OP{String(index + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{op.patients?.full_name}</div>
                          <div className="text-xs text-gray-500">ID: {op.patients?.patient_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {op.doctor?.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-600">Consultation + {servedMeds} Medicine(s) + {servedTreatments} Treatment(s)</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-blue-600">₹{total.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/pharmacist/billing/${op.id}`)}
                          className="btn-primary text-sm"
                        >
                          Generate Bill
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
    </div>
  )
}
