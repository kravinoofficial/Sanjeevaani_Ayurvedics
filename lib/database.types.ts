export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'receptionist' | 'doctor' | 'pharmacist' | 'physical_medicine' | 'staff'
export type PrescriptionStatus = 'pending' | 'served' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          role: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          role?: UserRole
          is_active?: boolean
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          patient_id: string
          full_name: string
          age: number | null
          gender: string | null
          phone: string | null
          address: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          full_name: string
          age?: number | null
          gender?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          patient_id?: string
          full_name?: string
          age?: number | null
          gender?: string | null
          phone?: string | null
          address?: string | null
        }
      }
      op_registrations: {
        Row: {
          id: string
          patient_id: string
          registration_date: string
          status: string
          doctor_id: string | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          patient_id: string
          registration_date?: string
          status?: string
          doctor_id?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          patient_id?: string
          registration_date?: string
          status?: string
          doctor_id?: string | null
          notes?: string | null
        }
      }
      medicines: {
        Row: {
          id: string
          name: string
          description: string | null
          stock_quantity: number
          unit: string | null
          price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          stock_quantity?: number
          unit?: string | null
          price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          stock_quantity?: number
          unit?: string | null
          price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      medicine_prescriptions: {
        Row: {
          id: string
          op_registration_id: string
          medicine_id: string
          quantity: number
          dosage: string | null
          instructions: string | null
          status: PrescriptionStatus
          prescribed_by: string | null
          served_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          op_registration_id: string
          medicine_id: string
          quantity: number
          dosage?: string | null
          instructions?: string | null
          status?: PrescriptionStatus
          prescribed_by?: string | null
          served_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          op_registration_id?: string
          medicine_id?: string
          quantity?: number
          dosage?: string | null
          instructions?: string | null
          status?: PrescriptionStatus
          prescribed_by?: string | null
          served_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      physical_treatment_prescriptions: {
        Row: {
          id: string
          op_registration_id: string
          treatment_type: string
          instructions: string | null
          duration: string | null
          status: PrescriptionStatus
          prescribed_by: string | null
          served_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          op_registration_id: string
          treatment_type: string
          instructions?: string | null
          duration?: string | null
          status?: PrescriptionStatus
          prescribed_by?: string | null
          served_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          op_registration_id?: string
          treatment_type?: string
          instructions?: string | null
          duration?: string | null
          status?: PrescriptionStatus
          prescribed_by?: string | null
          served_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
