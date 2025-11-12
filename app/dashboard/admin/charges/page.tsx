'use client'

import { useEffect, useState } from 'react'

export default function ConsultationFeePage() {
  const [consultationFee, setConsultationFee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    description: ''
  })

  useEffect(() => {
    loadConsultationFee()
  }, [])

  const loadConsultationFee = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/charges')
      const result = await response.json()

      if (response.ok && result.data) {
        // Find consultation fee
        const consultationCharge = result.data.find((c: any) => c.charge_type === 'consultation')
        if (consultationCharge) {
          setConsultationFee(consultationCharge)
        }
      }
    } catch (error) {
      console.error('Error loading consultation fee:', error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (consultationFee) {
        // Update existing
        const response = await fetch(`/api/charges/${consultationFee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(formData.amount),
            description: formData.description,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update')
        }

        alert('Consultation fee updated successfully!')
      } else {
        // Create new
        const response = await fetch('/api/charges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            charge_type: 'consultation',
            charge_name: 'Consultation Fee',
            amount: Number(formData.amount),
            description: formData.description,
            is_active: true,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create')
        }

        alert('Consultation fee set successfully!')
      }

      setShowModal(false)
      loadConsultationFee()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const openEditModal = () => {
    if (consultationFee) {
      setFormData({
        amount: consultationFee.amount.toString(),
        description: consultationFee.description || ''
      })
    } else {
      setFormData({ amount: '', description: '' })
    }
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Consultation Fee</h2>
          <p className="text-gray-600 text-sm mt-1">Manage the consultation fee for all appointments</p>
        </div>

        {consultationFee ? (
          <div className="max-w-2xl">
            {/* Current Fee Display */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl p-8 border-2 border-emerald-200 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Current Consultation Fee</h3>
                  <p className="text-gray-600 text-sm">
                    {consultationFee.description || 'Standard consultation fee for all appointments'}
                  </p>
                </div>
                <button
                  onClick={openEditModal}
                  className="btn-primary flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Fee
                </button>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="text-sm text-gray-600 mb-2">Consultation Fee</div>
                <div className="text-6xl font-bold text-teal-600">₹{Number(consultationFee.amount).toFixed(2)}</div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white/40 backdrop-blur-sm border border-emerald-100 rounded-xl p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {new Date(consultationFee.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {new Date(consultationFee.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2">
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">
                      {consultationFee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl bg-white/40 backdrop-blur-sm border border-emerald-100 rounded-xl p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-gray-500 mb-4">No consultation fee set</div>
            <button
              onClick={openEditModal}
              className="btn-primary"
            >
              Set Consultation Fee
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {consultationFee ? 'Edit Consultation Fee' : 'Set Consultation Fee'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="500.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of the consultation fee"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">
                  {consultationFee ? 'Update' : 'Set'} Fee
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ amount: '', description: '' })
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

