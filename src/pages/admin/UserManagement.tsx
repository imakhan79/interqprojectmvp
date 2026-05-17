import { useState, useMemo } from 'react';
import { 
  Search, Filter, MoreHorizontal, UserPlus, Download, 
  Edit2, UserX, Key, Mail, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  UserCog, Building2, Shield, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious
} from '@/components/ui/pagination';
import { mockUsers, mockCompanies } from '@/data/adminModuleData';
import { User, UserStatus } from '@/types/adminModule';
import { cn } from '@/lib/utils';

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Admin': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30' },
  'Company Admin': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  'Recruiter': { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/30' },
  'Hiring Manager': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/30' },
  'Interviewer': { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
  'HR Executive': { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/30' },
  'Department Head': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30' },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: <CheckCircle2 className="h-3 w-3" /> },
  inactive: { label: 'Inactive', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: <XCircle className="h-3 w-3" /> },
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: <AlertCircle className="h-3 w-3" /> },
  suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: <UserX className="h-3 w-3" /> },
};

const ROLES = ['Admin', 'Company Admin', 'Recruiter', 'Hiring Manager', 'Interviewer', 'HR Executive', 'Department Head'];
const DEPARTMENTS = ['IT', 'HR', 'Engineering', 'Finance', 'Admin', 'Sales', 'Marketing', 'Operations', 'Product', 'Design'];
const ITEMS_PER_PAGE = 10;

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    department: 'all',
    company: 'all',
    status: 'all',
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [bulkAction, setBulkAction] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    companyId: '',
    companyName: '',
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filters.role === 'all' || user.role === filters.role;
      const matchesDepartment = filters.department === 'all' || user.department === filters.department;
      const matchesCompany = filters.company === 'all' || user.companyId === filters.company;
      const matchesStatus = filters.status === 'all' || user.status === filters.status;
      return matchesSearch && matchesRole && matchesDepartment && matchesCompany && matchesStatus;
    });
  }, [users, searchQuery, filters]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    switch (bulkAction) {
      case 'activate':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, status: 'active' as UserStatus } : u
        ));
        break;
      case 'deactivate':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, status: 'inactive' as UserStatus } : u
        ));
        break;
      case 'suspend':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, status: 'suspended' as UserStatus } : u
        ));
        break;
      case 'export': {
        const csvContent = [
          ['Name', 'Email', 'Role', 'Department', 'Company', 'Status'].join(','),
          ...filteredUsers.filter(u => selectedUsers.includes(u.id)).map(u => 
            [u.name, u.email, u.role, u.department, u.companyName, u.status].join(',')
          )
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        a.click();
        break;
      }
    }
    setBulkAction('');
    setSelectedUsers([]);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const company = mockCompanies.find(c => c.id === newUser.companyId);
    const user: User = {
      id: String(users.length + 1),
      ...newUser,
      companyName: company?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', phone: '', role: '', department: '', companyId: '', companyName: '' });
    setIsAddUserOpen(false);
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditUserOpen(false);
    setEditingUser(null);
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'suspended' as UserStatus } : u
    ));
  };

  const handleResetPassword = (userId: string) => {
    console.log('Reset password for user:', userId);
  };

  const handleSendInvitation = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'active' as UserStatus } : u
    ));
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsEditUserOpen(true);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions across all companies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account and send them an invitation email.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="john@company.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      placeholder="+1 555-0000"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={newUser.department} onValueChange={(v) => setNewUser({ ...newUser, department: v })}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Select value={newUser.companyId} onValueChange={(v) => setNewUser({ ...newUser, companyId: v })}>
                      <SelectTrigger id="company">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px] max-w-[320px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filters.role} onValueChange={(v) => setFilters({ ...filters, role: v })}>
                  <SelectTrigger className="w-[160px]">
                    <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.department} onValueChange={(v) => setFilters({ ...filters, department: v })}>
                  <SelectTrigger className="w-[160px]">
                    <UserCog className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.company} onValueChange={(v) => setFilters({ ...filters, company: v })}>
                  <SelectTrigger className="w-[180px]">
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {mockCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedUsers.length} selected
                </span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="deactivate">Deactivate</SelectItem>
                    <SelectItem value="suspend">Suspend</SelectItem>
                    <SelectItem value="export">Export CSV</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="secondary" size="sm" onClick={handleBulkAction}>
                  Apply
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium">No users found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS['Recruiter'];
                  const statusConfig = STATUS_CONFIG[user.status];
                  return (
                    <TableRow 
                      key={user.id}
                      className={cn(
                        "group transition-colors",
                        selectedUsers.includes(user.id) && "bg-muted/50"
                      )}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-border/50">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className={cn("text-xs font-medium", roleStyle.text)}>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "font-medium text-xs px-2 py-0.5 border",
                            roleStyle.bg, roleStyle.text, roleStyle.border
                          )}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{user.department}</TableCell>
                      <TableCell className="text-sm">{user.companyName}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs gap-1.5 font-medium", statusConfig.color)}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(user.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                              <Key className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            {user.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleSendInvitation(user.id)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Invitation
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {filteredUsers.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} results
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink 
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                      onClick={() => setCurrentPage(1)}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious 
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((page, idx) => (
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink 
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16 border-2 border-border/50">
                  <AvatarImage src={editingUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {getInitials(editingUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{editingUser.name}</p>
                  <p className="text-sm text-muted-foreground">{editingUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={editingUser.role} onValueChange={(v) => setEditingUser({ ...editingUser, role: v })}>
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select value={editingUser.department} onValueChange={(v) => setEditingUser({ ...editingUser, department: v })}>
                    <SelectTrigger id="edit-department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingUser.status} onValueChange={(v) => setEditingUser({ ...editingUser, status: v as UserStatus })}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Select value={editingUser.companyId} onValueChange={(v) => {
                    const company = mockCompanies.find(c => c.id === v);
                    setEditingUser({ ...editingUser, companyId: v, companyName: company?.name || '' });
                  }}>
                    <SelectTrigger id="edit-company">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCompanies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Created on {formatDate(editingUser.createdAt)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
