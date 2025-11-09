'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PharmacistPhysicalTreatmentsPage() {
  const [treatments, setTreatments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_unit: '',
    price: ''
  })

  useEffect(() => {
    loadTreatments()
  }, [])

  const loadTreatments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('physical_treatments')
      .select('*')
      .order('name')

    if (!error) {
      setTreatments(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTreatment) {
        const { error } = await (supabase as any)
          .from('physical_treatments')
          .update({
            name: formData.name,
            description: formData.description,
            duration_unit: formData.duration_unit,
            price: parseFloat(formData.price)
          })
          .eq('id', editingTreatment.id)

        if (error) throw error
        alert('Treatment updated successfully!')
      } else {
        const { error } = await (supabase as any)
          .from('physical_treatments')
          .insert({
            name: formData.name,
            description: formData.description,
            duration_unit: formData.duration_unit,
            price: parseFloat(formData.price)
          })

        if (error) throw error
        alert('Treatment added successfully!')
      }

      setShowModal(false)
      setEditingTreatment(null)
      setFormData({ name: '', description: '', duration_unit: '', price: '' })
      loadTreatments()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (treatment: any) => {
    setEditingTreatment(treatment)
    setFormData({
      name: treatment.name,
      description: treatment.description || '',
      duration_unit: treatment.duration_unit || '',
      price: treatment.price?.toString() || ''
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingTreatment(null)
    setFormData({ name: '', description: '', duration_unit: '', price: '' })
    setShowModal(true)
  }

  const filteredTreatments = treatments.filter(treatment =>
    treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    treatment.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-3xl font-bold text-gray-800">Physical Treatments</h2>
            <p className="text-gray-600 text-sm mt-1">Manage physical treatments and their pricing</p>
          </div>
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Treatment
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Total Treatments</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{treatments.length}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Avg. Price</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">
              ₹{treatments.length > 0 ? (treatments.reduce((sum, t) => sum + Number(t.price || 0), 0) / treatments.length).toFixed(0) : '0'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Search Results</p>
            <p className="text-3xl font-bold text-blue-900 mt-1">{filteredTreatments.length}</p>
          </div>
        </div>

        {/* Treatments List */}
        {filteredTreatments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <p className="text-gray-500 font-medium">No treatments found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Treatment Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTreatments.map((treatment, index) => (
                  <tr key={treatment.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{treatment.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{treatment.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{treatment.duration_unit || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600">₹{Number(treatment.price || 0).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(treatment)}
                        className="text-blue-600 hover:text-blue-900"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Treatment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Exercise Therapy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of the treatment"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration Unit</label>
                <input
                  type="text"
                  value={formData.duration_unit}
                  onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                  className="input-field"
                  placeholder="e.g., per session, per week"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingTreatment ? 'Update' : 'Add'} Treatment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTreatment(null)
                    setFormData({ name: '', description: '', duration_unit: '', price: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
