'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'

export default function TreatmentDetailsPage({ params }: { params: { id: string } }) {
  const [registration, setRegistration] = useState<any>(null)
  const [treatments, setTreatments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null)
  const [report, setReport] = useState('')
  const [modalAction, setModalAction] = useState<'served' | 'cancelled'>('served')
  const router = useRouter()

  useEffect(() => {
    loadData()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: reg, error: regError } = await supabase
        .from('op_registrations')
        .select(`
          *,
          patients (*)
        `)
        .eq('id', params.id)
        .single()

      if (regError) {
        console.error('Error loading registration:', regError)
        setError('Failed to load patient information')
        setLoading(false)
        return
      }

      if (!reg) {
        setError('Patient registration not found')
        setLoading(false)
        return
      }

      setRegistration(reg)

      const { data: treatmentData, error: treatmentError } = await supabase
        .from('physical_treatment_prescriptions')
        .select('*')
        .eq('op_registration_id', params.id)
        .order('created_at')

      if (treatmentError) {
        console.error('Error loading treatments:', treatmentError)
      }

      setTreatments(treatmentData || [])
      setLoading(false)
    } catch (err: any) {
      console.error('Error in loadData:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const updateTreatmentStatus = async (treatmentId: string, status: 'served' | 'cancelled', reportText?: string) => {
    try {
      const updateData: any = {
        status: status,
        served_by: status === 'served' ? currentUser?.id : null,
      }

      if (reportText) {
        updateData.report = reportText
      }

      const { error } = await (supabase as any)
        .from('physical_treatment_prescriptions')
        .update(updateData)
        .eq('id', treatmentId)

      if (error) throw error

      alert(`Treatment ${status} successfully!`)
      setShowReportModal(false)
      setSelectedTreatment(null)
      setReport('')
      setModalAction('served')
      loadData()
    } catch (error: any) {
      alert('Error updating treatment: ' + error.message)
    }
  }

  const handleMarkAsServed = (treatment: any) => {
    setSelectedTreatment(treatment)
    setReport('')
    setModalAction('served')
    setShowReportModal(true)
  }

  const handleCancelTreatment = (treatment: any) => {
    setSelectedTreatment(treatment)
    setReport('')
    setModalAction('cancelled')
    setShowReportModal(true)
  }

  const handleSubmitReport = () => {
    if (!report.trim()) {
      const action = modalAction === 'served' ? 'marking as served' : 'canceling'
      alert(`Please enter a report before ${action}`)
      return
    }
    updateTreatmentStatus(selectedTreatment.id, modalAction, report)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading treatment details...</p>
        </div>
      </div>
    )
  }

  if (error || !registration) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">{error || 'Patient not found'}</h3>
          <p className="mt-2 text-sm text-gray-500">Unable to load treatment information</p>
          <button
            onClick={() => router.back()}
            className="mt-4 btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Physical Treatment Details</h2>
            <p className="text-gray-600 text-sm mt-1">Manage physical treatment prescriptions</p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn-secondary text-sm"
          >
            ← Back to List
          </button>
        </div>

        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Patient Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Patient ID</p>
              <p className="text-blue-900 font-bold">{registration.patients?.patient_id}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Name</p>
              <p className="text-blue-900 font-bold">{registration.patients?.full_name}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Age</p>
              <p className="text-blue-900 font-bold">{registration.patients?.age || 'N/A'}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Gender</p>
              <p className="text-blue-900 font-bold">{registration.patients?.gender || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-blue-600 font-medium text-sm">Registration Date:</p>
            <p className="text-blue-900 mt-1">
              {new Date(registration.registration_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            Prescribed Treatments ({treatments.length})
          </h3>

          {treatments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No treatments prescribed for this patient.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treatments.map((treatment) => (
                <div key={treatment.id} className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{treatment.treatment_type}</h4>
                      {treatment.duration && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Duration: {treatment.duration}
                        </div>
                      )}
                      {treatment.instructions && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Instructions:</p>
                          <p className="text-sm text-blue-800">{treatment.instructions}</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {treatment.status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {treatment.status === 'served' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          Served
                        </span>
                      )}
                      {treatment.status === 'cancelled' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {treatment.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleMarkAsServed(treatment)}
                        className="btn-primary text-sm flex-1"
                      >
                        Mark as Served
                      </button>
                      <button
                        onClick={() => handleCancelTreatment(treatment)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex-1"
                      >
                        Cancel Treatment
                      </button>
                    </div>
                  )}

                  {treatment.report && (
                    <div className={`mt-4 p-4 rounded-lg border ${
                      treatment.status === 'served' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-sm font-semibold mb-2 ${
                        treatment.status === 'served' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {treatment.status === 'served' ? 'Treatment Report:' : 'Cancellation Reason:'}
                      </p>
                      <p className={`text-sm whitespace-pre-wrap ${
                        treatment.status === 'served' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {treatment.report}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Prescribed on: {new Date(treatment.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Treatment Management</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review all prescribed treatments for this patient</li>
              <li>• Mark treatments as served when completed</li>
              <li>• Cancel treatments if necessary</li>
              <li>• View treatment instructions and duration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && selectedTreatment && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowReportModal(false)
              setSelectedTreatment(null)
              setReport('')
              setModalAction('served')
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {modalAction === 'served' ? 'Treatment Report' : 'Cancel Treatment'}
            </h3>
            <div className={`mb-4 p-4 rounded-lg border ${
              modalAction === 'served' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm font-semibold ${
                modalAction === 'served' ? 'text-blue-900' : 'text-red-900'
              }`}>
                Treatment: {selectedTreatment.treatment_type}
              </p>
              {selectedTreatment.duration && (
                <p className={`text-sm mt-1 ${
                  modalAction === 'served' ? 'text-blue-700' : 'text-red-700'
                }`}>
                  Duration: {selectedTreatment.duration}
                </p>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {modalAction === 'served' ? 'Treatment Report *' : 'Cancellation Reason *'}
                </label>
                <textarea
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  className="input-field"
                  rows={6}
                  placeholder={
                    modalAction === 'served'
                      ? 'Enter detailed report about the treatment provided, patient response, observations, and any recommendations...'
                      : 'Enter the reason for canceling this treatment (e.g., patient unavailable, equipment issue, medical contraindication)...'
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  {modalAction === 'served'
                    ? 'Please provide a comprehensive report of the treatment session'
                    : 'Please provide a clear reason for canceling this treatment'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSubmitReport}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    modalAction === 'served'
                      ? 'btn-primary'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {modalAction === 'served' ? 'Submit & Mark as Served' : 'Submit & Cancel Treatment'}
                </button>
                <button 
                  onClick={() => {
                    setShowReportModal(false)
                    setSelectedTreatment(null)
                    setReport('')
                    setModalAction('served')
                  }} 
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
