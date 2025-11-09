'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = doctors.filter(doc =>
        doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDoctors(filtered)
    } else {
      setFilteredDoctors(doctors)
    }
  }, [searchQuery, doctors])

  const loadDoctors = async () => {
    const { data } = await (supabase as any)
      .from('users')
      .select('id, email, full_name, is_active, created_at')
      .eq('role', 'doctor')
      .order('full_name')

    if (data) {
      setDoctors(data)
      setFilteredDoctors(data)
      
      const active = data.filter((d: any) => d.is_active).length
      setStats({
        total: data.length,
        active: active,
        inactive: data.length - active
      })
    }
  }

  const toggleDoctorStatus = async (doctorId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', doctorId)
      
      if (error) throw error
      loadDoctors()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Doctor Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage doctors and their availability</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-sm text-blue-700 font-medium">Total Doctors</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-blue-700 font-medium">Active Doctors</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{stats.active}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-blue-700 font-medium">Inactive Doctors</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{stats.inactive}</p>
          </div>
        </div>

        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search doctors by name or email..."
          />
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">Dr</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{doctor.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doctor.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${doctor.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {doctor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(doctor.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleDoctorStatus(doctor.id, doctor.is_active)}
                      className={`${doctor.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} font-medium`}
                    >
                      {doctor.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add doctors from the Users page.</p>
          </div>
        )}
      </div>

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Doctor Management Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Active doctors can login and see patients in OP list</li>
              <li>• Inactive doctors cannot login to the system</li>
              <li>• To add new doctors, go to Users page and create with "Doctor" role</li>
              <li>• Doctors can be assigned to OP registrations by receptionists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
