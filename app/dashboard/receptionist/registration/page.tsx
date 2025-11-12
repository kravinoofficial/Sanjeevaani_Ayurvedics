'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export default function ReceptionistRegistrationPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [notes, setNotes] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [nextOpNumber, setNextOpNumber] = useState('')
  const [consultationFee, setConsultationFee] = useState(500)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showTicket, setShowTicket] = useState(false)
  const [ticketData, setTicketData] = useState<any>(null)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [newPatient, setNewPatient] = useState({
    full_name: '',
    age: '',
    gender: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    loadPatients()
    loadDoctors()
    loadCurrentUser()
    loadRecentRegistrations()
    generateOpNumber()
    loadConsultationFee()
  }, [])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadConsultationFee = async () => {
    const { data } = await (supabase as any)
      .from('charges')
      .select('amount')
      .eq('charge_type', 'consultation')
      .eq('is_active', true)
      .single()
    
    if (data) {
      setConsultationFee(Number(data.amount))
    }
  }

  const loadPatients = async () => {
    const { data } = await supabase.from('patients').select('*').order('full_name')
    setPatients(data || [])
  }

  const handleAddPatient = async () => {
    if (!newPatient.full_name.trim()) {
      alert('Please enter patient name')
      return
    }
    if (!newPatient.age) {
      alert('Please enter patient age')
      return
    }
    if (!newPatient.gender) {
      alert('Please select patient gender')
      return
    }
    if (!newPatient.phone.trim()) {
      alert('Please enter patient phone number')
      return
    }
    if (!newPatient.address.trim()) {
      alert('Please enter patient address')
      return
    }

    try {
      // Generate patient ID
      const { count } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
      
      const patientId = `P${String((count || 0) + 1).padStart(3, '0')}`

      const { data, error } = await (supabase as any)
        .from('patients')
        .insert({
          patient_id: patientId,
          full_name: newPatient.full_name,
          age: parseInt(newPatient.age),
          gender: newPatient.gender,
          phone: newPatient.phone,
          address: newPatient.address,
          created_by: currentUser?.id || null
        })
        .select()
        .single()

      if (error) throw error

      alert('Patient added successfully!')
      setShowAddPatient(false)
      setNewPatient({ full_name: '', age: '', gender: '', phone: '', address: '' })
      loadPatients()
      
      // Auto-select the new patient
      if (data) {
        setSelectedPatient(data.id)
        setPatientSearch('')
      }
    } catch (error: any) {
      alert('Error adding patient: ' + error.message)
    }
  }

  const loadDoctors = async () => {
    const { data } = await (supabase as any)
      .from('users')
      .select('id, full_name')
      .eq('role', 'doctor')
      .eq('is_active', true)
      .order('full_name')
    setDoctors(data || [])
  }

  const generateOpNumber = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { count } = await supabase
      .from('op_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('registration_date', today)
    
    const opNum = (count || 0) + 1
    setNextOpNumber(`OP${String(opNum).padStart(2, '0')}`)
  }

  const loadRecentRegistrations = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('op_registrations')
      .select('*, patients(patient_id, full_name), users!op_registrations_doctor_id_fkey(full_name)')
      .eq('registration_date', today)
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentRegistrations(data || [])
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Insert OP registration
      const { data: opData, error: opError } = await (supabase as any)
        .from('op_registrations')
        .insert({
          patient_id: selectedPatient,
          doctor_id: selectedDoctor || null,
          notes: notes || null,
          created_by: currentUser?.id || null,
        })
        .select(`
          *,
          patients (id, patient_id, full_name, age, gender, phone, address),
          users!op_registrations_doctor_id_fkey (full_name)
        `)
        .single()

      if (opError) {
        alert('Error registering patient: ' + opError.message)
        setLoading(false)
        return
      }

      // Generate bill number
      const billNumber = `BILL-${Date.now()}`

      // Create bill for consultation fee
      const { data: billData, error: billError } = await (supabase as any)
        .from('bills')
        .insert({
          bill_number: billNumber,
          op_registration_id: opData.id,
          patient_id: selectedPatient,
          total_amount: consultationFee,
          discount_amount: 0,
          tax_amount: 0,
          final_amount: consultationFee,
          payment_status: 'paid',
          payment_method: paymentMethod,
          notes: 'Consultation fee collected at registration',
          created_by: currentUser?.id || null,
        })
        .select()
        .single()

      if (billError) {
        console.error('Error creating bill:', billError)
      }

      // Create bill item for consultation
      if (billData) {
        await (supabase as any)
          .from('bill_items')
          .insert({
            bill_id: billData.id,
            item_type: 'consultation',
            item_name: 'Consultation Fee',
            quantity: 1,
            unit_price: consultationFee,
            total_price: consultationFee,
          })

        // Create payment record
        await (supabase as any)
          .from('payments')
          .insert({
            bill_id: billData.id,
            amount: consultationFee,
            payment_method: paymentMethod,
            received_by: currentUser?.id || null,
            notes: 'Consultation fee payment',
          })
      }

      // Prepare ticket data with patient details
      const ticketInfo = {
        ...opData,
        opNumber: nextOpNumber,
        billNumber: billNumber,
        consultationFee: consultationFee,
        paymentMethod: paymentMethod,
        // Ensure patient data is available
        patients: opData.patients || selectedPatientData,
      }
      
      console.log('Ticket Data:', ticketInfo)
      setTicketData(ticketInfo)
      setShowTicket(true)

      // Reset form
      setSelectedPatient('')
      setSelectedDoctor('')
      setNotes('')
      setPaymentMethod('cash')
      setLoading(false)
      loadRecentRegistrations()
      generateOpNumber()
    } catch (error: any) {
      alert('Error: ' + error.message)
      setLoading(false)
    }
  }

  const printTicket = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (!printWindow) {
      alert('Please allow popups to print the ticket')
      return
    }

    const ticketHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>OP Ticket - ${ticketData.opNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            body {
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 20px;
              background: white;
            }
            .ticket-container {
              max-width: 600px;
              margin: 0 auto;
              border: 4px solid #2563eb;
              border-radius: 12px;
              padding: 24px;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .header h1 {
              font-size: 28px;
              font-weight: bold;
              color: #1e3a8a;
              margin-bottom: 4px;
            }
            .header p {
              color: #4b5563;
              font-size: 14px;
            }
            .op-number {
              text-align: center;
              background: #eff6ff;
              padding: 16px;
              border-radius: 8px;
              border: 2px solid #93c5fd;
              margin-bottom: 24px;
            }
            .op-number p:first-child {
              font-size: 12px;
              color: #2563eb;
              font-weight: 500;
            }
            .op-number p:last-child {
              font-size: 48px;
              font-weight: bold;
              color: #1e3a8a;
              margin-top: 4px;
            }
            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 24px;
            }
            .detail-item p:first-child {
              font-size: 11px;
              color: #4b5563;
              font-weight: 500;
              margin-bottom: 2px;
            }
            .detail-item p:last-child {
              font-size: 16px;
              font-weight: bold;
              color: #111827;
            }
            .doctor-box {
              background: #faf5ff;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #e9d5ff;
              margin-bottom: 16px;
            }
            .doctor-box p:first-child {
              font-size: 11px;
              color: #9333ea;
              font-weight: 500;
            }
            .doctor-box p:last-child {
              font-size: 14px;
              font-weight: bold;
              color: #581c87;
            }
            .payment-box {
              background: #f0fdf4;
              padding: 16px;
              border-radius: 8px;
              border: 1px solid #bbf7d0;
              border-top: 2px solid #d1d5db;
              padding-top: 16px;
              margin-bottom: 16px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .payment-row span:first-child {
              font-size: 13px;
              font-weight: 500;
              color: #374151;
            }
            .payment-row.fee span:last-child {
              font-size: 20px;
              font-weight: bold;
              color: #15803d;
            }
            .payment-row span:last-child {
              font-size: 13px;
              font-weight: 600;
              color: #111827;
              text-transform: uppercase;
            }
            .status-badge {
              background: #16a34a;
              color: white;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: bold;
            }
            .bill-number {
              text-align: center;
              font-size: 11px;
              color: #6b7280;
              margin-bottom: 16px;
            }
            .footer {
              border-top: 2px solid #d1d5db;
              padding-top: 16px;
              text-align: center;
            }
            .footer p {
              font-size: 11px;
              color: #4b5563;
              font-style: italic;
              margin-bottom: 8px;
            }
            @media print {
              body { padding: 0; margin: 0; }
              @page { 
                margin: 0.3cm; 
                size: A5 portrait; 
              }
              .ticket-container {
                padding: 16px;
                border-width: 3px;
              }
              .header {
                padding-bottom: 12px;
                margin-bottom: 16px;
              }
              .header h1 {
                font-size: 24px;
                margin-bottom: 2px;
              }
              .header p {
                font-size: 12px;
              }
              .op-number {
                padding: 12px;
                margin-bottom: 16px;
              }
              .op-number p:last-child {
                font-size: 40px;
                margin-top: 2px;
              }
              .details {
                gap: 12px;
                margin-bottom: 16px;
              }
              .detail-item p:first-child {
                font-size: 10px;
                margin-bottom: 1px;
              }
              .detail-item p:last-child {
                font-size: 14px;
              }
              .doctor-box {
                padding: 10px;
                margin-bottom: 12px;
              }
              .doctor-box p:first-child {
                font-size: 10px;
              }
              .doctor-box p:last-child {
                font-size: 13px;
              }
              .payment-box {
                padding: 12px;
                margin-bottom: 12px;
              }
              .payment-row {
                margin-bottom: 6px;
              }
              .payment-row span:first-child {
                font-size: 12px;
              }
              .payment-row.fee span:last-child {
                font-size: 18px;
              }
              .payment-row span:last-child {
                font-size: 12px;
              }
              .status-badge {
                padding: 3px 10px;
                font-size: 10px;
              }
              .bill-number {
                font-size: 10px;
                margin-bottom: 12px;
              }
              .footer {
                padding-top: 12px;
              }
              .footer p {
                font-size: 10px;
                margin-bottom: 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="header">
              <h1>Sanjeevani Ayurvedica</h1>
              <p>Outpatient Department</p>
              <p style="font-size: 11px; margin-top: 4px;">📍 Chanthavila, Thiruvananthapuram 695584 | 📞 8589007205</p>
            </div>
            
            <div class="op-number">
              <p>OP NUMBER</p>
              <p>${ticketData.opNumber}</p>
            </div>
            
            <div class="details">
              <div class="detail-item">
                <p>Patient Name</p>
                <p>${ticketData.patients?.full_name}</p>
              </div>
              <div class="detail-item">
                <p>Patient ID</p>
                <p>${ticketData.patients?.patient_id}</p>
              </div>
              <div class="detail-item">
                <p>Age / Gender</p>
                <p>${ticketData.patients?.age || 'N/A'} / ${ticketData.patients?.gender || 'N/A'}</p>
              </div>
              <div class="detail-item">
                <p>Phone</p>
                <p>${ticketData.patients?.phone || 'N/A'}</p>
              </div>
              <div class="detail-item">
                <p>Date</p>
                <p>${new Date(ticketData.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
              <div class="detail-item">
                <p>Time</p>
                <p>${new Date(ticketData.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            
            ${ticketData.users ? `
              <div class="doctor-box">
                <p>Assigned Doctor</p>
                <p>Dr. ${ticketData.users.full_name}</p>
              </div>
            ` : ''}
            
            <div class="payment-box">
              <div class="payment-row fee">
                <span>Consultation Fee:</span>
                <span>₹${ticketData.consultationFee}</span>
              </div>
              <div class="payment-row">
                <span>Payment Method:</span>
                <span>${ticketData.paymentMethod}</span>
              </div>
              <div class="payment-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #86efac;">
                <span style="font-weight: bold; color: #111827;">Status:</span>
                <span class="status-badge">PAID</span>
              </div>
            </div>
            
            <div class="bill-number">
              Bill No: ${ticketData.billNumber}
            </div>
            
            <div class="footer">
              <p>Please keep this ticket for reference. Show it to the doctor during consultation.</p>
              <p style="margin-top: 8px;">Thank you for choosing Sanjeevani Ayurvedica 🌿</p>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(ticketHTML)
    printWindow.document.close()
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const downloadTicket = async () => {
    try {
      // Use html2canvas to capture the ticket
      const html2canvas = (await import('html2canvas')).default
      const ticketElement = document.getElementById('ticket-modal')
      
      if (!ticketElement) {
        alert('Ticket not found')
        return
      }

      // Find the actual ticket content (the white box)
      const ticketContent = ticketElement.querySelector('.bg-white') as HTMLElement
      
      if (!ticketContent) {
        alert('Ticket content not found')
        return
      }

      // Capture the ticket as canvas
      const canvas = await html2canvas(ticketContent, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      })

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `OP-Ticket-${ticketData.opNumber}-${ticketData.patients?.patient_id}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Error downloading ticket. Please try printing instead.')
    }
  }

  const closeTicket = () => {
    setShowTicket(false)
    setTicketData(null)
  }

  const viewExistingTicket = async (registration: any) => {
    // Calculate OP number for this registration
    const today = new Date().toISOString().split('T')[0]
    const { data: allOps } = await supabase
      .from('op_registrations')
      .select('id, created_at')
      .eq('registration_date', today)
      .order('created_at', { ascending: true })
    
    const index = (allOps || []).findIndex(op => op.id === registration.id)
    const opNumber = `OP${String(index + 1).padStart(2, '0')}`

    // Get bill information
    const { data: billData } = await (supabase as any)
      .from('bills')
      .select('bill_number, payment_method, final_amount')
      .eq('op_registration_id', registration.id)
      .single()

    // Prepare ticket data
    setTicketData({
      ...registration,
      opNumber: opNumber,
      billNumber: billData?.bill_number || 'N/A',
      consultationFee: billData?.final_amount || consultationFee,
      paymentMethod: billData?.payment_method || 'cash',
    })
    setShowTicket(true)
  }

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const selectedPatientData = patients.find(p => p.id === selectedPatient)

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId)
    setPatientSearch('')
    setShowPatientDropdown(false)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">OP Registration</h2>
          <p className="text-gray-600 text-sm mt-1">Register patients for outpatient consultation</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* OP Number Display */}
              <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                <p className="text-blue-100 text-sm font-medium">Next OP Number</p>
                <p className="text-3xl font-bold mt-1">{nextOpNumber}</p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Search & Select Patient *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddPatient(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Patient
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or patient ID..."
                    value={selectedPatientData ? `${selectedPatientData.patient_id} - ${selectedPatientData.full_name}` : patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value)
                      setSelectedPatient('')
                      setShowPatientDropdown(true)
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                    className="input-field pr-10"
                    required
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
                {showPatientDropdown && !selectedPatient && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => handlePatientSelect(patient.id)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{patient.full_name}</div>
                          <div className="text-sm text-gray-600">
                            ID: {patient.patient_id} • {patient.age || 'N/A'} yrs • {patient.gender || 'N/A'}
                          </div>
                          {patient.phone && (
                            <div className="text-xs text-gray-500 mt-1">📞 {patient.phone}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No patients found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign Doctor *
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">-- Select Doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPatientData && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">ID:</span> {selectedPatientData.patient_id}</p>
                    <p><span className="font-medium">Name:</span> {selectedPatientData.full_name}</p>
                    <p><span className="font-medium">Age:</span> {selectedPatientData.age || 'N/A'}</p>
                    <p><span className="font-medium">Gender:</span> {selectedPatientData.gender || 'N/A'}</p>
                    <p><span className="font-medium">Phone:</span> {selectedPatientData.phone || 'N/A'}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Enter any symptoms, complaints, or special notes..."
                />
              </div>

              {/* Consultation Fee */}
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">Payment Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Consultation Fee:</span>
                    <span className="text-2xl font-bold text-green-700">₹{consultationFee}</span>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="insurance">Insurance</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `✓ Register & Collect ₹${consultationFee}`}
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Today's Registrations
              </h3>
              {recentRegistrations.length === 0 ? (
                <p className="text-gray-500 text-sm">No registrations yet today</p>
              ) : (
                <div className="space-y-3">
                  {recentRegistrations.map((reg) => (
                    <div key={reg.id} className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{reg.patients?.full_name}</p>
                            <button
                              onClick={() => viewExistingTicket(reg)}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                              title="View OP Ticket"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ticket
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">ID: {reg.patients?.patient_id}</p>
                        </div>
                        <span className={`badge ${reg.status === 'waiting' ? 'badge-warning' : 'badge-success'}`}>
                          {reg.status}
                        </span>
                      </div>
                      {reg.users && (
                        <p className="text-xs text-blue-600 mb-1">
                          👨‍⚕️ Dr. {reg.users.full_name}
                        </p>
                      )}
                      {reg.notes && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{reg.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Registration Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Each OP registration gets a unique OP number</li>
              <li>• Consultation fee is collected at registration</li>
              <li>• You can assign a specific doctor or leave it for later</li>
              <li>• Verify patient identity before registration</li>
              <li>• Add detailed notes about symptoms or complaints</li>
              <li>• Print the OP ticket for the patient</li>
            </ul>
          </div>
        </div>
      </div>

      {/* OP Ticket Modal */}
      {showTicket && ticketData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="ticket-modal">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Ticket Content - Scrollable */}
            <div className="p-8 overflow-y-auto flex-1">
              <div className="border-4 border-blue-600 rounded-lg p-6">
                {/* Header */}
                <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-blue-900">Sanjeevani Ayurvedica 🌿</h1>
                  <p className="text-gray-600 text-sm mt-1">Outpatient Department</p>
                  <p className="text-xs text-gray-500 mt-1">📍 Chanthavila, Thiruvananthapuram 695584 | 📞 8589007205</p>
                </div>

                {/* OP Number - Large Display */}
                <div className="text-center mb-6 bg-blue-50 py-4 rounded-lg border-2 border-blue-300">
                  <p className="text-sm text-blue-600 font-medium">OP NUMBER</p>
                  <p className="text-5xl font-bold text-blue-900 mt-1">{ticketData.opNumber}</p>
                </div>

                {/* Patient Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Patient Name</p>
                    <p className="text-lg font-bold text-gray-900">{ticketData.patients?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Patient ID</p>
                    <p className="text-lg font-bold text-gray-900">{ticketData.patients?.patient_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Age / Gender</p>
                    <p className="text-base font-semibold text-gray-900">
                      {ticketData.patients?.age || 'N/A'} / {ticketData.patients?.gender || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Phone</p>
                    <p className="text-base font-semibold text-gray-900">{ticketData.patients?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Date</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(ticketData.registration_date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Time</p>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(ticketData.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {ticketData.users && (
                  <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">Assigned Doctor</p>
                    <p className="text-base font-bold text-purple-900">Dr. {ticketData.users.full_name}</p>
                  </div>
                )}

                {/* Payment Details */}
                <div className="border-t-2 border-gray-300 pt-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Consultation Fee:</span>
                      <span className="text-xl font-bold text-green-700">₹{ticketData.consultationFee}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                      <span className="text-sm font-semibold text-gray-900 uppercase">{ticketData.paymentMethod}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">Status:</span>
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">PAID</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Number */}
                <div className="text-center text-xs text-gray-500 mb-4">
                  Bill No: {ticketData.billNumber}
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-300 pt-4 text-center">
                  <p className="text-xs text-gray-600 italic">
                    Please keep this ticket for reference. Show it to the doctor during consultation.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Thank you for choosing Sanjeevani Ayurvedica 🌿
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 px-8 pb-6 print:hidden">
              <button
                onClick={printTicket}
                className="btn-primary flex-1 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Ticket
              </button>
              <button
                onClick={downloadTicket}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex-1 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button
                onClick={closeTicket}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddPatient(false)
              setNewPatient({ full_name: '', age: '', gender: '', phone: '', address: '' })
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Patient</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newPatient.full_name}
                  onChange={(e) => setNewPatient({ ...newPatient, full_name: e.target.value })}
                  className="input-field"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="input-field"
                    placeholder="Age"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="input-field"
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                <textarea
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Address"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddPatient} className="btn-primary flex-1">
                  Add Patient
                </button>
                <button 
                  onClick={() => {
                    setShowAddPatient(false)
                    setNewPatient({ full_name: '', age: '', gender: '', phone: '', address: '' })
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
