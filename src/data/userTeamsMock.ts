import type { User, Team } from '@/types/userTeams'

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@interq.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop',
    initials: 'SJ',
    role: 'recruiter',
    status: 'active',
    department: 'Talent Acquisition',
    teamIds: ['1', '3'],
    permissions: [],
    lastActive: '2024-12-01T10:30:00Z',
    joinedDate: '2023-06-15',
    candidatesAssigned: 24,
    interviewsConducted: 18,
    offersExtended: 6,
    twoFactorEnabled: true,
    notificationPrefs: { email: true, inApp: true, sms: false }
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.c@interq.com',
    initials: 'MC',
    role: 'hiring_manager',
    status: 'active',
    department: 'Engineering',
    teamIds: ['2'],
    permissions: [],
    lastActive: '2024-11-28T15:45:00Z',
    joinedDate: '2023-08-22',
    candidatesAssigned: 12,
    interviewsConducted: 8,
    offersExtended: 3,
    twoFactorEnabled: false,
    notificationPrefs: { email: true, inApp: true, sms: true }
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@interq.com',
    initials: 'ER',
    role: 'interviewer',
    status: 'pending',
    department: 'Technical Team',
    teamIds: ['1'],
    permissions: [],
    lastActive: '2024-12-01T09:15:00Z',
    joinedDate: '2024-11-20',
    candidatesAssigned: 5,
    interviewsConducted: 2,
    offersExtended: 0,
    twoFactorEnabled: false,
    notificationPrefs: { email: true, inApp: false, sms: false }
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.k@interq.com',
    phone: '+1 (555) 987-6543',
    initials: 'DK',
    role: 'admin',
    status: 'inactive',
    department: 'HR',
    teamIds: [],
    permissions: [],
    lastActive: '2024-10-15T14:20:00Z',
    joinedDate: '2023-01-10',
    candidatesAssigned: 0,
    interviewsConducted: 0,
    offersExtended: 0,
    twoFactorEnabled: true,
    notificationPrefs: { email: true, inApp: true, sms: true }
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.w@interq.com',
    initials: 'LW',
    role: 'admin',
    status: 'active',
    department: 'Executive',
    teamIds: ['1', '2'],
    permissions: [],
    lastActive: '2024-12-01T11:00:00Z',
    joinedDate: '2022-12-01',
    candidatesAssigned: 50,
    interviewsConducted: 30,
    offersExtended: 12,
    twoFactorEnabled: true,
    notificationPrefs: { email: true, inApp: true, sms: true }
  }
]

export const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Engineering Hiring Team',
    description: 'Technical roles and senior engineering positions',
    department: 'Engineering',
    type: 'hiring',
    leadId: '5',
    memberIds: ['1', '3'],
    userCount: 3,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Product Management Team',
    description: 'Product managers and growth roles',
    department: 'Product',
    type: 'cross_functional',
    leadId: '2',
    memberIds: ['2'],
    userCount: 1,
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: '3',
    name: 'Sales & Marketing Team',
    description: 'Business development and marketing positions',
    department: 'Sales',
    type: 'hiring',
    leadId: '1',
    memberIds: ['1'],
    userCount: 2,
    createdAt: '2023-06-20T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z'
  }
]

export const departments = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'HR',
  'Talent Acquisition',
  'Executive'
]

export const roles = [
  'admin',
  'recruiter',
  'hiring_manager',
  'interviewer',
  'viewer'
] as const

