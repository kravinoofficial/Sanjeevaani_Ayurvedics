'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'

export default function DoctorServePage({ params }: { params: { id: string } }) {
  const [registration, setRegistration] = useState<any>(null)
  const [medicines, setMedicines] = useState<any[]>([])
  const [medicinePrescriptions, setMedicinePrescriptions] = useState<any[]>([])
  const [physicalTreatments, setPhysicalTreatments] = useState<any[]>([])
  const [availableTreatments, setAvailableTreatments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAddMedicine, setShowAddMedicine] = useState(false)
  const [showAddTreatment, setShowAddTreatment] = useState(false)
  const [newMedicine, setNewMedicine] = useState({ name: '', unit: '', price: 0, description: '' })
  const [newTreatment, setNewTreatment] = useState({ name: '', duration_unit: '', price: 0, description: '' })
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({})
  const [treatmentSearchTerms, setTreatmentSearchTerms] = useState<{ [key: number]: string }>({})
  const [doctorNotes, setDoctorNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prescriptionsRef = useRef<any[]>([])
  const router = useRouter()

  // Keep ref in sync with state
  useEffect(() => {
    prescriptionsRef.current = medicinePrescriptions
  }, [medicinePrescriptions])

  useEffect(() => {
    loadData()
    loadCurrentUser()

    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.medicine-search-container')) {
        document.querySelectorAll('.medicine-dropdown').forEach((dropdown) => {
          const idx = parseInt(dropdown.getAttribute('data-index') || '0')
          dropdown.classList.add('hidden')
          
          // Clear search term only if no medicine is selected for this index
          setSearchTerms(prev => {
            const updated = { ...prev }
            // Use ref to get current prescriptions
            const hasMedicine = prescriptionsRef.current[idx]?.medicine_id
            if (!hasMedicine && updated[idx]) {
              delete updated[idx]
            }
            return updated
          })
        })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
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
        .select('*, patients(*)')
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

      const medsResponse = await fetch('/api/medicines')
      const medsResult = await medsResponse.json()
      setMedicines(medsResult.data || [])
      
      const { data: treatments } = await supabase.from('physical_treatments').select('*').order('name')
      setAvailableTreatments(treatments || [])
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error in loadData:', err)
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  const addMedicinePrescription = () => {
    setMedicinePrescriptions([...medicinePrescriptions, { medicine_id: '', quantity: 1, dosage: '', instructions: '' }])
  }

  const addPhysicalTreatment = () => {
    setPhysicalTreatments([...physicalTreatments, { treatment_id: '', treatment_type: '', instructions: '', duration: '' }])
  }

  const handleAddNewMedicine = async () => {
    if (!newMedicine.name.trim()) {
      alert('Please enter medicine name')
      return
    }

    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMedicine.name,
          unit: newMedicine.unit || null,
          price: newMedicine.price || null,
          description: newMedicine.description || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      alert('Medicine added successfully!')
      setShowAddMedicine(false)
      setNewMedicine({ name: '', unit: '', price: 0, description: '' })
      await loadData() // Reload medicines list
    } catch (error: any) {
      alert('Error adding medicine: ' + error.message)
    }
  }

  const openAddMedicineModal = (searchTerm: string) => {
    setNewMedicine({ name: searchTerm, unit: '', price: 0, description: '' })
    setShowAddMedicine(true)
  }

  const getFilteredMedicines = (searchTerm: string) => {
    if (!searchTerm) return medicines.slice(0, 5)
    return medicines
      .filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5)
  }

  const handleAddNewTreatment = async () => {
    if (!newTreatment.name.trim()) {
      alert('Please enter treatment name')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('physical_treatments')
        .insert({
          name: newTreatment.name,
          duration_unit: newTreatment.duration_unit || null,
          price: newTreatment.price || null,
          description: newTreatment.description || null,
        })
        .select()
        .single()

      if (error) throw error

      alert('Treatment added successfully!')
      setShowAddTreatment(false)
      setNewTreatment({ name: '', duration_unit: '', price: 0, description: '' })
      await loadData() // Reload treatments list
    } catch (error: any) {
      alert('Error adding treatment: ' + error.message)
    }
  }

  const openAddTreatmentModal = (searchTerm: string) => {
    setNewTreatment({ name: searchTerm, duration_unit: '', price: 0, description: '' })
    setShowAddTreatment(true)
  }

  const getFilteredTreatments = (searchTerm: string) => {
    if (!searchTerm) return availableTreatments.slice(0, 5)
    return availableTreatments
      .filter(treatment => treatment.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5)
  }

  const handleSubmit = async () => {
    try {
      // Allow completing without prescriptions or treatments

      // Validate dosage for all medicine prescriptions
      for (const mp of medicinePrescriptions) {
        if (mp.medicine_id && !mp.dosage?.trim()) {
          alert('Please enter dosage for all medicine prescriptions.')
          return
        }
      }

      // Insert medicine prescriptions
      for (const mp of medicinePrescriptions) {
        if (mp.medicine_id) {
          const { error } = await (supabase as any)
            .from('medicine_prescriptions')
            .insert({
              op_registration_id: params.id,
              medicine_id: mp.medicine_id,
              quantity: mp.quantity,
              dosage: mp.dosage,
              instructions: mp.instructions || null,
              prescribed_by: currentUser?.id || null,
            })
          
          if (error) throw error
        }
      }

      // Insert physical treatment prescriptions
      for (const pt of physicalTreatments) {
        if (pt.treatment_id || pt.treatment_type) {
          const { error } = await (supabase as any)
            .from('physical_treatment_prescriptions')
            .insert({
              op_registration_id: params.id,
              treatment_id: pt.treatment_id || null,
              treatment_type: pt.treatment_type,
              instructions: pt.instructions || null,
              duration: pt.duration || null,
              prescribed_by: currentUser?.id || null,
            })
          
          if (error) throw error
        }
      }

      // Update OP registration status
      const { error: updateError } = await (supabase as any)
        .from('op_registrations')
        .update({ 
          status: 'completed',
          notes: doctorNotes || null,
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      alert('Patient served successfully!')
      router.push('/dashboard/doctor/op-list')
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading patient information...</p>
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
          <p className="mt-2 text-sm text-gray-500">Unable to load patient information</p>
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

  const removeMedicinePrescription = (idx: number) => {
    setMedicinePrescriptions(medicinePrescriptions.filter((_, i) => i !== idx))
  }

  const removePhysicalTreatment = (idx: number) => {
    setPhysicalTreatments(physicalTreatments.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Serve Patient</h2>
            <p className="text-gray-600 text-sm mt-1">Prescribe medicines and treatments</p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn-secondary text-sm"
          >
            ← Back to OP List
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
          {registration.notes && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-blue-600 font-medium text-sm">Registration Notes:</p>
              <p className="text-blue-900 mt-1">{registration.notes}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Medicine Prescriptions
            </h3>
            <button onClick={addMedicinePrescription} className="btn-primary text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Prescription
            </button>
          </div>

          {/* Add New Medicine Modal */}
          {showAddMedicine && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Medicine</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name *</label>
                    <input
                      type="text"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Paracetamol"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                      <input
                        type="text"
                        value={newMedicine.unit}
                        onChange={(e) => setNewMedicine({ ...newMedicine, unit: e.target.value })}
                        className="input-field"
                        placeholder="e.g., tablets"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newMedicine.price}
                        onChange={(e) => setNewMedicine({ ...newMedicine, price: parseFloat(e.target.value) || 0 })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newMedicine.description}
                      onChange={(e) => setNewMedicine({ ...newMedicine, description: e.target.value })}
                      className="input-field"
                      rows={2}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleAddNewMedicine} className="btn-primary flex-1">
                      Add Medicine
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddMedicine(false)
                        setNewMedicine({ name: '', unit: '', price: 0, description: '' })
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

          {/* Add New Treatment Modal */}
          {showAddTreatment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Treatment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Name *</label>
                    <input
                      type="text"
                      value={newTreatment.name}
                      onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Physiotherapy"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Duration Unit</label>
                      <input
                        type="text"
                        value={newTreatment.duration_unit}
                        onChange={(e) => setNewTreatment({ ...newTreatment, duration_unit: e.target.value })}
                        className="input-field"
                        placeholder="e.g., sessions"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newTreatment.price}
                        onChange={(e) => setNewTreatment({ ...newTreatment, price: parseFloat(e.target.value) || 0 })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newTreatment.description}
                      onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                      className="input-field"
                      rows={2}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleAddNewTreatment} className="btn-primary flex-1">
                      Add Treatment
                    </button>
                    <button 
                      onClick={() => {
                        setShowAddTreatment(false)
                        setNewTreatment({ name: '', duration_unit: '', price: 0, description: '' })
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

          {medicinePrescriptions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No medicines prescribed yet. Click "Add Medicine" to start.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicinePrescriptions.map((mp, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Medicine *</label>
                      <div className="relative medicine-search-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            const dropdown = e.currentTarget.nextElementSibling
                            dropdown?.classList.toggle('hidden')
                            // Focus search input when opening
                            if (!dropdown?.classList.contains('hidden')) {
                              setTimeout(() => {
                                dropdown?.querySelector('input')?.focus()
                              }, 0)
                            }
                          }}
                          className="input-field text-sm text-left flex items-center justify-between w-full"
                        >
                          <span className={mp.medicine_id ? 'text-gray-900' : 'text-gray-400'}>
                            {mp.medicine_id 
                              ? medicines.find(m => m.id === mp.medicine_id)?.name || 'Select Medicine'
                              : 'Select Medicine'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="medicine-dropdown hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg" data-index={idx}>
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search medicine..."
                              value={searchTerms[idx] || ''}
                              onChange={(e) => {
                                setSearchTerms({ ...searchTerms, [idx]: e.target.value })
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {getFilteredMedicines(searchTerms[idx] || '').length > 0 ? (
                              <>
                                {getFilteredMedicines(searchTerms[idx] || '').map((med) => (
                                  <div
                                    key={med.id}
                                    onClick={() => {
                                      const updated = [...medicinePrescriptions]
                                      updated[idx].medicine_id = med.id
                                      setMedicinePrescriptions(updated)
                                      setSearchTerms({ ...searchTerms, [idx]: '' })
                                      document.querySelector(`[data-index="${idx}"]`)?.classList.add('hidden')
                                    }}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                                  >
                                    <div className="text-sm font-medium text-gray-900">{med.name}</div>
                                    <div className="text-xs text-gray-500">{med.unit}</div>
                                  </div>
                                ))}
                                <div
                                  onClick={() => {
                                    openAddMedicineModal(searchTerms[idx] || '')
                                    setSearchTerms({ ...searchTerms, [idx]: '' })
                                    document.querySelector(`[data-index="${idx}"]`)?.classList.add('hidden')
                                  }}
                                  className="px-4 py-2 hover:bg-green-50 cursor-pointer border-t-2 border-green-200 bg-green-50"
                                >
                                  <div className="text-sm font-semibold text-green-700 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Medicine
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div
                                onClick={() => {
                                  openAddMedicineModal(searchTerms[idx] || '')
                                  setSearchTerms({ ...searchTerms, [idx]: '' })
                                  document.querySelector(`[data-index="${idx}"]`)?.classList.add('hidden')
                                }}
                                className="px-4 py-3 hover:bg-green-50 cursor-pointer bg-green-50"
                              >
                                <div className="text-sm font-semibold text-green-700 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add "{searchTerms[idx] || 'New Medicine'}"
                                </div>
                                <div className="text-xs text-gray-600 mt-1">No medicine found. Click to add.</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                      <input
                        type="number"
                        placeholder="e.g., 10"
                        value={mp.quantity}
                        onChange={(e) => {
                          const updated = [...medicinePrescriptions]
                          updated[idx].quantity = parseInt(e.target.value) || 1
                          setMedicinePrescriptions(updated)
                        }}
                        className="input-field text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Dosage *</label>
                      <input
                        type="text"
                        placeholder="e.g., 1-0-1"
                        value={mp.dosage}
                        onChange={(e) => {
                          const updated = [...medicinePrescriptions]
                          updated[idx].dosage = e.target.value
                          setMedicinePrescriptions(updated)
                        }}
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g., After meals"
                        value={mp.instructions}
                        onChange={(e) => {
                          const updated = [...medicinePrescriptions]
                          updated[idx].instructions = e.target.value
                          setMedicinePrescriptions(updated)
                        }}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeMedicinePrescription(idx)}
                    className="mt-2 text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              Panchakarma Treatments
            </h3>
            <button onClick={addPhysicalTreatment} className="btn-success text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Treatment
            </button>
          </div>
          {physicalTreatments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No treatments prescribed yet. Click "Add Treatment" to start.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {physicalTreatments.map((pt, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Treatment Type *</label>
                      <div className="relative medicine-search-container">
                        <button
                          type="button"
                          onClick={(e) => {
                            const dropdown = e.currentTarget.nextElementSibling
                            dropdown?.classList.toggle('hidden')
                            if (!dropdown?.classList.contains('hidden')) {
                              setTimeout(() => {
                                dropdown?.querySelector('input')?.focus()
                              }, 0)
                            }
                          }}
                          className="input-field text-sm text-left flex items-center justify-between w-full"
                        >
                          <span className={pt.treatment_id ? 'text-gray-900' : 'text-gray-400'}>
                            {pt.treatment_id 
                              ? availableTreatments.find(t => t.id === pt.treatment_id)?.name || 'Select Treatment'
                              : 'Select Treatment'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div className="medicine-dropdown hidden absolute z-10 w-full bottom-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg" data-index={idx}>
                          <div className="p-2 border-b border-gray-200">
                            <input
                              type="text"
                              placeholder="Search treatment..."
                              value={treatmentSearchTerms[idx] || ''}
                              onChange={(e) => {
                                setTreatmentSearchTerms({ ...treatmentSearchTerms, [idx]: e.target.value })
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {getFilteredTreatments(treatmentSearchTerms[idx] || '').length > 0 ? (
                              <>
                                {getFilteredTreatments(treatmentSearchTerms[idx] || '').map((treatment) => (
                                  <div
                                    key={treatment.id}
                                    onClick={() => {
                                      const updated = [...physicalTreatments]
                                      updated[idx].treatment_id = treatment.id
                                      updated[idx].treatment_type = treatment.name
                                      setPhysicalTreatments(updated)
                                      setTreatmentSearchTerms({ ...treatmentSearchTerms, [idx]: '' })
                                      document.querySelector(`[data-index="${idx}"]`)?.classList.add('hidden')
                                    }}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                                  >
                                    <div className="text-sm font-medium text-gray-900">{treatment.name}</div>
                                    <div className="text-xs text-gray-500">{treatment.duration_unit}</div>
                                  </div>
                                ))}
                                <div
                                  onClick={() => {
                                    openAddTreatmentModal(treatmentSearchTerms[idx] || '')
                                    setTreatmentSearchTerms({ ...treatmentSearchTerms, [idx]: '' })
                                    document.querySelector(`[data-index="${idx}"]`)?.classList.add('hidden')
                                  }}
                                  className="px-4 py-2 hover:bg-green-50 cursor-pointer border-t-2 border-green-200 bg-green-50"
                                >
                                  <div className="text-sm font-semibold text-green-700 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add New Treatment
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div
                                onClick={() => {
                                  openAddTreatmentModal(treatmentSearchTerms[idx] || '')
                                  setTreatmentSearchTerms({ ...treatmentSearchTerms, [idx]: '' })
                                  document.querySelector(`[data-index="${idx}"]`)?.classList.add('hidden')
                                }}
                                className="px-4 py-3 hover:bg-green-50 cursor-pointer bg-green-50"
                              >
                                <div className="text-sm font-semibold text-green-700 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Add "{treatmentSearchTerms[idx] || 'New Treatment'}"
                                </div>
                                <div className="text-xs text-gray-600 mt-1">No treatment found. Click to add.</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g., 30 minutes"
                        value={pt.duration}
                        onChange={(e) => {
                          const updated = [...physicalTreatments]
                          updated[idx].duration = e.target.value
                          setPhysicalTreatments(updated)
                        }}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g., Daily for 1 week"
                        value={pt.instructions}
                        onChange={(e) => {
                          const updated = [...physicalTreatments]
                          updated[idx].instructions = e.target.value
                          setPhysicalTreatments(updated)
                        }}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removePhysicalTreatment(idx)}
                    className="mt-2 text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Doctor's Notes/Report */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Doctor's Notes / Report
          </h3>
          <textarea
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            placeholder="Enter diagnosis, observations, recommendations, or any additional notes for this patient..."
            className="input-field w-full"
            rows={6}
          />
          <p className="text-xs text-gray-500 mt-2">
            These notes will be saved with the patient's record and can be viewed in their history.
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary px-8 py-3 text-lg"
          >
            ✓ Complete & Submit
          </button>
        </div>
      </div>

      <div className="card bg-green-50 border border-green-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-green-900 mb-1">Prescription Guidelines</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Verify patient allergies before prescribing</li>
              <li>• Check medicine stock availability</li>
              <li>• Provide clear dosage and timing instructions</li>
              <li>• Prescriptions will be routed to appropriate departments automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
