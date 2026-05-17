export interface Permission {
  module: string
  actions: Record<string, boolean>
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  initials: string
  role: 'admin' | 'recruiter' | 'hiring_manager' | 'interviewer' | 'viewer'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  department: string
  teamIds: string[]
  permissions: Permission[]
  lastActive: string
  joinedDate: string
  candidatesAssigned: number
  interviewsConducted: number
  offersExtended: number
  twoFactorEnabled: boolean
  notificationPrefs: {
    email: boolean
    inApp: boolean
    sms: boolean
  }
}

export interface Team {
  id: string
  name: string
  description: string
  department: string
  type: 'hiring' | 'technical' | 'hr' | 'executive' | 'cross_functional'
  leadId: string
  memberIds: string[]
  userCount: number
  createdAt: string
  updatedAt: string
}

export type SortDirection = 'asc' | 'desc'

