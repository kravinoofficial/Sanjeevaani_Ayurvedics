// Centralized API client for making secure server-side requests
// All database operations should go through these API endpoints

type ApiResponse<T> = {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl = '/api'

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'An error occurred' }
      }

      return { data }
    } catch (error: any) {
      return { error: error.message || 'Network error' }
    }
  }

  // Auth endpoints
  async login(email: string, password: string, role?: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' })
  }

  // Patient endpoints
  async getPatients() {
    return this.request('/patients', { method: 'GET' })
  }

  async getPatient(id: string) {
    return this.request(`/patients/${id}`, { method: 'GET' })
  }

  async createPatient(patient: any) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    })
  }

  async updatePatient(id: string, patient: any) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    })
  }

  async deletePatient(id: string) {
    return this.request(`/patients/${id}`, { method: 'DELETE' })
  }

  // OP Registration endpoints
  async getOPRegistrations(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/op-registrations${query}`, { method: 'GET' })
  }

  async getOPRegistration(id: string) {
    return this.request(`/op-registrations/${id}`, { method: 'GET' })
  }

  async createOPRegistration(registration: any) {
    return this.request('/op-registrations', {
      method: 'POST',
      body: JSON.stringify(registration),
    })
  }

  async updateOPRegistration(id: string, registration: any) {
    return this.request(`/op-registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(registration),
    })
  }

  // Medicine endpoints
  async getMedicines() {
    return this.request('/medicines', { method: 'GET' })
  }

  async createMedicine(medicine: any) {
    return this.request('/medicines', {
      method: 'POST',
      body: JSON.stringify(medicine),
    })
  }

  async updateMedicine(id: string, medicine: any) {
    return this.request(`/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicine),
    })
  }

  async deleteMedicine(id: string) {
    return this.request(`/medicines/${id}`, { method: 'DELETE' })
  }

  // Prescription endpoints
  async getPrescriptions(opId: string) {
    return this.request(`/prescriptions?opId=${opId}`, { method: 'GET' })
  }

  async createPrescription(prescription: any) {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescription),
    })
  }

  async updatePrescriptionStatus(id: string, status: string, servedBy?: string) {
    return this.request(`/prescriptions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, servedBy }),
    })
  }

  // Treatment endpoints
  async getTreatments() {
    return this.request('/treatments', { method: 'GET' })
  }

  async createTreatment(treatment: any) {
    return this.request('/treatments', {
      method: 'POST',
      body: JSON.stringify(treatment),
    })
  }

  async updateTreatmentStatus(id: string, status: string, report?: string, servedBy?: string) {
    return this.request(`/treatments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, report, servedBy }),
    })
  }

  // Billing endpoints
  async getBills(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/bills${query}`, { method: 'GET' })
  }

  async createBill(bill: any) {
    return this.request('/bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    })
  }

  // Stock endpoints
  async getStockItems() {
    return this.request('/stock', { method: 'GET' })
  }

  async createStockItem(item: any) {
    return this.request('/stock', {
      method: 'POST',
      body: JSON.stringify(item),
    })
  }

  async updateStockItem(id: string, item: any) {
    return this.request(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    })
  }

  async createStockTransaction(transaction: any) {
    return this.request('/stock/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    })
  }

  // User management endpoints
  async getUsers() {
    return this.request('/users', { method: 'GET' })
  }

  async createUser(user: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    })
  }

  async updateUser(id: string, user: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' })
  }

  // Reports endpoints
  async getReports(type: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return this.request(`/reports/${type}${query}`, { method: 'GET' })
  }

  // Charges endpoints
  async getCharges() {
    return this.request('/charges', { method: 'GET' })
  }

  async updateCharge(id: string, charge: any) {
    return this.request(`/charges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(charge),
    })
  }
}

// Export singleton instance
export const api = new ApiClient()
