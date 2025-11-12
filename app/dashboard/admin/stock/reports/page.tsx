'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function StockReportsPage() {
  const [stockItems, setStockItems] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadStockItems()
  }, [])

  useEffect(() => {
    if (selectedItem) {
      loadTransactions()
    }
  }, [selectedItem, dateFrom, dateTo])

  const loadStockItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error loading stock items:', error)
    }

    setStockItems(data || [])
    setLoading(false)
  }

  const loadTransactions = async () => {
    if (!selectedItem) return

    let query = supabase
      .from('stock_transactions')
      .select(`
        *,
        users:performed_by (full_name)
      `)
      .eq('stock_item_id', selectedItem.id)
      .order('created_at', { ascending: false })

    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString())
    }
    if (dateTo) {
      query = query.lte('created_at', new Date(dateTo + 'T23:59:59').toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading transactions:', error)
    }

    setTransactions(data || [])
  }

  const getTransactionStats = () => {
    const totalIn = transactions
      .filter(t => t.transaction_type === 'in')
      .reduce((sum, t) => sum + t.quantity, 0)
    
    const totalOut = transactions
      .filter(t => t.transaction_type === 'out')
      .reduce((sum, t) => sum + t.quantity, 0)
    
    const adjustments = transactions
      .filter(t => t.transaction_type === 'adjustment')
      .length

    return { totalIn, totalOut, adjustments }
  }

  const filteredItems = categoryFilter === 'all' 
    ? stockItems 
    : stockItems.filter(item => item.category === categoryFilter)

  const stats = selectedItem ? getTransactionStats() : { totalIn: 0, totalOut: 0, adjustments: 0 }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading stock reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Stock Reports</h2>
            <p className="text-gray-600 text-sm mt-1">Detailed transaction history and analytics</p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn-secondary text-sm"
          >
            ← Back to Stock
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Selection */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                <option value="medicine">Medicines</option>
                <option value="equipment">Equipment</option>
                <option value="supply">Supplies</option>
                <option value="consumable">Consumables</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedItem?.id === item.id
                      ? 'bg-teal-100 border-teal-300'
                      : 'bg-white border-gray-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Stock: {item.quantity} {item.unit} | {item.category}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="lg:col-span-2">
            {!selectedItem ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Select an Item</h3>
                <p className="mt-2 text-sm text-gray-500">Choose a stock item to view its transaction history</p>
              </div>
            ) : (
              <div>
                {/* Item Header */}
                <div className="stat-card mb-6">
                  <h3 className="text-xl font-bold text-teal-900 mb-2">{selectedItem.name}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-teal-600 font-medium">Current Stock</p>
                      <p className="text-2xl font-bold text-teal-900">{selectedItem.quantity}</p>
                      <p className="text-xs text-teal-600">{selectedItem.unit}</p>
                    </div>
                    <div>
                      <p className="text-teal-600 font-medium">Min Quantity</p>
                      <p className="text-2xl font-bold text-teal-900">{selectedItem.min_quantity}</p>
                    </div>
                    <div>
                      <p className="text-teal-600 font-medium">Price</p>
                      <p className="text-2xl font-bold text-teal-900">₹{selectedItem.price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-teal-600 font-medium">Category</p>
                      <p className="text-lg font-bold text-teal-900 capitalize">{selectedItem.category}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="stat-card">
                    <p className="text-sm text-teal-700 font-medium">Total In</p>
                    <p className="text-2xl font-bold text-green-600">+{stats.totalIn}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-sm text-teal-700 font-medium">Total Out</p>
                    <p className="text-2xl font-bold text-red-600">-{stats.totalOut}</p>
                  </div>
                  <div className="stat-card">
                    <p className="text-sm text-teal-700 font-medium">Adjustments</p>
                    <p className="text-2xl font-bold text-teal-900">{stats.adjustments}</p>
                  </div>
                </div>

                {/* Date Filters */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Transaction History */}
                <div className="card">
                  <h4 className="font-semibold text-gray-800 mb-4">Transaction History ({transactions.length})</h4>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No transactions found for the selected period</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-emerald-200 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    transaction.transaction_type === 'in'
                                      ? 'bg-green-100 text-green-800'
                                      : transaction.transaction_type === 'out'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-teal-100 text-teal-800'
                                  }`}
                                >
                                  {transaction.transaction_type.toUpperCase()}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {transaction.transaction_type === 'in' ? '+' : transaction.transaction_type === 'out' ? '-' : ''}
                                  {transaction.quantity} {selectedItem.unit}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Previous:</span>
                                  <span className="font-medium text-gray-900 ml-2">{transaction.previous_quantity}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">New:</span>
                                  <span className="font-medium text-gray-900 ml-2">{transaction.new_quantity}</span>
                                </div>
                              </div>

                              {transaction.reason && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-600">Reason:</span>
                                  <span className="text-gray-900 ml-2">{transaction.reason}</span>
                                </div>
                              )}

                              {transaction.reference_number && (
                                <div className="mt-1 text-sm">
                                  <span className="text-gray-600">Ref:</span>
                                  <span className="text-gray-900 ml-2">{transaction.reference_number}</span>
                                </div>
                              )}

                              <div className="mt-2 text-xs text-gray-500">
                                <span>By: {transaction.users?.full_name || 'System'}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(transaction.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-emerald-50 border border-emerald-200">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-teal-600 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h4 className="font-semibold text-teal-900 mb-1">Stock Reports</h4>
            <ul className="text-sm text-teal-800 space-y-1">
              <li>• View complete transaction history for each item</li>
              <li>• Track stock in, stock out, and adjustments</li>
              <li>• Filter by date range for specific periods</li>
              <li>• See who performed each transaction</li>
              <li>• Monitor stock levels and movements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

