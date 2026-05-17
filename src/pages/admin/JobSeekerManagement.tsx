import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Search, GraduationCap, MoreHorizontal, Eye, UserCheck,
  UserX, Filter, Users, Briefcase, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface JobSeeker {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  status: "active" | "inactive" | "hired" | "seeking";
  appliedJobs: number;
  rating: number;
  joinedDate: string;
}

const MOCK_SEEKERS: JobSeeker[] = [
  { id: "1", name: "Alex Thompson", email: "alex.t@email.com", phone: "+1 555-5001", location: "New York, NY", skills: ["React", "TypeScript", "Node.js"], experience: "5 years", education: "BSc Computer Science", status: "seeking", appliedJobs: 8, rating: 4.5, joinedDate: "2024-01-10" },
  { id: "2", name: "Maria Garcia", email: "maria.g@email.com", phone: "+1 555-5002", location: "Los Angeles, CA", skills: ["Python", "Django", "PostgreSQL"], experience: "3 years", education: "MSc Software Engineering", status: "seeking", appliedJobs: 5, rating: 4.2, joinedDate: "2024-01-15" },
  { id: "3", name: "John Lee", email: "john.l@email.com", phone: "+1 555-5003", location: "Austin, TX", skills: ["Product Management", "Agile", "Figma"], experience: "7 years", education: "MBA", status: "hired", appliedJobs: 12, rating: 4.8, joinedDate: "2024-01-20" },
  { id: "4", name: "Sophie Chen", email: "sophie.c@email.com", phone: "+1 555-5004", location: "Seattle, WA", skills: ["Java", "Spring Boot", "AWS"], experience: "6 years", education: "BSc Computer Science", status: "active", appliedJobs: 4, rating: 4.9, joinedDate: "2024-02-01" },
  { id: "5", name: "Ryan Patel", email: "ryan.p@email.com", phone: "+1 555-5005", location: "Chicago, IL", skills: ["DevOps", "Kubernetes", "Docker"], experience: "4 years", education: "BSc Information Technology", status: "seeking", appliedJobs: 6, rating: 3.8, joinedDate: "2024-02-10" },
  { id: "6", name: "Emma Wilson", email: "emma.w@email.com", phone: "+1 555-5006", location: "Boston, MA", skills: ["Finance", "Excel", "SAP"], experience: "8 years", education: "CFA", status: "hired", appliedJobs: 3, rating: 4.6, joinedDate: "2024-02-15" },
  { id: "7", name: "David Kim", email: "david.k@email.com", phone: "+1 555-5007", location: "San Francisco, CA", skills: ["UI/UX", "Figma", "Adobe XD"], experience: "4 years", education: "BFA Design", status: "seeking", appliedJobs: 9, rating: 4.3, joinedDate: "2024-02-20" },
  { id: "8", name: "Anna Brown", email: "anna.b@email.com", phone: "+1 555-5008", location: "Denver, CO", skills: ["Marketing", "SEO", "Google Analytics"], experience: "5 years", education: "BSc Marketing", status: "inactive", appliedJobs: 2, rating: 3.5, joinedDate: "2024-03-01" },
  { id: "9", name: "James Wilson", email: "james.w@email.com", phone: "+1 555-5009", location: "Miami, FL", skills: ["Sales", "CRM", "Salesforce"], experience: "6 years", education: "BSc Business Administration", status: "active", appliedJobs: 7, rating: 4.1, joinedDate: "2024-03-05" },
  { id: "10", name: "Lisa Martinez", email: "lisa.m@email.com", phone: "+1 555-5010", location: "Phoenix, AZ", skills: ["Data Science", "Python", "TensorFlow"], experience: "3 years", education: "MSc Data Science", status: "seeking", appliedJobs: 11, rating: 4.7, joinedDate: "2024-03-10" },
];

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  seeking: { label: "Job Seeking", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  hired: { label: "Hired", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-600 border-gray-500/30" },
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function JobSeekerManagement() {
  const [seekers, setSeekers] = useState<JobSeeker[]>(MOCK_SEEKERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewSeeker, setViewSeeker] = useState<JobSeeker | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filtered = seekers.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase())) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id: string, status: JobSeeker["status"]) => {
    setSeekers(seekers.map(s => s.id === id ? { ...s, status } : s));
  };

  const stats = {
    total: seekers.length,
    seeking: seekers.filter(s => s.status === "seeking").length,
    hired: seekers.filter(s => s.status === "hired").length,
    active: seekers.filter(s => s.status === "active").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Job Seeker Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} of {seekers.length} job seekers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Job Seeking</p>
                <p className="text-2xl font-bold">{stats.seeking}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hired</p>
                <p className="text-2xl font-bold">{stats.hired}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-400 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, skills, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="seeking">Job Seeking</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Seeker</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((seeker) => {
                const statusCfg = STATUS_CONFIG[seeker.status];
                return (
                  <TableRow key={seeker.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                            {getInitials(seeker.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{seeker.name}</p>
                          <p className="text-xs text-muted-foreground">{seeker.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{seeker.location}</TableCell>
                    <TableCell className="text-sm">{seeker.experience}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {seeker.skills.slice(0, 2).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {seeker.skills.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{seeker.skills.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><StarRating rating={seeker.rating} /></TableCell>
                    <TableCell className="text-sm">{seeker.appliedJobs} jobs</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", statusCfg.color)}>
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setViewSeeker(seeker); setIsViewOpen(true); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(seeker.id, "active")}>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Mark Active
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(seeker.id, "hired")}>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Mark Hired
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleStatusChange(seeker.id, "inactive")}>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium">No job seekers found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Profile Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Job Seeker Profile</DialogTitle>
          </DialogHeader>
          {viewSeeker && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16 border-2 border-border/50">
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {getInitials(viewSeeker.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{viewSeeker.name}</p>
                  <p className="text-sm text-muted-foreground">{viewSeeker.location}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn("text-xs", STATUS_CONFIG[viewSeeker.status].color)}>
                      {STATUS_CONFIG[viewSeeker.status].label}
                    </Badge>
                    <StarRating rating={viewSeeker.rating} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{viewSeeker.email}</p></div>
                <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{viewSeeker.phone}</p></div>
                <div><p className="text-muted-foreground text-xs">Experience</p><p className="font-medium">{viewSeeker.experience}</p></div>
                <div><p className="text-muted-foreground text-xs">Education</p><p className="font-medium">{viewSeeker.education}</p></div>
                <div><p className="text-muted-foreground text-xs">Applied Jobs</p><p className="font-medium">{viewSeeker.appliedJobs}</p></div>
                <div><p className="text-muted-foreground text-xs">Joined</p><p className="font-medium">{new Date(viewSeeker.joinedDate).toLocaleDateString()}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {viewSeeker.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
