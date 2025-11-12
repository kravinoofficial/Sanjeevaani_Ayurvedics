'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PharmacistGenerateBillPage({ params }: { params: { id: string } }) {
  const [opData, setOpData] = useState<any>(null)
  const [consultationFee, setConsultationFee] = useState(0)
  const [loading, setLoading] = useState(true)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Load OP data
    const { data, error } = await supabase
      .from('op_registrations')
      .select(`
        *,
        patients (patient_id, full_name, age, gender, phone, address),
        doctor:users!op_registrations_doctor_id_fkey (full_name),
        medicine_prescriptions (
          id,
          medicine_id,
          quantity,
          dosage,
          status,
          medicines (name, unit, price)
        ),
        physical_treatment_prescriptions (
          id,
          treatment_id,
          treatment_type,
          duration,
          status,
          physical_treatments (name, price)
        )
      `)
      .eq('id', params.id)
      .single()

    if (!error && data) {
      setOpData(data)
    }

    // Load consultation fee
    try {
      const response = await fetch('/api/charges')
      const result = await response.json()

      if (response.ok && result.data) {
        const consultationCharge = result.data.find((c: any) => c.charge_type === 'consultation')
        if (consultationCharge) {
          setConsultationFee(Number(consultationCharge.amount))
        }
      }
    } catch (error) {
      console.error('Error loading consultation fee:', error)
    }

    setLoading(false)
  }

  const calculateBill = () => {
    let subtotal = 0
    const items: any[] = []

    // Only include medicines and treatments (consultation fee already collected at registration)
    opData?.medicine_prescriptions?.forEach((med: any) => {
      if (med.status === 'served' && med.medicines?.price) {
        const amount = Number(med.medicines.price) * med.quantity
        subtotal += amount
        items.push({
          name: `${med.medicines.name} (${med.medicines.unit})`,
          quantity: med.quantity,
          rate: Number(med.medicines.price),
          amount
        })
      }
    })

    opData?.physical_treatment_prescriptions?.forEach((treatment: any) => {
      if (treatment.status === 'served') {
        const price = treatment.physical_treatments?.price || 0
        subtotal += Number(price)
        items.push({
          name: treatment.treatment_type,
          quantity: 1,
          rate: Number(price),
          amount: Number(price)
        })
      }
    })

    const discountAmount = (subtotal * discount) / 100
    const total = subtotal - discountAmount

    return { items, subtotal, discountAmount, total }
  }

  const handlePrint = () => {
    const printContent = document.getElementById('bill-content')
    if (!printContent) {
      window.print()
      return
    }

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) {
      alert('Please allow popups to print the bill')
      return
    }

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${billNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
            body {
              font-family: 'Poppins', sans-serif;
            }
            @media print {
              @page { margin: 0.5cm; size: A4; }
            }
          </style>
        </head>
        <body class="bg-white p-5">
          ${printContent.innerHTML}
        </body>
      </html>
    `

    printWindow.document.write(billHTML)
    printWindow.document.close()
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading bill data...</p>
        </div>
      </div>
    )
  }

  if (!opData) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">OP not found</p>
        <button onClick={() => router.push('/dashboard/pharmacist/billing')} className="mt-4 btn-secondary">
          Go Back
        </button>
      </div>
    )
  }

  const bill = calculateBill()
  const billNumber = `BILL${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => router.push('/dashboard/pharmacist/billing')} className="btn-secondary">
          ← Back to Billing
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn-primary flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="card print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input-field"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="insurance">Insurance</option>
            </select>
          </div>
        </div>
      </div>

      <div id="bill-content" className="bg-white rounded-xl shadow-lg border-2 border-blue-200 overflow-hidden max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Sanjeevani Ayurvedics 🌿</h1>
              <p className="text-blue-100">Authentic Ayurveda • Personalized Treatments</p>
              <p className="text-blue-100 text-sm mt-2">📍 Chanthavila, Thiruvananthapuram 695584 | 📞 8589007205</p>
              <p className="text-blue-100 text-sm">✨ Restore Balance. Revive Health</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <p className="text-blue-100 text-sm font-medium">INVOICE</p>
                <p className="text-2xl font-bold mt-1">{billNumber}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 uppercase">Bill To</h3>
              <p className="font-bold text-lg text-gray-900">{opData.patients?.full_name}</p>
              <p className="text-sm text-gray-600 mt-1">Patient ID: {opData.patients?.patient_id}</p>
              <p className="text-sm text-gray-600">Age: {opData.patients?.age} | Gender: {opData.patients?.gender}</p>
              {opData.patients?.phone && (
                <p className="text-sm text-gray-600">Phone: {opData.patients.phone}</p>
              )}
              {opData.patients?.address && (
                <p className="text-sm text-gray-600 mt-2">{opData.patients.address}</p>
              )}
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 uppercase">Bill Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Doctor:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    Dr. {opData.doctor?.full_name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <span className="text-sm font-semibold text-gray-900 uppercase">{paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Rate (₹)</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {bill.items.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-80">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount ({discount}%):</span>
                      <span className="font-semibold text-green-600">- ₹{bill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-blue-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-blue-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-blue-600">₹{bill.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t-2 border-blue-200">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Payment is due upon receipt of this invoice</li>
                  <li>• Please retain this bill for insurance claims</li>
                  <li>• All services are non-refundable</li>
                </ul>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700 mb-4">Authorized Signature</p>
                <div className="border-t-2 border-gray-300 w-48 ml-auto mt-8"></div>
                <p className="text-xs text-gray-600 mt-2">Sanjeevani Ayurvedics</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-900 font-semibold">Thank you for choosing Sanjeevani Ayurvedics! 🌿</p>
            <p className="text-sm text-blue-700 mt-1">✨ Restore Balance. Revive Health</p>
          </div>
        </div>
      </div>
    </div>
  )
}
