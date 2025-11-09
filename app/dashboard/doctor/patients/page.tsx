'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false })
    setPatients(data || [])
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Patient List</h2>
      
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Patient ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Age</th>
            <th className="px-4 py-2 text-left">Gender</th>
            <th className="px-4 py-2 text-left">Phone</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-t">
              <td className="px-4 py-2">{patient.patient_id}</td>
              <td className="px-4 py-2">{patient.full_name}</td>
              <td className="px-4 py-2">{patient.age}</td>
              <td className="px-4 py-2">{patient.gender}</td>
              <td className="px-4 py-2">{patient.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
