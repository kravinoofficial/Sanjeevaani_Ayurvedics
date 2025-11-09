'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [filteredMedicines, setFilteredMedicines] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    price: 0,
  })

  useEffect(() => {
    loadMedicines()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = medicines.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMedicines(filtered)
    } else {
      setFilteredMedicines(medicines)
    }
  }, [searchQuery, medicines])

  const loadMedicines = async () => {
    const { data } = await supabase.from('medicines').select('*').order('name')
    setMedicines(data || [])
    setFilteredMedicines(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId) {
        const { error } = await (supabase as any)
          .from('medicines')
          .update({
            name: formData.name,
            description: formData.description || null,
            unit: formData.unit || null,
            price: formData.price || null,
          })
          .eq('id', editingId)
        
        if (error) throw error
        alert('Medicine updated successfully!')
      } else {
        const { error } = await (supabase as any)
          .from('medicines')
          .insert({
            name: formData.name,
            description: formData.description || null,
            unit: formData.unit || null,
            price: formData.price || null,
          })
        
        if (error) throw error
        alert('Medicine added successfully!')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ name: '', description: '', unit: '', price: 0 })
      loadMedicines()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (medicine: any) => {
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      unit: medicine.unit || '',
      price: medicine.price || 0,
    })
    setEditingId(medicine.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Medicine Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage medicine information and pricing</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', description: '', unit: '', price: 0 })
            }}
            className="btn-primary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Add Medicine'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Paracetamol"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input-field"
                    placeholder="e.g., tablets, ml, mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Medicine description, usage, etc."
                />
              </div>
              <button type="submit" className="btn-success">
                {editingId ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </form>
          </div>
        )}

        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search medicines..."
          />
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Medicine</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                    {medicine.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{medicine.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{medicine.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{medicine.price?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(medicine)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No medicines found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or add a new medicine.</p>
          </div>
        )}
      </div>
    </div>
  )
}
