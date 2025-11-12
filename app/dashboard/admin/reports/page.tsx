'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type ReportType = 'daily-patients' | 'date-range-patients' | 'stock-summary' | 'stock-product' | 'patient-history'

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  
  // Date filters
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Product filter
  const [selectedProduct, setSelectedProduct] = useState('')
  const [products, setProducts] = useState<any[]>([])
  
  // Patient filter
  const [selectedPatient, setSelectedPatient] = useState('')
  const [patients, setPatients] = useState<any[]>([])

  const generateDailyPatientReport = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('op_registrations')
        .select(`
          *,
          patients (patient_id, full_name, age, gender, phone),
          doctor:users!op_registrations_doctor_id_fkey (full_name),
          medicine_prescriptions (
            id,
            medicines (name, price),
            quantity,
            status
          ),
          physical_treatment_prescriptions (
            id,
            treatment_type,
            status,
            physical_treatments (name, price)
          )
        `)
        .eq('registration_date', selectedDate)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReportData(data)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  const generateDateRangeReport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('op_registrations')
        .select(`
          *,
          patients (patient_id, full_name, age, gender),
          doctor:users!op_registrations_doctor_id_fkey (full_name),
          medicine_prescriptions (id, status),
          physical_treatment_prescriptions (id, status)
        `)
        .gte('registration_date', startDate)
        .lte('registration_date', endDate)
        .order('registration_date', { ascending: true })

      if (error) throw error
      setReportData(data)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  const generateStockSummaryReport = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .order('category')
        .order('name')

      if (error) throw error
      setReportData(data)
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  const generateProductStockReport = async () => {
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }
    setLoading(true)
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('stock_items')
        .select('*')
        .eq('id', selectedProduct)
        .single()

      if (itemError) throw itemError

      const { data: transactions, error: transError } = await supabase
        .from('stock_transactions')
        .select('*')
        .eq('stock_item_id', selectedProduct)
        .order('created_at', { ascending: false })

      if (transError) throw transError

      setReportData({ item: itemData, transactions })
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  const generatePatientHistoryReport = async () => {
    if (!selectedPatient) {
      alert('Please select a patient')
      return
    }
    setLoading(true)
    try {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', selectedPatient)
        .single()

      if (patientError) throw patientError

      const { data: opsData, error: opsError } = await supabase
        .from('op_registrations')
        .select(`
          *,
          doctor:users!op_registrations_doctor_id_fkey (full_name),
          medicine_prescriptions (
            id,
            medicines (name, price),
            quantity,
            dosage,
            status
          ),
          physical_treatment_prescriptions (
            id,
            treatment_type,
            duration,
            status,
            physical_treatments (name, price)
          )
        `)
        .eq('patient_id', selectedPatient)
        .order('registration_date', { ascending: false })

      if (opsError) throw opsError

      setReportData({ patient: patientData, ops: opsData })
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
    setLoading(false)
  }

  const loadProducts = async () => {
    const { data } = await supabase
      .from('stock_items')
      .select('id, name, category')
      .order('name')
    setProducts(data || [])
  }

  const loadPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, patient_id, full_name')
      .order('full_name')
    setPatients(data || [])
  }

  const downloadCSV = () => {
    let csvContent = ''
    let filename = ''

    if (selectedReport === 'daily-patients' && Array.isArray(reportData)) {
      filename = `daily-patients-${selectedDate}.csv`
      csvContent = 'Patient ID,Patient Name,Age,Gender,Doctor,Medicines,Treatments,Status\n'
      reportData.forEach((op: any) => {
        csvContent += `${op.patients?.patient_id},"${op.patients?.full_name}",${op.patients?.age},${op.patients?.gender},"${op.doctor?.full_name}",${op.medicine_prescriptions?.length || 0},${op.physical_treatment_prescriptions?.length || 0},${op.status}\n`
      })
    } else if (selectedReport === 'date-range-patients' && Array.isArray(reportData)) {
      filename = `patients-${startDate}-to-${endDate}.csv`
      csvContent = 'Date,Patient ID,Patient Name,Doctor,Medicines,Treatments,Status\n'
      reportData.forEach((op: any) => {
        csvContent += `${op.registration_date},${op.patients?.patient_id},"${op.patients?.full_name}","${op.doctor?.full_name}",${op.medicine_prescriptions?.length || 0},${op.physical_treatment_prescriptions?.length || 0},${op.status}\n`
      })
    } else if (selectedReport === 'stock-summary' && Array.isArray(reportData)) {
      filename = `stock-summary-${new Date().toISOString().split('T')[0]}.csv`
      csvContent = 'Item Name,Category,Quantity,Unit,Min Quantity,Price,Status\n'
      reportData.forEach((item: any) => {
        const status = item.quantity <= 0 ? 'Out of Stock' : item.quantity <= item.min_quantity ? 'Low Stock' : 'In Stock'
        csvContent += `"${item.name}",${item.category},${item.quantity},${item.unit || ''},${item.min_quantity || 0},${item.price || 0},${status}\n`
      })
    } else {
      // Fallback to JSON
      const reportContent = JSON.stringify(reportData, null, 2)
      const blob = new Blob([reportContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedReport}-report-${new Date().toISOString()}.json`
      a.click()
      return
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  const reports = [
    {
      id: 'daily-patients' as ReportType,
      title: 'Daily Patient Report',
      description: 'View all patients registered on a specific date',
      icon: '📅',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'date-range-patients' as ReportType,
      title: 'Date Range Patient Report',
      description: 'View patients registered within a date range',
      icon: '📊',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'stock-summary' as ReportType,
      title: 'Stock Summary Report',
      description: 'Complete overview of all stock items',
      icon: '📦',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'stock-product' as ReportType,
      title: 'Product Stock Report',
      description: 'Detailed stock history for a specific product',
      icon: '📋',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'patient-history' as ReportType,
      title: 'Patient History Report',
      description: 'Complete medical history for a specific patient',
      icon: '🏥',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate and download comprehensive reports</p>
      </div>

      {!selectedReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => {
                setSelectedReport(report.id)
                setReportData(null)
                if (report.id === 'stock-product') loadProducts()
                if (report.id === 'patient-history') loadPatients()
              }}
              className="card hover:shadow-xl transition-all text-left group"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {report.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{report.title}</h3>
              <p className="text-gray-600 text-sm">{report.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {reports.find(r => r.id === selectedReport)?.title}
            </h3>
            <button
              onClick={() => {
                setSelectedReport(null)
                setReportData(null)
              }}
              className="btn-secondary"
            >
              ← Back to Reports
            </button>
          </div>

          {/* Report Filters */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            {selectedReport === 'daily-patients' && (
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <button onClick={generateDailyPatientReport} className="btn-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            )}

            {selectedReport === 'date-range-patients' && (
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <button onClick={generateDateRangeReport} className="btn-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            )}

            {selectedReport === 'stock-summary' && (
              <div className="flex justify-end">
                <button onClick={generateStockSummaryReport} className="btn-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            )}

            {selectedReport === 'stock-product' && (
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.category})
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={generateProductStockReport} className="btn-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            )}

            {selectedReport === 'patient-history' && (
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Patient</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.full_name} ({patient.patient_id})
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={generatePatientHistoryReport} className="btn-primary" disabled={loading}>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            )}
          </div>

          {/* Report Actions */}
          {reportData && (
            <div className="flex gap-3 mb-6 print:hidden">
              <button onClick={printReport} className="btn-primary flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Save PDF
              </button>
              <button onClick={downloadCSV} className="btn-secondary flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV
              </button>
            </div>
          )}

          {/* Report Display */}
          {reportData && (
            <div id="report-content" className="space-y-6">
              {/* Daily Patient Report */}
              {selectedReport === 'daily-patients' && Array.isArray(reportData) && (
                <div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-100 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-bold text-teal-900 mb-2">Daily Patient Report</h4>
                    <p className="text-teal-700">Date: {new Date(selectedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Patients</p>
                        <p className="text-3xl font-bold text-teal-600">{reportData.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-3xl font-bold text-green-600">{reportData.filter(op => op.status === 'completed').length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600">{reportData.filter(op => op.status === 'waiting').length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Age/Gender</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doctor</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Medicines</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Treatments</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.map((op: any, index: number) => (
                          <tr key={op.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{op.patients?.full_name}</div>
                              <div className="text-xs text-gray-500">{op.patients?.patient_id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">{op.patients?.age} / {op.patients?.gender}</td>
                            <td className="px-4 py-3 text-sm">{op.doctor?.full_name}</td>
                            <td className="px-4 py-3 text-sm">{op.medicine_prescriptions?.length || 0}</td>
                            <td className="px-4 py-3 text-sm">{op.physical_treatment_prescriptions?.length || 0}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                op.status === 'completed' ? 'bg-green-100 text-green-800' :
                                op.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {op.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Date Range Report */}
              {selectedReport === 'date-range-patients' && Array.isArray(reportData) && (
                <div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-bold text-green-900 mb-2">Date Range Patient Report</h4>
                    <p className="text-green-700">
                      From: {new Date(startDate).toLocaleDateString('en-IN')} - To: {new Date(endDate).toLocaleDateString('en-IN')}
                    </p>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Patients</p>
                        <p className="text-3xl font-bold text-green-600">{reportData.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-3xl font-bold text-green-600">{reportData.filter(op => op.status === 'completed').length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Avg. per Day</p>
                        <p className="text-3xl font-bold text-teal-600">
                          {Math.round(reportData.length / Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))))}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Days</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doctor</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prescriptions</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.map((op: any) => (
                          <tr key={op.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{new Date(op.registration_date).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{op.patients?.full_name}</div>
                              <div className="text-xs text-gray-500">{op.patients?.patient_id}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">{op.doctor?.full_name}</td>
                            <td className="px-4 py-3 text-sm">
                              {op.medicine_prescriptions?.length || 0} medicines, {op.physical_treatment_prescriptions?.length || 0} treatments
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                op.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {op.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stock Summary Report */}
              {selectedReport === 'stock-summary' && Array.isArray(reportData) && (
                <div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-bold text-purple-900 mb-2">Stock Summary Report</h4>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Items</p>
                        <p className="text-3xl font-bold text-purple-600">{reportData.length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Out of Stock</p>
                        <p className="text-3xl font-bold text-red-600">{reportData.filter((item: any) => item.quantity <= 0).length}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-3xl font-bold text-orange-600">
                          {reportData.filter((item: any) => item.quantity > 0 && item.quantity <= (item.min_quantity || 0)).length}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">In Stock</p>
                        <p className="text-3xl font-bold text-green-600">
                          {reportData.filter((item: any) => item.quantity > (item.min_quantity || 0)).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Min Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.map((item: any, index: number) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{index + 1}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm capitalize">{item.category}</td>
                            <td className="px-4 py-3 text-sm font-semibold">{item.quantity} {item.unit || ''}</td>
                            <td className="px-4 py-3 text-sm">{item.min_quantity || 0}</td>
                            <td className="px-4 py-3 text-sm">₹{Number(item.price || 0).toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.quantity <= 0 ? 'bg-red-100 text-red-800' :
                                item.quantity <= (item.min_quantity || 0) ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.quantity <= 0 ? 'Out of Stock' : item.quantity <= (item.min_quantity || 0) ? 'Low Stock' : 'In Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Product Stock Report */}
              {selectedReport === 'stock-product' && reportData?.item && (
                <div>
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-bold text-orange-900 mb-2">Product Stock Report</h4>
                    <p className="text-orange-700 text-lg font-semibold">{reportData.item.name}</p>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Current Stock</p>
                        <p className="text-3xl font-bold text-orange-600">{reportData.item.quantity}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Min Quantity</p>
                        <p className="text-3xl font-bold text-teal-600">{reportData.item.min_quantity || 0}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Total Transactions</p>
                        <p className="text-3xl font-bold text-purple-600">{reportData.transactions?.length || 0}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-3xl font-bold text-green-600">₹{Number(reportData.item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="text-lg font-bold text-gray-800 mb-4">Transaction History</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reference</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.transactions?.map((trans: any) => (
                          <tr key={trans.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{new Date(trans.transaction_date).toLocaleDateString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                trans.transaction_type === 'in' ? 'bg-green-100 text-green-800' :
                                trans.transaction_type === 'out' ? 'bg-red-100 text-red-800' :
                                'bg-teal-100 text-teal-800'
                              }`}>
                                {trans.transaction_type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold">{trans.quantity}</td>
                            <td className="px-4 py-3 text-sm">{trans.reference_number || '-'}</td>
                            <td className="px-4 py-3 text-sm">{trans.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Patient History Report */}
              {selectedReport === 'patient-history' && reportData?.patient && (
                <div>
                  <div className="bg-gradient-to-r from-pink-50 to-pink-100 p-6 rounded-lg mb-6">
                    <h4 className="text-xl font-bold text-pink-900 mb-2">Patient History Report</h4>
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Patient Information</p>
                        <p className="text-xl font-bold text-gray-900">{reportData.patient.full_name}</p>
                        <p className="text-sm text-gray-600">ID: {reportData.patient.patient_id}</p>
                        <p className="text-sm text-gray-600">Age: {reportData.patient.age} | Gender: {reportData.patient.gender}</p>
                        <p className="text-sm text-gray-600">Phone: {reportData.patient.phone || 'N/A'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Visit Statistics</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-2xl font-bold text-pink-600">{reportData.ops?.length || 0}</p>
                            <p className="text-xs text-gray-600">Total Visits</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{reportData.ops?.filter((op: any) => op.status === 'completed').length || 0}</p>
                            <p className="text-xs text-gray-600">Completed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="text-lg font-bold text-gray-800 mb-4">Visit History</h5>
                  <div className="space-y-4">
                    {reportData.ops?.map((op: any, index: number) => (
                      <div key={op.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-bold text-gray-900">Visit #{reportData.ops.length - index}</p>
                            <p className="text-sm text-gray-600">{new Date(op.registration_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            op.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {op.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3"><span className="font-semibold">Doctor:</span> {op.doctor?.full_name}</p>
                        
                        {op.medicine_prescriptions && op.medicine_prescriptions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Medicines:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {op.medicine_prescriptions.map((med: any) => (
                                <li key={med.id}>
                                  {med.medicines?.name} - {med.dosage} ({med.quantity} units) - {med.status}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {op.physical_treatment_prescriptions && op.physical_treatment_prescriptions.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Physical Treatments:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {op.physical_treatment_prescriptions.map((treat: any) => (
                                <li key={treat.id}>
                                  {treat.treatment_type} - {treat.duration || 'N/A'} - {treat.status}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!reportData && !loading && (
            <div className="text-center py-12 text-gray-500">
              <p>Configure filters above and click "Generate Report" to view data</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

