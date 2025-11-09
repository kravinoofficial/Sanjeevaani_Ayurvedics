'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPhysicalTreatmentsPage() {
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newTreatment, setNewTreatment] = useState({ name: '', description: '', duration_unit: '', price: 0 })
  const [editingTreatment, setEditingTreatment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTreatments()
  }, [])

  const loadTreatments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('physical_treatments')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error loading treatments:', error)
    }

    setTreatments(data || [])
    setLoading(false)
  }

  const handleAddTreatment = async () => {
    if (!newTreatment.name.trim()) {
      alert('Please enter treatment name')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('physical_treatments')
        .insert({
          name: newTreatment.name,
          description: newTreatment.description || null,
          duration_unit: newTreatment.duration_unit || null,
          price: newTreatment.price || null,
        })

      if (error) throw error

      alert('Treatment added successfully!')
      setShowAddModal(false)
      setNewTreatment({ name: '', description: '', duration_unit: '', price: 0 })
      loadTreatments()
    } catch (error: any) {
      alert('Error adding treatment: ' + error.message)
    }
  }

  const handleEditTreatment = async () => {
    if (!editingTreatment?.name.trim()) {
      alert('Please enter treatment name')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('physical_treatments')
        .update({
          name: editingTreatment.name,
          description: editingTreatment.description || null,
          duration_unit: editingTreatment.duration_unit || null,
          price: editingTreatment.price || null,
        })
        .eq('id', editingTreatment.id)

      if (error) throw error

      alert('Treatment updated successfully!')
      setShowEditModal(false)
      setEditingTreatment(null)
      loadTreatments()
    } catch (error: any) {
      alert('Error updating treatment: ' + error.message)
    }
  }

  const openEditModal = (treatment: any) => {
    setEditingTreatment({ ...treatment })
    setShowEditModal(true)
  }

  const filteredTreatments = treatments.filter(treatment =>
    treatment.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading treatments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Physical Treatments</h2>
            <p className="text-gray-600 text-sm mt-1">Manage physical treatment types</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Treatment
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
          />
        </div>

        {/* Treatments Table */}
        {filteredTreatments.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No treatments found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Add your first treatment to get started'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Treatment Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Duration Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTreatments.map((treatment, index) => (
                  <tr key={treatment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{treatment.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {treatment.duration_unit || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {treatment.price ? `₹${parseFloat(treatment.price).toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {treatment.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(treatment)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Treatment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
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
                    placeholder="e.g., sessions, weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTreatment.price}
                    onChange={(e) => setNewTreatment({ ...newTreatment, price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newTreatment.description}
                  onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddTreatment} className="btn-primary flex-1">
                  Add Treatment
                </button>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
                    setNewTreatment({ name: '', description: '', duration_unit: '', price: 0 })
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

      {/* Edit Treatment Modal */}
      {showEditModal && editingTreatment && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Treatment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Name *</label>
                <input
                  type="text"
                  value={editingTreatment.name}
                  onChange={(e) => setEditingTreatment({ ...editingTreatment, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Physiotherapy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration Unit</label>
                  <input
                    type="text"
                    value={editingTreatment.duration_unit || ''}
                    onChange={(e) => setEditingTreatment({ ...editingTreatment, duration_unit: e.target.value })}
                    className="input-field"
                    placeholder="e.g., sessions, weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingTreatment.price || 0}
                    onChange={(e) => setEditingTreatment({ ...editingTreatment, price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingTreatment.description || ''}
                  onChange={(e) => setEditingTreatment({ ...editingTreatment, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditTreatment} className="btn-primary flex-1">
                  Update Treatment
                </button>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingTreatment(null)
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

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Treatment Management</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add new physical treatment types to the system</li>
              <li>• Edit treatment details and duration units</li>
              <li>• View all available treatments</li>
              <li>• Search treatments by name</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
