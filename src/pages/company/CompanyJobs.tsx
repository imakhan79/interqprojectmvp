import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  Copy,
  Filter,
} from "lucide-react";
import { mockJobs } from "@/data/adminModuleData";

export default function CompanyJobs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-700",
    closed: "bg-red-100 text-red-700",
    draft: "bg-gray-100 text-gray-700",
    paused: "bg-amber-100 text-amber-700",
  };

  const stats = {
    total: mockJobs.length,
    open: mockJobs.filter((j) => j.status === "open").length,
    totalApplicants: mockJobs.reduce((sum, j) => sum + (j.applications || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-500">Post and manage your job listings</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Positions</p>
                <p className="text-2xl font-bold text-green-600">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applicants</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalApplicants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg per Job</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(stats.totalApplicants / stats.total)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Job Postings</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary Range</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.companyName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{job.department}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4" />
                    {(job.salaryMin / 1000).toFixed(0)}k - {(job.salaryMax / 1000).toFixed(0)}k
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="font-medium">{job.applications ?? 0}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{job.workplaceType.replace("_", "-")}</span>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[job.status] || "bg-gray-100 text-gray-700"}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ title: "Edit", description: "Edit form would open here." })}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="w-4 h-4 mr-2" />
                        View Applicants
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => toast({ title: "Deleted", description: "Item removed successfully." })}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create Job Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Bulk Import Jobs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">New applications today</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Views this week</span>
                <span className="font-semibold">245</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Saved jobs</span>
                <span className="font-semibold">38</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Jobs with salary ranges get 30% more applications</p>
              <p>Keep job descriptions under 700 words</p>
              <p>Respond to applicants within 48 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
