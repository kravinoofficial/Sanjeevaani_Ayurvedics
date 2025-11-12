'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'

export default function PrescriptionDetailPage({ params }: { params: { id: string } }) {
  const [opData, setOpData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [opNumber, setOpNumber] = useState('OP00')
  const [showAddMedicine, setShowAddMedicine] = useState(false)
  const [medicines, setMedicines] = useState<any[]>([])
  const [medicineSearch, setMedicineSearch] = useState('')
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [newPrescription, setNewPrescription] = useState({
    medicine_id: '',
    quantity: 1,
    dosage: '',
    instructions: ''
  })
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null)
  const [report, setReport] = useState('')
  const [modalAction, setModalAction] = useState<'served' | 'cancelled'>('served')
  const router = useRouter()

  useEffect(() => {
    loadOPData()
    loadCurrentUser()
    loadMedicines()
  }, [])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadMedicines = async () => {
    try {
      const response = await fetch('/api/medicines')
      const result = await response.json()
      if (response.ok && result.data) {
        setMedicines(result.data)
      }
    } catch (error) {
      console.error('Error loading medicines:', error)
    }
  }

  const loadOPData = async () => {
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
          instructions,
          status,
          medicines (name, unit, price)
        ),
        physical_treatment_prescriptions (
          id,
          treatment_type,
          duration,
          instructions,
          status
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error loading OP data:', error)
      setOpData(null)
      setLoading(false)
      return
    }

    setOpData(data)
    setLoading(false)
  }

  const updateMedicineStatus = async (prescriptionId: string, status: 'served' | 'cancelled') => {
    try {
      const { error } = await (supabase as any)
        .from('medicine_prescriptions')
        .update({ 
          status, 
          served_by: currentUser?.id || null,
        })
        .eq('id', prescriptionId)
      
      if (error) throw error
      loadOPData()
    } catch (error: any) {
      alert('Error: ' + error.message)
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
      loadOPData()
    } catch (error: any) {
      alert('Error updating treatment: ' + error.message)
    }
  }

  const handleMarkTreatmentAsServed = (treatment: any) => {
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

  const handleAddMedicine = async () => {
    if (!newPrescription.medicine_id) {
      alert('Please select a medicine')
      return
    }
    if (!newPrescription.dosage.trim()) {
      alert('Please enter dosage')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('medicine_prescriptions')
        .insert({
          op_registration_id: params.id,
          medicine_id: newPrescription.medicine_id,
          quantity: newPrescription.quantity,
          dosage: newPrescription.dosage,
          instructions: newPrescription.instructions || null,
          prescribed_by: currentUser?.id || null,
          status: 'pending'
        })

      if (error) throw error

      alert('Medicine added successfully!')
      setShowAddMedicine(false)
      setNewPrescription({ medicine_id: '', quantity: 1, dosage: '', instructions: '' })
      setMedicineSearch('')
      loadOPData()
    } catch (error: any) {
      alert('Error adding medicine: ' + error.message)
    }
  }

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(medicineSearch.toLowerCase())
  )

  const selectedMedicine = medicines.find(m => m.id === newPrescription.medicine_id)

  useEffect(() => {
    const getOPNumber = async () => {
      if (!opData) return
      
      const { data } = await supabase
        .from('op_registrations')
        .select('id, created_at')
        .eq('registration_date', opData.registration_date)
        .order('created_at', { ascending: true })
      
      const index = (data || []).findIndex((op: any) => op.id === opData.id)
      setOpNumber(`OP${String(index + 1).padStart(2, '0')}`)
    }

    if (opData) {
      getOPNumber()
    }
  }, [opData])

  const downloadPDF = () => {
    const printContent = document.getElementById('prescription-content')
    if (!printContent) {
      alert('Prescription content not found')
      return
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      alert('Please allow popups to print')
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription - ${opNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
            body { font-family: 'Georgia', serif; margin: 0; padding: 20px; }
            @media print { body { padding: 0; } @page { margin: 1.5cm; size: A4; } }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            setTimeout(() => { window.print(); }, 500);
            window.onafterprint = () => { window.close(); };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading prescription...</p>
        </div>
      </div>
    )
  }

  if (!opData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">OP not found</p>
        <button onClick={() => router.back()} className="mt-4 btn-secondary">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Action Buttons - Hidden in print */}
        <div className="flex justify-between items-center print:hidden">
        <button
          onClick={() => router.back()}
          className="btn-secondary"
        >
          ← Back to List
        </button>
        <button
          onClick={downloadPDF}
          className="btn-primary flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Prescription */}
      <div id="prescription-content" className="bg-white rounded-xl shadow-lg border-2 border-gray-300 max-w-4xl mx-auto p-8" style={{ fontFamily: 'Georgia, serif' }}>
        {/* Header with Letterhead */}
        <div className="border-b-2 border-gray-800 pb-6 mb-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>Sanjeevani Ayurvedics 🌿</h1>
            <p className="text-gray-700 text-sm">Authentic Ayurveda • Personalized Treatments</p>
            <p className="text-gray-600 text-xs mt-1">📍 Chanthavila, Thiruvananthapuram 695584 | 📞 8589007205</p>
            <p className="text-gray-600 text-xs">✨ Restore Balance. Revive Health</p>
          </div>
        </div>

        {/* Patient Details */}
        <div className="mb-6 pb-6 border-b border-gray-400">
          <div className="space-y-3">
            <div className="flex items-baseline">
              <span className="text-gray-600 font-medium uppercase text-xs tracking-wide w-32">Patient Name</span>
              <span className="text-gray-900 font-bold text-lg flex-1 border-b border-dotted border-gray-400 pb-1">
                {opData.patients?.full_name}
              </span>
              <span className="text-gray-600 font-medium uppercase text-xs tracking-wide w-16 text-right ml-8">OP01</span>
              <span className="text-gray-900 font-semibold text-right ml-4">
                {opNumber}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-gray-600 font-medium text-sm w-16">Age</span>
              <span className="text-gray-900 font-semibold w-24 border-b border-dotted border-gray-400 pb-1">
                {opData.patients?.age} years
              </span>
              <span className="text-gray-600 font-medium text-sm w-20 ml-4">Gender</span>
              <span className="text-gray-900 font-semibold w-24 border-b border-dotted border-gray-400 pb-1">
                {opData.patients?.gender}
              </span>
              <span className="text-gray-600 font-medium text-sm ml-auto mr-4">Date</span>
              <span className="text-gray-900 font-semibold">
                {new Date(opData.registration_date).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-gray-600 font-medium text-sm w-32">Patient ID</span>
              <span className="text-gray-900 font-semibold border-b border-dotted border-gray-400 pb-1">
                {opData.patients?.patient_id}
              </span>
              <span className="text-gray-600 font-medium text-sm ml-auto mr-4">Consulting Doctor</span>
              <span className="text-gray-900 font-bold">
                Dr. {opData.doctor?.full_name || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Medicine Prescriptions */}
        <div className="mb-6 px-8">
          {opData.medicine_prescriptions && opData.medicine_prescriptions.length > 0 ? (
            <div className="space-y-3">
              {opData.medicine_prescriptions.map((med: any, index: number) => (
                <div key={med.id} className="flex items-start gap-3 py-1">
                  <span className="text-base font-bold text-gray-800 min-w-[28px]">{index + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-base font-bold text-gray-900 mb-1">{med.medicines?.name}</p>
                        <div className="text-sm text-gray-700 space-y-0.5 ml-4">
                          <p>Dosage: {med.dosage}</p>
                          {med.instructions && <p className="text-xs italic text-gray-600">{med.instructions}</p>}
                          <p className="text-xs text-gray-600">Quantity: {med.quantity} {med.medicines?.unit}</p>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          med.status === 'served' ? 'bg-green-100 text-green-800' :
                          med.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {med.status === 'cancelled' ? 'N/A' : med.status}
                        </span>
                        {med.status === 'pending' && (
                          <div className="flex gap-1.5 print:hidden">
                            <button
                              onClick={() => updateMedicineStatus(med.id, 'served')}
                              className="text-xs bg-green-600 text-white px-2.5 py-1 rounded hover:bg-green-700"
                            >
                              Served
                            </button>
                            <button
                              onClick={() => updateMedicineStatus(med.id, 'cancelled')}
                              className="text-xs bg-red-600 text-white px-2.5 py-1 rounded hover:bg-red-700"
                            >
                              N/A
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 print:hidden">
              <p className="text-gray-500 mb-2">No medicines prescribed</p>
              <button onClick={() => setShowAddMedicine(true)} className="btn-primary text-sm">
                Add Medicine
              </button>
            </div>
          )}
          
          {/* Add Medicine Button */}
          {opData.medicine_prescriptions && opData.medicine_prescriptions.length > 0 && (
            <div className="text-center mt-3 print:hidden">
              <button
                onClick={() => setShowAddMedicine(true)}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center mx-auto border-2 border-dashed border-blue-300 hover:border-blue-400 px-4 py-1.5 rounded-lg"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Medicine
              </button>
            </div>
          )}
        </div>

        {/* Physical Treatments */}
        {opData.physical_treatment_prescriptions && opData.physical_treatment_prescriptions.length > 0 && (
          <div className="mb-6 pt-4 border-t border-gray-300 px-8">
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">
              Physical Treatment Recommendations
            </h3>
            <div className="space-y-2.5">
              {opData.physical_treatment_prescriptions.map((treatment: any, index: number) => (
                <div key={treatment.id} className="flex items-start gap-3 py-1">
                  <span className="text-base font-bold text-gray-800 min-w-[28px]">{index + 1}.</span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-base font-bold text-gray-900">{treatment.treatment_type}</p>
                        <div className="ml-4 mt-0.5">
                          {treatment.duration && (
                            <p className="text-sm text-gray-700">Duration: {treatment.duration}</p>
                          )}
                          {treatment.instructions && (
                            <p className="text-xs text-gray-600 italic">{treatment.instructions}</p>
                          )}
                        </div>
                        {treatment.report && (
                          <div className={`ml-4 mt-2 p-2 rounded text-xs ${
                            treatment.status === 'served' 
                              ? 'bg-green-50 text-green-800 border border-green-200' 
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}>
                            <p className="font-semibold mb-1">
                              {treatment.status === 'served' ? 'Report:' : 'Cancellation Reason:'}
                            </p>
                            <p className="whitespace-pre-wrap">{treatment.report}</p>
                          </div>
                        )}
                      </div>
                      {/* Status Badge and Actions */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          treatment.status === 'served' ? 'bg-blue-100 text-blue-800' :
                          treatment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {treatment.status}
                        </span>
                        {treatment.status === 'pending' && (
                          <div className="flex gap-1.5 print:hidden">
                            <button
                              onClick={() => handleMarkTreatmentAsServed(treatment)}
                              className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded hover:bg-blue-700"
                            >
                              Served
                            </button>
                            <button
                              onClick={() => handleCancelTreatment(treatment)}
                              className="text-xs bg-red-600 text-white px-2.5 py-1 rounded hover:bg-red-700"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor's Signature */}
        <div className="mt-12 pt-6 border-t border-gray-300">
          <div className="flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p className="mb-1">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p className="text-xs text-gray-500 mt-4">This is a computer-generated prescription</p>
            </div>
            <div className="text-right">
              <div className="border-t-2 border-gray-800 w-48 mb-2"></div>
              <p className="font-semibold text-gray-900">Dr. {opData.doctor?.full_name || 'N/A'}</p>
              <p className="text-sm text-gray-600">Medical Practitioner</p>
              <p className="text-xs text-gray-500 mt-1">Reg. No: MED-{opData.doctor_id?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 italic">
            Please follow the prescribed dosage and consult your doctor if symptoms persist.
          </p>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicine && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddMedicine(false)
              setNewPrescription({ medicine_id: '', quantity: 1, dosage: '', instructions: '' })
              setMedicineSearch('')
              setShowMedicineDropdown(false)
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Medicine to Prescription</h3>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={selectedMedicine ? `${selectedMedicine.name} (${selectedMedicine.unit}) - ₹${selectedMedicine.price}` : medicineSearch}
                    onChange={(e) => {
                      setMedicineSearch(e.target.value)
                      setNewPrescription({ ...newPrescription, medicine_id: '' })
                      setShowMedicineDropdown(true)
                    }}
                    onFocus={() => setShowMedicineDropdown(true)}
                    className="input-field pr-10"
                  />
                  <svg 
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {showMedicineDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map((med) => (
                        <div
                          key={med.id}
                          onClick={() => {
                            setNewPrescription({ ...newPrescription, medicine_id: med.id })
                            setMedicineSearch('')
                            setShowMedicineDropdown(false)
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{med.name}</div>
                          <div className="text-sm text-gray-600">{med.unit} - ₹{med.price}</div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No medicines found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={newPrescription.quantity}
                    onChange={(e) => setNewPrescription({ ...newPrescription, quantity: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage *</label>
                  <input
                    type="text"
                    placeholder="e.g., 1-0-1"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription({ ...newPrescription, instructions: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="e.g., After meals, with water"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddMedicine} className="btn-primary flex-1">
                  Add Medicine
                </button>
                <button 
                  onClick={() => {
                    setShowAddMedicine(false)
                    setNewPrescription({ medicine_id: '', quantity: 1, dosage: '', instructions: '' })
                    setMedicineSearch('')
                    setShowMedicineDropdown(false)
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

      {/* Treatment Report Modal */}
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
