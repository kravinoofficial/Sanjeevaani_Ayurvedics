'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function ReceptionistPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({
    patient_id: '',
    full_name: '',
    age: '',
    gender: 'male',
    phone: '',
    address: '',
  })
  const router = useRouter()

  useEffect(() => {
    loadPatients()
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (showForm) {
      generatePatientId()
    }
  }, [showForm, patients])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadPatients = async () => {
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
    setPatients(data || [])
  }

  const generatePatientId = () => {
    // Get the highest patient number
    const patientNumbers = patients
      .map(p => {
        const match = p.patient_id.match(/^P(\d+)$/i)
        return match ? parseInt(match[1]) : 0
      })
      .filter(n => n > 0)
    
    const nextNumber = patientNumbers.length > 0 ? Math.max(...patientNumbers) + 1 : 1
    const newPatientId = `P${String(nextNumber).padStart(2, '0')}`
    
    setFormData(prev => ({ ...prev, patient_id: newPatientId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const { error } = await (supabase as any)
        .from('patients')
        .insert({
          patient_id: formData.patient_id,
          full_name: formData.full_name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          phone: formData.phone || null,
          address: formData.address || null,
          created_by: currentUser?.id || null,
        })

      if (error) {
        alert('Error adding patient: ' + error.message)
        return
      }

      alert('Patient added successfully!')
      setShowForm(false)
      setFormData({ patient_id: '', full_name: '', age: '', gender: 'male', phone: '', address: '' })
      loadPatients()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const filteredPatients = patients.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Patient Directory</h2>
            <p className="text-gray-600 text-sm mt-1">Manage and view all registered patients</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center justify-center"
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Patient
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium mb-1">Total Patients</p>
            <p className="text-3xl font-bold text-blue-900">{patients.length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium mb-1">Male</p>
            <p className="text-3xl font-bold text-green-900">{patients.filter(p => p.gender === 'male').length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
            <p className="text-sm text-pink-600 font-medium mb-1">Female</p>
            <p className="text-3xl font-bold text-pink-900">{patients.filter(p => p.gender === 'female').length}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium mb-1">This Month</p>
            <p className="text-3xl font-bold text-purple-900">
              {patients.filter(p => {
                const created = new Date(p.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Add Patient Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Patient</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient ID * 
                  <span className="text-xs text-green-600 ml-2">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={formData.patient_id}
                  className="input-field bg-gray-50 cursor-not-allowed"
                  readOnly
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="input-field"
                  placeholder="Enter age"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Enter full address"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                <svg className="w-5 h-5 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Add Patient
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ patient_id: '', full_name: '', age: '', gender: 'male', phone: '', address: '' })
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and View Toggle */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="card">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No patients found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding a new patient'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mr-3">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{patient.full_name}</h3>
                      <p className="text-xs text-gray-500">ID: {patient.patient_id}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {patient.age || 'N/A'} yrs • {patient.gender || 'N/A'}
                  </div>
                  {patient.phone && (
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {patient.phone}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Age/Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {patient.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{patient.full_name}</div>
                          <div className="text-xs text-gray-500">ID: {patient.patient_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.age || 'N/A'} / {patient.gender || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
