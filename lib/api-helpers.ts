// Helper functions for API calls

export async function fetchConsultationFee(): Promise<number> {
  try {
    const response = await fetch('/api/charges')
    const result = await response.json()

    if (response.ok && result.data) {
      const consultationCharge = result.data.find((c: any) => c.charge_type === 'consultation')
      if (consultationCharge) {
        return Number(consultationCharge.amount)
      }
    }
  } catch (error) {
    console.error('Error loading consultation fee:', error)
  }
  return 500 // Default fallback
}

export async function fetchMedicines(search?: string) {
  try {
    const url = search ? `/api/medicines?search=${encodeURIComponent(search)}` : '/api/medicines'
    const response = await fetch(url)
    const result = await response.json()

    if (response.ok && result.data) {
      return result.data
    }
  } catch (error) {
    console.error('Error loading medicines:', error)
  }
  return []
}

export async function createMedicine(data: {
  name: string
  description?: string
  unit: string
  price: number
}) {
  const response = await fetch('/api/medicines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to create medicine')
  }

  return result.data
}

export async function updateMedicine(
  id: string,
  data: {
    name?: string
    description?: string
    unit?: string
    price?: number
  }
) {
  const response = await fetch(`/api/medicines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update medicine')
  }

  return result.data
}

export async function deleteMedicine(id: string) {
  const response = await fetch(`/api/medicines/${id}`, {
    method: 'DELETE',
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete medicine')
  }

  return result
}
