'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PatientDetailsPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null)
  const [opHistory, setOpHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'history'>('overview')
  const [showMedicineModal, setShowMedicineModal] = useState(false)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadPatientData()
  }, [])

  const loadPatientData = async () => {
    setLoading(true)

    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', params.id)
      .single()

    if (patientError) {
      console.error('Error loading patient:', patientError)
      setLoading(false)
      return
    }

    setPatient(patientData)

    const { data: opData, error: opError } = await supabase
      .from('op_registrations')
      .select(`
        *,
        doctor:users!op_registrations_doctor_id_fkey (full_name),
        medicine_prescriptions (
          id,
          medicine_id,
          quantity,
          dosage,
          instructions,
          status,
          medicines (name, unit, price)
        ),
        physical_treatment_prescriptions (
          id,
          treatment_type,
          duration,
          instructions,
          report,
          status
        )
      `)
      .eq('patient_id', params.id)
      .order('registration_date', { ascending: false })

    if (!opError) {
      setOpHistory(opData || [])
    }

    setLoading(false)
  }

  const getOPNumber = (op: any, index: number) => {
    return `OP${String(index + 1).padStart(2, '0')}`
  }

  const handleMedicineClick = (medicine: any) => {
    setSelectedMedicine(medicine)
    setShowMedicineModal(true)
  }

  const handleTreatmentClick = (treatment: any) => {
    setSelectedTreatment(treatment)
    setShowTreatmentModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Patient not found</p>
        <button onClick={() => router.back()} className="mt-4 btn-secondary">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patient Details</h1>
          <p className="text-gray-600 mt-1">Complete patient information and history</p>
        </div>
        <button onClick={() => router.back()} className="btn-secondary">
          ← Back
        </button>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-4">
              {patient.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{patient.full_name}</h2>
              <p className="text-gray-600">Patient ID: {patient.patient_id}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {opHistory.length} Total Visits
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-1">Age</p>
            <p className="text-2xl font-bold text-blue-900">{patient.age || 'N/A'}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium mb-1">Gender</p>
            <p className="text-2xl font-bold text-purple-900 capitalize">{patient.gender || 'N/A'}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium mb-1">Phone</p>
            <p className="text-lg font-bold text-green-900">{patient.phone || 'N/A'}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-600 font-medium mb-1">Registered</p>
            <p className="text-sm font-bold text-orange-900">
              {new Date(patient.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {patient.address && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 font-medium mb-1">Address</p>
            <p className="text-gray-900">{patient.address}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`pb-3 px-2 font-semibold transition-colors border-b-2 ${
                selectedTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`pb-3 px-2 font-semibold transition-colors border-b-2 ${
                selectedTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Visit History ({opHistory.length})
            </button>
          </div>
        </div>

        {selectedTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-blue-900">Total Visits</h3>
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-blue-900">{opHistory.length}</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-green-900">Medicine Prescriptions</h3>
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-green-900">
                  {opHistory.reduce((sum, op) => sum + (op.medicine_prescriptions?.length || 0), 0)}
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-purple-900">Physical Treatments</h3>
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <p className="text-4xl font-bold text-purple-900">
                  {opHistory.reduce((sum, op) => sum + (op.physical_treatment_prescriptions?.length || 0), 0)}
                </p>
              </div>
            </div>

            {opHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Visits</h3>
                <div className="space-y-3">
                  {opHistory.slice(0, 5).map((op, index) => (
                    <div key={op.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                              {getOPNumber(op, index)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(op.registration_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Doctor: {op.doctor?.full_name || 'N/A'}</span>
                            <span>•</span>
                            <span>{op.medicine_prescriptions?.length || 0} Medicine(s)</span>
                            <span>•</span>
                            <span>{op.physical_treatment_prescriptions?.length || 0} Treatment(s)</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          op.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          op.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {op.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'history' && (
          <div>
            {opHistory.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No visit history</h3>
                <p className="mt-2 text-sm text-gray-500">This patient has no recorded visits yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {opHistory.map((op, index) => (
                  <div key={op.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
                            {getOPNumber(op, index)}
                          </span>
                          <span className="text-lg font-bold text-gray-800">
                            {new Date(op.registration_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Doctor: {op.doctor?.full_name || 'N/A'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        op.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        op.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {op.status}
                      </span>
                    </div>

                    {op.medicine_prescriptions && op.medicine_prescriptions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          Medicines ({op.medicine_prescriptions.length})
                        </h4>
                        <div className="space-y-2">
                          {op.medicine_prescriptions.map((med: any) => (
                            <div 
                              key={med.id} 
                              onClick={() => handleMedicineClick(med)}
                              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{med.medicines?.name}</p>
                                <p className="text-sm text-gray-600">
                                  {med.dosage} • Qty: {med.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  med.status === 'served' ? 'bg-blue-100 text-blue-800' :
                                  med.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {med.status}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {op.physical_treatment_prescriptions && op.physical_treatment_prescriptions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Physical Treatments ({op.physical_treatment_prescriptions.length})
                        </h4>
                        <div className="space-y-2">
                          {op.physical_treatment_prescriptions.map((treatment: any) => (
                            <div 
                              key={treatment.id}
                              onClick={() => handleTreatmentClick(treatment)}
                              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-gray-900">{treatment.treatment_type}</p>
                                {treatment.duration && (
                                  <p className="text-sm text-gray-600">Duration: {treatment.duration}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  treatment.status === 'served' ? 'bg-blue-100 text-blue-800' :
                                  treatment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {treatment.status}
                                </span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {op.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{op.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medicine Detail Modal */}
      {showMedicineModal && selectedMedicine && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMedicineModal(false)
              setSelectedMedicine(null)
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Medicine Details</h3>
              <button
                onClick={() => {
                  setShowMedicineModal(false)
                  setSelectedMedicine(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-blue-900 mb-2">{selectedMedicine.medicines?.name}</h4>
                <p className="text-sm text-blue-700">{selectedMedicine.medicines?.unit}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Quantity</p>
                  <p className="text-lg font-bold text-gray-900">{selectedMedicine.quantity}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Price</p>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{selectedMedicine.medicines?.price ? (Number(selectedMedicine.medicines.price) * selectedMedicine.quantity).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Dosage</p>
                <p className="text-sm text-gray-900">{selectedMedicine.dosage || 'N/A'}</p>
              </div>

              {selectedMedicine.instructions && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Instructions</p>
                  <p className="text-sm text-gray-900">{selectedMedicine.instructions}</p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedMedicine.status === 'served' ? 'bg-blue-100 text-blue-800' :
                  selectedMedicine.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedMedicine.status === 'cancelled' ? 'Not Available' : selectedMedicine.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Detail Modal */}
      {showTreatmentModal && selectedTreatment && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTreatmentModal(false)
              setSelectedTreatment(null)
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Treatment Details</h3>
              <button
                onClick={() => {
                  setShowTreatmentModal(false)
                  setSelectedTreatment(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="text-lg font-bold text-purple-900 mb-2">{selectedTreatment.treatment_type}</h4>
                {selectedTreatment.duration && (
                  <p className="text-sm text-purple-700">Duration: {selectedTreatment.duration}</p>
                )}
              </div>

              {selectedTreatment.instructions && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">Instructions</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTreatment.instructions}</p>
                </div>
              )}

              {selectedTreatment.report && (
                <div className={`p-3 rounded-lg ${
                  selectedTreatment.status === 'served' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-xs font-medium mb-1 ${
                    selectedTreatment.status === 'served' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {selectedTreatment.status === 'served' ? 'Treatment Report' : 'Cancellation Reason'}
                  </p>
                  <p className={`text-sm whitespace-pre-wrap ${
                    selectedTreatment.status === 'served' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedTreatment.report}
                  </p>
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedTreatment.status === 'served' ? 'bg-blue-100 text-blue-800' :
                  selectedTreatment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedTreatment.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
