import { Role, User, AuditLog, Team, RoleMetrics } from '@/types/roleManagement';

export const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access with all permissions enabled',
    color: 'bg-red-500',
    status: 'active',
    userCount: 3,
    permissions: [
      { module: 'jobOpenings', actions: { view: true, create: true, edit: true, delete: true } },
      { module: 'candidates', actions: { view: true, create: true, edit: true, delete: true } },
      { module: 'interviews', actions: { view: true, create: true, edit: true, delete: true } },
      { module: 'offers', actions: { view: true, create: true, edit: true, delete: true } },
      { module: 'reports', actions: { view: true, create: true, edit: true, delete: true } },
      { module: 'settings', actions: { view: true, create: true, edit: true, delete: true } },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T14:30:00Z',
  },
  {
    id: '2',
    name: 'TAP',
    description: 'Manages job postings, candidates, and interview scheduling',
    color: 'bg-blue-500',
    status: 'active',
    userCount: 12,
    permissions: [
      { module: 'jobOpenings', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'candidates', actions: { view: true, create: true, edit: true, delete: true } },
      { module: 'interviews', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'offers', actions: { view: true, create: true, edit: false, delete: false } },
      { module: 'reports', actions: { view: true, create: true, edit: false, delete: false } },
      { module: 'settings', actions: { view: true, create: false, edit: false, delete: false } },
    ],
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-03-08T11:15:00Z',
  },
  {
    id: '3',
    name: 'Hiring Manager',
    description: 'Reviews candidates and makes hiring decisions',
    color: 'bg-green-500',
    status: 'active',
    userCount: 8,
    permissions: [
      { module: 'jobOpenings', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'candidates', actions: { view: true, create: false, edit: true, delete: false } },
      { module: 'interviews', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'offers', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'reports', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'settings', actions: { view: false, create: false, edit: false, delete: false } },
    ],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-28T16:45:00Z',
  },
  {
    id: '4',
    name: 'HR Assistant',
    description: 'Supports recruitment operations and administrative tasks',
    color: 'bg-yellow-500',
    status: 'active',
    userCount: 5,
    permissions: [
      { module: 'jobOpenings', actions: { view: true, create: true, edit: false, delete: false } },
      { module: 'candidates', actions: { view: true, create: true, edit: false, delete: false } },
      { module: 'interviews', actions: { view: true, create: true, edit: false, delete: false } },
      { module: 'offers', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'reports', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'settings', actions: { view: false, create: false, edit: false, delete: false } },
    ],
    createdAt: '2024-02-10T10:30:00Z',
    updatedAt: '2024-03-05T09:00:00Z',
  },
  {
    id: '5',
    name: 'Interviewer',
    description: 'Conducts technical and behavioral interviews',
    color: 'bg-purple-500',
    status: 'active',
    userCount: 15,
    permissions: [
      { module: 'jobOpenings', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'candidates', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'interviews', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'offers', actions: { view: false, create: false, edit: false, delete: false } },
      { module: 'reports', actions: { view: false, create: false, edit: false, delete: false } },
      { module: 'settings', actions: { view: false, create: false, edit: false, delete: false } },
    ],
    createdAt: '2024-02-15T14:00:00Z',
    updatedAt: '2024-03-01T11:30:00Z',
  },
  {
    id: '6',
    name: 'Department Head',
    description: 'Oversees department-specific hiring needs',
    color: 'bg-indigo-500',
    status: 'inactive',
    userCount: 4,
    permissions: [
      { module: 'jobOpenings', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'candidates', actions: { view: true, create: false, edit: true, delete: false } },
      { module: 'interviews', actions: { view: true, create: false, edit: false, delete: false } },
      { module: 'offers', actions: { view: true, create: true, edit: true, delete: false } },
      { module: 'reports', actions: { view: true, create: true, edit: false, delete: false } },
      { module: 'settings', actions: { view: false, create: false, edit: false, delete: false } },
    ],
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-02-20T13:00:00Z',
  },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Human Resources', roles: ['Administrator'], status: 'active', lastActive: '2024-03-18T09:30:00Z' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@company.com', department: 'Engineering', roles: ['TAP'], status: 'active', lastActive: '2024-03-18T08:45:00Z' },
  { id: '3', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Product', roles: ['Hiring Manager'], status: 'active', lastActive: '2024-03-17T16:20:00Z' },
  { id: '4', name: 'James Wilson', email: 'james.wilson@company.com', department: 'Sales', roles: ['Hiring Manager', 'Interviewer'], status: 'active', lastActive: '2024-03-18T10:15:00Z' },
  { id: '5', name: 'Lisa Martinez', email: 'lisa.martinez@company.com', department: 'Human Resources', roles: ['HR Assistant'], status: 'active', lastActive: '2024-03-18T11:00:00Z' },
  { id: '6', name: 'David Kim', email: 'david.kim@company.com', department: 'Engineering', roles: ['Interviewer'], status: 'active', lastActive: '2024-03-17T14:30:00Z' },
  { id: '7', name: 'Anna Brown', email: 'anna.brown@company.com', department: 'Marketing', roles: ['TAP'], status: 'inactive', lastActive: '2024-03-10T09:00:00Z' },
  { id: '8', name: 'Robert Taylor', email: 'robert.taylor@company.com', department: 'Finance', roles: ['TAP'], status: 'pending', lastActive: '2024-03-18T07:00:00Z' },
  { id: '9', name: 'Jennifer Lee', email: 'jennifer.lee@company.com', department: 'Human Resources', roles: ['Administrator'], status: 'active', lastActive: '2024-03-18T12:00:00Z' },
  { id: '10', name: 'Chris Anderson', email: 'chris.anderson@company.com', department: 'Operations', roles: ['Interviewer'], status: 'active', lastActive: '2024-03-17T15:45:00Z' },
  { id: '11', name: 'Michelle Wang', email: 'michelle.wang@company.com', department: 'Engineering', roles: ['Hiring Manager', 'Interviewer'], status: 'active', lastActive: '2024-03-18T13:30:00Z' },
  { id: '12', name: 'Kevin Patel', email: 'kevin.patel@company.com', department: 'Human Resources', roles: ['HR Assistant'], status: 'active', lastActive: '2024-03-16T10:00:00Z' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'CREATE', entityType: 'role', entityId: '7', entityName: 'Team Lead', userId: '1', userName: 'Sarah Johnson', changes: [], timestamp: '2024-03-18T10:00:00Z' },
  { id: '2', action: 'UPDATE', entityType: 'permission', entityId: '2', entityName: 'TAP', userId: '1', userName: 'Sarah Johnson', changes: [{ field: 'candidates.delete', oldValue: 'false', newValue: 'true' }], timestamp: '2024-03-17T14:30:00Z' },
  { id: '3', action: 'ASSIGN_ROLE', entityType: 'user', entityId: '8', entityName: 'Robert Taylor', userId: '5', userName: 'Lisa Martinez', changes: [{ field: 'role', oldValue: 'HR Assistant', newValue: 'TAP' }], timestamp: '2024-03-17T11:15:00Z' },
  { id: '4', action: 'DEACTIVATE', entityType: 'role', entityId: '6', entityName: 'Department Head', userId: '1', userName: 'Sarah Johnson', changes: [{ field: 'status', oldValue: 'active', newValue: 'inactive' }], timestamp: '2024-03-15T09:00:00Z' },
  { id: '5', action: 'UPDATE', entityType: 'user', entityId: '7', entityName: 'Anna Brown', userId: '9', userName: 'Jennifer Lee', changes: [{ field: 'status', oldValue: 'active', newValue: 'inactive' }], timestamp: '2024-03-10T16:00:00Z' },
  { id: '6', action: 'DELETE', entityType: 'role', entityId: '8', entityName: 'Intern', userId: '1', userName: 'Sarah Johnson', changes: [], timestamp: '2024-03-08T13:45:00Z' },
  { id: '7', action: 'CREATE', entityType: 'user', entityId: '12', entityName: 'Kevin Patel', userId: '5', userName: 'Lisa Martinez', changes: [], timestamp: '2024-03-05T10:30:00Z' },
  { id: '8', action: 'UPDATE', entityType: 'permission', entityId: '3', entityName: 'Hiring Manager', userId: '1', userName: 'Sarah Johnson', changes: [{ field: 'offers.edit', oldValue: 'false', newValue: 'true' }], timestamp: '2024-03-01T15:00:00Z' },
];

export const mockTeams: Team[] = [
  { id: '1', name: 'Engineering', leadRoleId: '3', memberRoleIds: ['2', '5'] },
  { id: '2', name: 'Sales', leadRoleId: '3', memberRoleIds: ['2', '5'] },
  { id: '3', name: 'Marketing', leadRoleId: '3', memberRoleIds: ['4', '5'] },
  { id: '4', name: 'Operations', leadRoleId: '1', memberRoleIds: ['4', '5'] },
];

export const mockMetrics: RoleMetrics = {
  totalRoles: 6,
  activeRoles: 5,
  inactiveRoles: 1,
  totalUsers: 12,
  permissionGaps: 3,
};

export const roleHierarchyData = [
  { id: '1', name: 'Administrator', parentId: null, level: 0 },
  { id: '2', name: 'TAP', parentId: '1', level: 1 },
  { id: '3', name: 'Hiring Manager', parentId: '1', level: 1 },
  { id: '4', name: 'HR Assistant', parentId: '1', level: 1 },
  { id: '5', name: 'Interviewer', parentId: '2', level: 2 },
  { id: '5', name: 'Interviewer', parentId: '3', level: 2 },
  { id: '6', name: 'Department Head', parentId: '1', level: 1 },
];

export const chartData = [
  { name: 'Admin', users: 3, fill: '#ef4444' },
  { name: 'TAP', users: 12, fill: '#3b82f6' },
  { name: 'Hiring Manager', users: 8, fill: '#22c55e' },
  { name: 'HR Assistant', users: 5, fill: '#eab308' },
  { name: 'Interviewer', users: 15, fill: '#a855f7' },
];
