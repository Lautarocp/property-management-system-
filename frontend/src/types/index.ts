export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApartmentComplex {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode?: string
  description?: string
  isActive: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
  apartments?: Apartment[]
}

export interface Apartment {
  id: string
  number: string
  floor?: number
  area?: number
  monthlyRent: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE'
  description?: string
  complexId: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dni?: string
  birthDate?: string
  notes?: string
  hasGuarantor: boolean
  guarantorFirstName?: string
  guarantorLastName?: string
  guarantorDni?: string
  guarantorPhone?: string
  guarantorEmail?: string
  isActive: boolean
  createdById: string
  createdAt: string
  updatedAt: string
}

export interface Lease {
  id: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING'
  notes?: string
  apartmentId: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  type: 'RENT' | 'DEPOSIT' | 'LATE_FEE' | 'OTHER'
  notes?: string
  leaseId: string
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: 'REPAIRS' | 'UTILITIES' | 'CLEANING' | 'INSURANCE' | 'TAXES' | 'STAFF' | 'OTHER'
  receipt?: string
  notes?: string
  complexId: string
  createdAt: string
  updatedAt: string
}

export interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  resolvedAt?: string
  notes?: string
  apartmentId: string
  tenantId?: string
  createdAt: string
  updatedAt: string
}
