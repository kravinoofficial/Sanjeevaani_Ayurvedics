'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/lib/database.types'
import SearchBar from '@/components/SearchBar'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'receptionist' as UserRole,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const loadUsers = async () => {
    const { data } = await (supabase as any)
      .from('users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setFilteredUsers(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Hash password using PostgreSQL function
      const { data: hashData, error: hashError } = await (supabase as any)
        .rpc('hash_password', { password: formData.password })

      if (hashError || !hashData) {
        alert('Error hashing password: ' + (hashError?.message || 'Unknown error'))
        return
      }

      // Insert user
      const { error: insertError } = await (supabase as any)
        .from('users')
        .insert({
          email: formData.email,
          password_hash: hashData,
          full_name: formData.full_name,
          role: formData.role,
          is_active: true
        })

      if (insertError) {
        alert('Error creating user: ' + insertError.message)
        return
      }

      alert('User created successfully!')
      setShowForm(false)
      setFormData({ email: '', password: '', full_name: '', role: 'receptionist' })
      loadUsers()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)
      
      if (error) throw error
      loadUsers()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-purple-100 text-purple-800',
      receptionist: 'bg-teal-100 text-teal-800',
      doctor: 'bg-green-100 text-green-800',
      pharmacist: 'bg-orange-100 text-orange-800',
      physical_medicine: 'bg-pink-100 text-pink-800',
      staff: 'bg-indigo-100 text-indigo-800',
    }
    return colors[role]
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
            <p className="text-gray-600 text-sm mt-1">Manage hospital staff and their roles</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="user@hospital.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="input-field"
                  >
                    <option value="receptionist">Receptionist</option>
                    <option value="doctor">Doctor</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="physical_medicine">Physical Medicine</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-success">
                Create User
              </button>
            </form>
          </div>
        )}

        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or role..."
          />
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 font-semibold">{user.full_name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`${user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} font-medium`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  )
}

