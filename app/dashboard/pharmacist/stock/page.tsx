'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function AdminStockPage() {
  const router = useRouter()
  const [stockItems, setStockItems] = useState<any[]>([])
  const [filteredItems, setFilteredItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'lehyam',
    description: '',
    unit: '',
    quantity: 0,
    min_quantity: 10,
    max_quantity: null,
    price: 0,
    supplier_id: '',
    location: '',
    expiry_date: '',
    batch_number: ''
  })
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [transaction, setTransaction] = useState({
    type: 'in',
    quantity: 0,
    reason: '',
    reference_number: ''
  })

  useEffect(() => {
    loadCurrentUser()
    loadStockItems()
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      const result = await response.json()
      setSuppliers(result.suppliers || [])
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  useEffect(() => {
    filterItems()
  }, [stockItems, searchTerm, categoryFilter, stockFilter])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const loadStockItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('stock_items')
      .select(`
        *,
        supplier:suppliers(id, name)
      `)
      .order('name')

    if (error) {
      console.error('Error loading stock items:', error)
    }

    setStockItems(data || [])
    setLoading(false)
  }

  const filterItems = () => {
    let filtered = stockItems

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    if (stockFilter !== 'all') {
      if (stockFilter === 'out') {
        filtered = filtered.filter(item => item.quantity === 0)
      } else if (stockFilter === 'low') {
        filtered = filtered.filter(item => item.quantity > 0 && item.quantity < item.min_quantity)
      } else if (stockFilter === 'in') {
        filtered = filtered.filter(item => item.quantity >= item.min_quantity)
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert('Please enter item name')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('stock_items')
        .insert({
          ...newItem,
          max_quantity: newItem.max_quantity || null,
          expiry_date: newItem.expiry_date || null,
          batch_number: newItem.batch_number || null,
        })

      if (error) throw error

      alert('Stock item added successfully!')
      setShowAddModal(false)
      resetNewItem()
      loadStockItems()
    } catch (error: any) {
      alert('Error adding stock item: ' + error.message)
    }
  }

  const handleEditItem = async () => {
    if (!selectedItem?.name.trim()) {
      alert('Please enter item name')
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('stock_items')
        .update({
          name: selectedItem.name,
          category: selectedItem.category,
          description: selectedItem.description || null,
          unit: selectedItem.unit,
          min_quantity: selectedItem.min_quantity,
          max_quantity: selectedItem.max_quantity || null,
          price: selectedItem.price,
          supplier_id: selectedItem.supplier_id || null,
          location: selectedItem.location || null,
          expiry_date: selectedItem.expiry_date || null,
          batch_number: selectedItem.batch_number || null,
        })
        .eq('id', selectedItem.id)

      if (error) throw error

      alert('Stock item updated successfully!')
      setShowEditModal(false)
      setSelectedItem(null)
      loadStockItems()
    } catch (error: any) {
      alert('Error updating stock item: ' + error.message)
    }
  }

  const handleTransaction = async () => {
    if (!transaction.quantity || transaction.quantity <= 0) {
      alert('Please enter valid quantity')
      return
    }

    try {
      const previousQty = selectedItem.quantity
      let newQty = previousQty

      if (transaction.type === 'in') {
        newQty = previousQty + transaction.quantity
      } else if (transaction.type === 'out') {
        if (transaction.quantity > previousQty) {
          alert('Insufficient stock quantity')
          return
        }
        newQty = previousQty - transaction.quantity
      } else {
        newQty = transaction.quantity
      }

      // Update stock quantity
      const { error: updateError } = await (supabase as any)
        .from('stock_items')
        .update({ quantity: newQty })
        .eq('id', selectedItem.id)

      if (updateError) throw updateError

      // Record transaction
      const { error: transError } = await (supabase as any)
        .from('stock_transactions')
        .insert({
          stock_item_id: selectedItem.id,
          transaction_type: transaction.type,
          quantity: transaction.quantity,
          previous_quantity: previousQty,
          new_quantity: newQty,
          reason: transaction.reason || null,
          reference_number: transaction.reference_number || null,
          performed_by: currentUser?.id || null,
        })

      if (transError) throw transError

      alert('Transaction recorded successfully!')
      setShowTransactionModal(false)
      setSelectedItem(null)
      setTransaction({ type: 'in', quantity: 0, reason: '', reference_number: '' })
      loadStockItems()
    } catch (error: any) {
      alert('Error recording transaction: ' + error.message)
    }
  }

  const resetNewItem = () => {
    setNewItem({
      name: '',
      category: 'lehyam',
      description: '',
      unit: '',
      quantity: 0,
      min_quantity: 10,
      max_quantity: null,
      price: 0,
      supplier_id: '',
      location: '',
      expiry_date: '',
      batch_number: ''
    })
  }

  const openEditModal = (item: any) => {
    setSelectedItem({ ...item })
    setShowEditModal(true)
  }

  const openTransactionModal = (item: any) => {
    setSelectedItem(item)
    setShowTransactionModal(true)
  }

  const getStockStatus = (item: any) => {
    if (item.quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (item.quantity < item.min_quantity) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  const getCategoryIcon = (category: string) => {
    const icons: any = {
      lehyam: '🍯',
      rasayanam: '💊',
      arishtam: '🍷',
      aasavam: '🥃',
      tablet: '💊',
      choornam: '🌾',
      ointment: '🧴',
      kashayam: '☕',
      thailam: '🛢️'
    }
    return icons[category] || '💊'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading stock items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage medicines, equipment, and supplies</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard/pharmacist/stock/reports')}
              className="btn-secondary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Reports
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Stock Item
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            <option value="lehyam">Lehyam</option>
            <option value="rasayanam">Rasayanam</option>
            <option value="arishtam">Arishtam</option>
            <option value="aasavam">Aasavam</option>
            <option value="tablet">Tablet</option>
            <option value="choornam">Choornam</option>
            <option value="ointment">Ointment</option>
            <option value="kashayam">Kashayam</option>
            <option value="thailam">Thailam</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Stock Status</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="in">In Stock</option>
          </select>
        </div>

        {/* Stock Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <p className="text-sm text-teal-700 font-medium">Total Items</p>
            <p className="text-2xl font-bold text-teal-900">{filteredItems.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-teal-700 font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-teal-900">
              {filteredItems.filter(i => i.quantity === 0).length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-teal-700 font-medium">Low Stock</p>
            <p className="text-2xl font-bold text-teal-900">
              {filteredItems.filter(i => i.quantity > 0 && i.quantity < i.min_quantity).length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-teal-700 font-medium">In Stock</p>
            <p className="text-2xl font-bold text-teal-900">
              {filteredItems.filter(i => i.quantity >= i.min_quantity).length}
            </p>
          </div>
        </div>

        {/* Stock Items Table */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No items found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Add your first stock item to get started'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getCategoryIcon(item.category)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{item.quantity}</div>
                        <div className="text-xs text-gray-500">Min: {item.min_quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.supplier?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openTransactionModal(item)}
                          className="text-green-600 hover:text-green-800 font-medium mr-3"
                        >
                          Stock In/Out
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-teal-600 hover:text-teal-800 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Stock Item</h3>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Paracetamol"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="input-field"
                >
                  <option value="lehyam">Lehyam</option>
                  <option value="rasayanam">Rasayanam</option>
                  <option value="arishtam">Arishtam</option>
                  <option value="aasavam">Aasavam</option>
                  <option value="tablet">Tablet</option>
                  <option value="choornam">Choornam</option>
                  <option value="ointment">Ointment</option>
                  <option value="kashayam">Kashayam</option>
                  <option value="thailam">Thailam</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                <input
                  type="text"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="input-field"
                  placeholder="e.g., tablets, units"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Quantity</label>
                <input
                  type="number"
                  value={newItem.min_quantity}
                  onChange={(e) => setNewItem({ ...newItem, min_quantity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                <select
                  value={newItem.supplier_id}
                  onChange={(e) => setNewItem({ ...newItem, supplier_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.filter(s => s.is_active).map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Shelf A1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newItem.expiry_date}
                  onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                <input
                  type="text"
                  value={newItem.batch_number}
                  onChange={(e) => setNewItem({ ...newItem, batch_number: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddItem} className="btn-primary flex-1">Add Item</button>
              <button onClick={() => { setShowAddModal(false); resetNewItem(); }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Stock Item</h3>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                  className="input-field"
                >
                  <option value="lehyam">Lehyam</option>
                  <option value="rasayanam">Rasayanam</option>
                  <option value="arishtam">Arishtam</option>
                  <option value="aasavam">Aasavam</option>
                  <option value="tablet">Tablet</option>
                  <option value="choornam">Choornam</option>
                  <option value="ointment">Ointment</option>
                  <option value="kashayam">Kashayam</option>
                  <option value="thailam">Thailam</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={selectedItem.description || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                <input
                  type="text"
                  value={selectedItem.unit}
                  onChange={(e) => setSelectedItem({ ...selectedItem, unit: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Quantity</label>
                <input
                  type="number"
                  value={selectedItem.min_quantity}
                  onChange={(e) => setSelectedItem({ ...selectedItem, min_quantity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Quantity</label>
                <input
                  type="number"
                  value={selectedItem.max_quantity || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, max_quantity: parseInt(e.target.value) || null })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({ ...selectedItem, price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                <select
                  value={selectedItem.supplier_id || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, supplier_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.filter(s => s.is_active).map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={selectedItem.location || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, location: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={selectedItem.expiry_date || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, expiry_date: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
                <input
                  type="text"
                  value={selectedItem.batch_number || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, batch_number: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEditItem} className="btn-primary flex-1">Update Item</button>
              <button 
                onClick={() => { 
                  setShowEditModal(false); 
                  setSelectedItem(null); 
                }} 
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedItem && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Stock Transaction</h3>
            <div className="mb-4 p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm font-medium text-teal-900">{selectedItem.name}</p>
              <p className="text-xs text-teal-600">Current Stock: {selectedItem.quantity} {selectedItem.unit}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={transaction.type}
                  onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
                  className="input-field"
                >
                  <option value="in">Stock In (Add)</option>
                  <option value="out">Stock Out (Remove)</option>
                  <option value="adjustment">Adjustment (Set)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={transaction.quantity}
                  onChange={(e) => setTransaction({ ...transaction, quantity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                <textarea
                  value={transaction.reason}
                  onChange={(e) => setTransaction({ ...transaction, reason: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Optional reason for transaction"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Number</label>
                <input
                  type="text"
                  value={transaction.reference_number}
                  onChange={(e) => setTransaction({ ...transaction, reference_number: e.target.value })}
                  className="input-field"
                  placeholder="e.g., PO-12345"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleTransaction} className="btn-primary flex-1">Record Transaction</button>
              <button 
                onClick={() => { 
                  setShowTransactionModal(false); 
                  setSelectedItem(null);
                  setTransaction({ type: 'in', quantity: 0, reason: '', reference_number: '' });
                }} 
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-emerald-50 border border-emerald-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-teal-900 mb-1">Stock Management</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• Add and manage all types of stock items</li>
              <li>• Track stock levels and get low stock alerts</li>
              <li>• Record stock in/out transactions</li>
              <li>• Monitor expiry dates and batch numbers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

