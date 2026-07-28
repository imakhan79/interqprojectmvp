import { useState, useMemo } from "react";
import { mockCompanies } from "@/data/adminModuleData";
import { Company, CompanyStatus, SubscriptionPlan, INDUSTRIES, SUBSCRIPTION_PLANS } from "@/types/adminModule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, Filter, Building2, Users, Briefcase, Mail, Phone, Globe, MapPin, Clock,
  MoreHorizontal, Edit, Trash2, Ban, CheckCircle, Eye, ArrowUpDown, ChevronLeft, ChevronRight,
  X, Calendar, User, BriefcaseIcon, TrendingUp, AlertCircle, CheckCircle2
} from "lucide-react";

type SortField = 'name' | 'industry' | 'createdAt' | 'jobCount' | 'candidateCount';
type SortDirection = 'asc' | 'desc';

const statusConfig: Record<CompanyStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-green-600', bgColor: 'bg-green-500/10 border-green-500/20' },
  inactive: { label: 'Inactive', color: 'text-gray-600', bgColor: 'bg-gray-500/10 border-gray-500/20' },
  suspended: { label: 'Suspended', color: 'text-red-600', bgColor: 'bg-red-500/10 border-red-500/20' },
  trial: { label: 'Trial', color: 'text-yellow-600', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
};

const planColors: Record<SubscriptionPlan, string> = {
  basic: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  professional: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  enterprise: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

interface CompanyFormData {
  name: string;
  industry: string;
  size: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  timezone: string;
  subscriptionPlan: SubscriptionPlan;
  status: CompanyStatus;
}

const initialFormData: CompanyFormData = {
  name: '',
  industry: '',
  size: '',
  contactPerson: '',
  contactEmail: '',
  phone: '',
  website: '',
  address: '',
  country: '',
  timezone: '',
  subscriptionPlan: 'basic',
  status: 'trial',
};

const companySizes = ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000-5000', '5000+'];
const timezones = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'];

export default function CompanyManagementNew() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);

  const itemsPerPage = 10;

  const filteredCompanies = useMemo(() => {
    let filtered = [...mockCompanies];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.contactEmail.toLowerCase().includes(query) ||
        c.contactPerson.toLowerCase().includes(query) ||
        c.industry.toLowerCase().includes(query)
      );
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(c => c.industry === industryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(c => c.subscriptionPlan === planFilter);
    }

    filtered.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'industry':
          aVal = a.industry.toLowerCase();
          bVal = b.industry.toLowerCase();
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'jobCount':
          aVal = a.jobCount;
          bVal = b.jobCount;
          break;
        case 'candidateCount':
          aVal = a.candidateCount;
          bVal = b.candidateCount;
          break;
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [searchQuery, industryFilter, statusFilter, planFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      size: company.size,
      contactPerson: company.contactPerson,
      contactEmail: company.contactEmail,
      phone: company.phone,
      website: company.website,
      address: company.address,
      country: company.country,
      timezone: company.timezone,
      subscriptionPlan: company.subscriptionPlan,
      status: company.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleOpenDetails = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleStatus = (company: Company) => {
    const newStatus = company.status === 'suspended' || company.status === 'inactive' ? 'active' : 'suspended';
    console.log(`Toggle status for ${company.name} to ${newStatus}`);
  };

  const handleSubmit = (type: 'create' | 'edit') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
    }, 1000);
  };

  const handleDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
    }, 1000);
  };

  const clearFilters = () => {
    setIndustryFilter('all');
    setStatusFilter('all');
    setPlanFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = industryFilter !== 'all' || statusFilter !== 'all' || planFilter !== 'all' || searchQuery;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all registered companies
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search companies, contacts, or industries..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('table')}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
                  </svg>
                </Button>
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('cards')}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'table' ? (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[300px]">
                        <Button variant="ghost" className="gap-1 p-0 hover:bg-transparent" onClick={() => handleSort('name')}>
                          Company
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="gap-1 p-0 hover:bg-transparent" onClick={() => handleSort('industry')}>
                          Industry
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>
                        <Button variant="ghost" className="gap-1 p-0 hover:bg-transparent" onClick={() => handleSort('jobCount')}>
                          Jobs
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="gap-1 p-0 hover:bg-transparent" onClick={() => handleSort('candidateCount')}>
                          Candidates
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : paginatedCompanies.length > 0 ? (
                      paginatedCompanies.map((company) => (
                        <TableRow key={company.id} className="group hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage src={company.logo} alt={company.name} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getInitials(company.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleOpenDetails(company)}>
                                  {company.name}
                                </div>
                                <div className="text-xs text-muted-foreground">{company.size} employees</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {company.industry}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{company.contactPerson}</div>
                              <div className="text-muted-foreground">{company.contactEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              {company.jobCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              {company.candidateCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize ${planColors[company.subscriptionPlan]} border`}>
                              {company.subscriptionPlan}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize ${statusConfig[company.status].bgColor} border`}>
                              <span className={`mr-1 ${statusConfig[company.status].color}`}>
                                {company.status === 'active' && <CheckCircle className="h-3 w-3" />}
                                {company.status === 'suspended' && <Ban className="h-3 w-3" />}
                                {company.status === 'inactive' && <Clock className="h-3 w-3" />}
                                {company.status === 'trial' && <AlertCircle className="h-3 w-3" />}
                              </span>
                              {statusConfig[company.status].label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDetails(company)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(company)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleOpenDelete(company)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-lg font-medium mb-1">No companies found</p>
                          <p className="text-sm text-muted-foreground">
                            {hasActiveFilters ? 'Try adjusting your filters or search query' : 'Get started by adding your first company'}
                          </p>
                          {hasActiveFilters && (
                            <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                              Clear Filters
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {!isLoading && filteredCompanies.length > 0 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : paginatedCompanies.length > 0 ? (
                paginatedCompanies.map((company) => (
                  <Card key={company.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group" onClick={() => handleOpenDetails(company)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 border-2 group-hover:border-primary transition-colors">
                            <AvatarImage src={company.logo} alt={company.name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {getInitials(company.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
                              {company.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <Building2 className="h-3 w-3" />
                              {company.industry}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${statusConfig[company.status].bgColor} border`}>
                          <span className={`mr-1 ${statusConfig[company.status].color}`}>
                            {company.status === 'active' && <CheckCircle className="h-3 w-3" />}
                            {company.status === 'suspended' && <Ban className="h-3 w-3" />}
                            {company.status === 'inactive' && <Clock className="h-3 w-3" />}
                            {company.status === 'trial' && <AlertCircle className="h-3 w-3" />}
                          </span>
                          {statusConfig[company.status].label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{company.candidateCount}</span>
                          <span className="text-muted-foreground">Candidates</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{company.jobCount}</span>
                          <span className="text-muted-foreground">Jobs</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {company.contactEmail}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {company.contactPerson}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {company.country}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className={`capitalize ${planColors[company.subscriptionPlan]} border`}>
                          {company.subscriptionPlan}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenEdit(company); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleOpenDelete(company); }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium mb-1">No companies found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasActiveFilters ? 'Try adjusting your filters or search query' : 'Get started by adding your first company'}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                  ) : (
                    <Button onClick={handleOpenCreate}>Add Company</Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Create a new company profile. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData(prev => ({ ...prev, industry: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Company Size *</Label>
                    <Select value={formData.size} onValueChange={(v) => setFormData(prev => ({ ...prev, size: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                      <SelectContent>
                        {companySizes.map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} placeholder="https://example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Street address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={formData.country} onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))} placeholder="Country" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person *</Label>
                    <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))} placeholder="Full name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))} placeholder="email@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+1 555-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(v) => setFormData(prev => ({ ...prev, timezone: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subscriptionPlan">Subscription Plan *</Label>
                    <Select value={formData.subscriptionPlan} onValueChange={(v: SubscriptionPlan) => setFormData(prev => ({ ...prev, subscriptionPlan: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - $99/mo</SelectItem>
                        <SelectItem value="professional">Professional - $299/mo</SelectItem>
                        <SelectItem value="enterprise">Enterprise - $799/mo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(v: CompanyStatus) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit('create')} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information for {selectedCompany?.name}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Company Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Company Name *</Label>
                    <Input id="edit-name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(v) => setFormData(prev => ({ ...prev, industry: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-size">Company Size *</Label>
                    <Select value={formData.size} onValueChange={(v) => setFormData(prev => ({ ...prev, size: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {companySizes.map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-website">Website</Label>
                    <Input id="edit-website" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input id="edit-address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-country">Country</Label>
                    <Input id="edit-country" value={formData.country} onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-contactPerson">Contact Person *</Label>
                    <Input id="edit-contactPerson" value={formData.contactPerson} onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-contactEmail">Email Address *</Label>
                    <Input id="edit-contactEmail" type="email" value={formData.contactEmail} onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(v) => setFormData(prev => ({ ...prev, timezone: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-subscriptionPlan">Subscription Plan *</Label>
                    <Select value={formData.subscriptionPlan} onValueChange={(v: SubscriptionPlan) => setFormData(prev => ({ ...prev, subscriptionPlan: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic - $99/mo</SelectItem>
                        <SelectItem value="professional">Professional - $299/mo</SelectItem>
                        <SelectItem value="enterprise">Enterprise - $799/mo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status *</Label>
                    <Select value={formData.status} onValueChange={(v: CompanyStatus) => setFormData(prev => ({ ...prev, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit('edit')} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedCompany && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2">
                    <AvatarImage src={selectedCompany.logo} alt={selectedCompany.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {getInitials(selectedCompany.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedCompany.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" />
                      {selectedCompany.industry} · {selectedCompany.size} employees
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`${statusConfig[selectedCompany.status].bgColor} border`}>
                        <span className={`mr-1 ${statusConfig[selectedCompany.status].color}`}>
                          {selectedCompany.status === 'active' && <CheckCircle className="h-3 w-3" />}
                          {selectedCompany.status === 'suspended' && <Ban className="h-3 w-3" />}
                          {selectedCompany.status === 'inactive' && <Clock className="h-3 w-3" />}
                          {selectedCompany.status === 'trial' && <AlertCircle className="h-3 w-3" />}
                        </span>
                        {statusConfig[selectedCompany.status].label}
                      </Badge>
                      <Badge variant="outline" className={`capitalize ${planColors[selectedCompany.subscriptionPlan]} border`}>
                        {selectedCompany.subscriptionPlan} Plan
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="overview" className="flex-1 overflow-hidden">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="subscription">Subscription</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Jobs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            {selectedCompany.jobCount}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Candidates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            {selectedCompany.candidateCount}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">TAPs</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            {selectedCompany.recruiterCount}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Member Since</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            {new Date(selectedCompany.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">{selectedCompany.contactPerson}</div>
                            <div className="text-sm text-muted-foreground">Contact Person</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">{selectedCompany.contactEmail}</div>
                            <div className="text-sm text-muted-foreground">Email Address</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">{selectedCompany.phone || 'Not provided'}</div>
                            <div className="text-sm text-muted-foreground">Phone Number</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">{selectedCompany.website || 'Not provided'}</div>
                            <div className="text-sm text-muted-foreground">Website</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Location</h4>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="font-medium">{selectedCompany.address || 'Not provided'}</div>
                          <div className="text-sm text-muted-foreground">{selectedCompany.country} · {selectedCompany.timezone}</div>
                        </div>
                      </div>
                    </div>

                    {selectedCompany.trialEndsAt && (
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium text-yellow-600">Trial Period</div>
                          <div className="text-sm">Trial ends on {new Date(selectedCompany.trialEndsAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="subscription" className="mt-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Current Plan
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border">
                          <div>
                            <div className="text-2xl font-bold capitalize">{selectedCompany.subscriptionPlan} Plan</div>
                            <div className="text-sm text-muted-foreground">
                              ${SUBSCRIPTION_PLANS[selectedCompany.subscriptionPlan].price}/month
                            </div>
                          </div>
                          <Badge variant="outline" className={`capitalize ${planColors[selectedCompany.subscriptionPlan]} border text-base px-4 py-1`}>
                            Active
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Plan Features</h4>
                          <ul className="space-y-2">
                            {SUBSCRIPTION_PLANS[selectedCompany.subscriptionPlan].features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0">
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <div className="space-y-2 text-sm">
  <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
    <span className="text-muted-foreground text-xs w-24">Mar 23 10:41</span>
    <span>Company profile updated</span>
  </div>
  <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
    <span className="text-muted-foreground text-xs w-24">Mar 22 09:15</span>
    <span>New job posted: Senior Engineer</span>
  </div>
  <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
    <span className="text-muted-foreground text-xs w-24">Mar 21 14:30</span>
    <span>TAP added: Emily Davis</span>
  </div>
</div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
                <Button variant="destructive" onClick={() => { setIsDetailsDialogOpen(false); handleToggleStatus(selectedCompany); }}>
                  {selectedCompany.status === 'suspended' || selectedCompany.status === 'inactive' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </>
                  )}
                </Button>
                <Button onClick={() => { setIsDetailsDialogOpen(false); handleOpenEdit(selectedCompany); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedCompany?.name}</span>? 
              This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="text-sm">
              <div className="font-medium text-destructive">Warning</div>
              <div className="text-muted-foreground">This will permanently delete {selectedCompany?.jobCount} jobs and {selectedCompany?.candidateCount} candidates.</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
