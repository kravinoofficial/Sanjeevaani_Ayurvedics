'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PharmacistMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newMedicine, setNewMedicine] = useState({ name: '', unit: '', price: 0, description: '' })
  const [editingMedicine, setEditingMedicine] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadMedicines()
  }, [])

  const loadMedicines = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/medicines')
      const result = await response.json()

      if (response.ok && result.data) {
        setMedicines(result.data)
      } else {
        console.error('Error loading medicines:', result.error)
      }
    } catch (error) {
      console.error('Error loading medicines:', error)
    }
    setLoading(false)
  }

  const handleAddMedicine = async () => {
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
      setShowAddModal(false)
      setNewMedicine({ name: '', unit: '', price: 0, description: '' })
      loadMedicines()
    } catch (error: any) {
      alert('Error adding medicine: ' + error.message)
    }
  }

  const handleEditMedicine = async () => {
    if (!editingMedicine?.name.trim()) {
      alert('Please enter medicine name')
      return
    }

    try {
      const response = await fetch(`/api/medicines/${editingMedicine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingMedicine.name,
          unit: editingMedicine.unit || null,
          price: editingMedicine.price || null,
          description: editingMedicine.description || null,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error)

      alert('Medicine updated successfully!')
      setShowEditModal(false)
      setEditingMedicine(null)
      loadMedicines()
    } catch (error: any) {
      alert('Error updating medicine: ' + error.message)
    }
  }

  const openEditModal = (medicine: any) => {
    setEditingMedicine({ ...medicine })
    setShowEditModal(true)
  }

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading medicines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medicines</h2>
            <p className="text-gray-600 text-sm mt-1">View and manage medicine inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Medicine
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
          />
        </div>

        {/* Medicines Table */}
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No medicines found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Add your first medicine to get started'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Medicine Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedicines.map((medicine, index) => (
                  <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{medicine.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {medicine.unit || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      ₹{medicine.price ? Number(medicine.price).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {medicine.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(medicine)}
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

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
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
                <button onClick={handleAddMedicine} className="btn-primary flex-1">
                  Add Medicine
                </button>
                <button 
                  onClick={() => {
                    setShowAddModal(false)
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

      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Medicine Management</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Add new medicines to the system</li>
              <li>• Edit medicine details and prices</li>
              <li>• View all available medicines with prices</li>
              <li>• Search medicines by name</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Medicine Modal */}
      {showEditModal && editingMedicine && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Medicine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name *</label>
                <input
                  type="text"
                  value={editingMedicine.name}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Paracetamol"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={editingMedicine.unit || ''}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, unit: e.target.value })}
                    className="input-field"
                    placeholder="e.g., tablets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingMedicine.price || 0}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingMedicine.description || ''}
                  onChange={(e) => setEditingMedicine({ ...editingMedicine, description: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditMedicine} className="btn-primary flex-1">
                  Update Medicine
                </button>
                <button 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingMedicine(null)
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
