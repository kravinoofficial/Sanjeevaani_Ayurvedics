'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [filteredCategories, setFilteredCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    checkAuth()
    loadCategories()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchQuery, categories])

  const checkAuth = async () => {
    const user = await getCurrentUser()
    if (!user || !['admin', 'staff'].includes(user.role)) {
      router.push('/dashboard')
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/medicine-categories')
      const result = await response.json()
      setCategories(result.categories || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading categories:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCategory ? `/api/medicine-categories/${editingCategory.id}` : '/api/medicine-categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory ? { ...formData, is_active: editingCategory.is_active } : formData)
      })

      const result = await response.json()

      if (!response.ok) {
        alert('Error: ' + result.error)
        return
      }

      alert(editingCategory ? 'Category updated successfully!' : 'Category added successfully!')
      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '' })
      loadCategories()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/medicine-categories/${id}`, { method: 'DELETE' })
      const result = await response.json()
      
      if (!response.ok) {
        alert('Error: ' + result.error)
        return
      }
      
      alert('Category deleted successfully!')
      loadCategories()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const toggleStatus = async (category: any) => {
    try {
      const response = await fetch(`/api/medicine-categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...category, is_active: !category.is_active })
      })

      if (response.ok) {
        loadCategories()
      }
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medicine Categories</h1>
          <p className="text-gray-600 mt-1">Manage medicine categories for stock management</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setFormData({ name: '', description: '' })
            setShowModal(true)
          }}
          className="btn-success"
        >
          + Add Category
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 text-gray-600">{category.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(category)}
                    className={`px-2 py-1 rounded text-xs ${
                      category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 mr-3">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Lehyam, Kashayam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Brief description of the category"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-success flex-1">
                  {editingCategory ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({ name: '', description: '' })
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
