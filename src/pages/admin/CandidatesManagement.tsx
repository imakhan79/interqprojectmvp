import { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserPlus,
  FileText,
  XCircle,
  Ban,
  Mail,
  Download,
  ChevronDown,
  Star,
  Calendar,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Candidate, CandidateStage, SOURCES, PIPELINE_STAGES, UserStatus } from "@/types/adminModule";
import { mockCandidates, mockUsers, mockCompanies } from "@/data/adminModuleData";

const ITEMS_PER_PAGE = 10;

const stageConfig: Record<CandidateStage, { label: string; color: string; bgColor: string }> = {
  applied: { label: "Applied", color: "#3b82f6", bgColor: "bg-blue-100 text-blue-800" },
  screening: { label: "Screening", color: "#8b5cf6", bgColor: "bg-purple-100 text-purple-800" },
  shortlisted: { label: "Shortlisted", color: "#06b6d4", bgColor: "bg-cyan-100 text-cyan-800" },
  interview_r1: { label: "Interview R1", color: "#f59e0b", bgColor: "bg-amber-100 text-amber-800" },
  interview_r2: { label: "Interview R2", color: "#f97316", bgColor: "bg-orange-100 text-orange-800" },
  technical: { label: "Technical", color: "#84cc16", bgColor: "bg-lime-100 text-lime-800" },
  hr_interview: { label: "HR Interview", color: "#ec4899", bgColor: "bg-pink-100 text-pink-800" },
  offer: { label: "Offer", color: "#22c55e", bgColor: "bg-green-100 text-green-800" },
  hired: { label: "Hired", color: "#10b981", bgColor: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", color: "#ef4444", bgColor: "bg-red-100 text-red-800" },
};

const statusConfig: Record<UserStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  suspended: { label: "Suspended", variant: "destructive" },
};

interface FilterState {
  companyId: string;
  stage: string;
  source: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export default function CandidatesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    companyId: "",
    stage: "",
    source: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isRecruiterDialogOpen, setIsRecruiterDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [newStage, setNewStage] = useState<CandidateStage | "">("");
  const [newRecruiterId, setNewRecruiterId] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const filteredCandidates = useMemo(() => {
    return mockCandidates.filter((candidate) => {
      const matchesSearch =
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.appliedRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCompany = !filters.companyId || candidate.companyId === filters.companyId;
      const matchesStage = !filters.stage || candidate.stage === filters.stage;
      const matchesSource = !filters.source || candidate.source === filters.source;
      const matchesStatus = !filters.status || candidate.status === filters.status;

      let matchesDate = true;
      if (filters.dateFrom) {
        matchesDate = matchesDate && new Date(candidate.appliedAt) >= new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        matchesDate = matchesDate && new Date(candidate.appliedAt) <= new Date(filters.dateTo);
      }

      return matchesSearch && matchesCompany && matchesStage && matchesSource && matchesStatus && matchesDate;
    });
  }, [searchTerm, filters]);

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(paginatedCandidates.map((c) => c.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setIsSelectAll(false);
  };

  const handleMoveStage = (candidate: Candidate, stage: CandidateStage) => {
    console.log(`Moving ${candidate.fullName} to ${stage}`);
    setIsStageDialogOpen(false);
    setSelectedCandidate(null);
  };

  const handleAssignRecruiter = (candidate: Candidate, recruiterId: string) => {
    console.log(`Assigning ${candidate.fullName} to recruiter ${recruiterId}`);
    setIsRecruiterDialogOpen(false);
    setSelectedCandidate(null);
  };

  const handleAddNote = (candidate: Candidate, note: string) => {
    console.log(`Adding note to ${candidate.fullName}: ${note}`);
    setIsNoteDialogOpen(false);
    setSelectedCandidate(null);
    setNoteContent("");
  };

  const handleReject = (candidate: Candidate) => {
    console.log(`Rejecting ${candidate.fullName}`);
  };

  const handleBlacklist = (candidate: Candidate) => {
    console.log(`Blacklisting ${candidate.fullName}`);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on ${selectedCandidates.length} candidates`);
  };

  const clearFilters = () => {
    setFilters({
      companyId: "",
      stage: "",
      source: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.companyId ||
    filters.stage ||
    filters.source ||
    filters.status ||
    filters.dateFrom ||
    filters.dateTo ||
    searchTerm;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderRating = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground">-</span>;
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getUniqueCompanies = () => {
    const companies = mockCandidates.map((c) => ({
      id: c.companyId,
      name: c.companyName,
    }));
    return companies.filter(
      (c, index, self) => index === self.findIndex((t) => t.id === c.id)
    );
  };

  const getUniqueRecruiters = () => {
    const recruiters = mockCandidates.map((c) => ({
      id: c.recruiterId,
      name: c.recruiterName,
    }));
    return recruiters.filter(
      (r, index, self) => index === self.findIndex((t) => t.id === r.id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Candidates Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredCandidates.length} candidates found
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, email, role, or company..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Select
              value={filters.companyId}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, companyId: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
                {getUniqueCompanies().map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.stage}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, stage: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Stages</SelectItem>
                {PIPELINE_STAGES.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id.replace(/ /g, "_").toLowerCase()}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.source}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, source: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                {SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, status: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              className="w-[150px]"
              value={filters.dateFrom}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
                setCurrentPage(1);
              }}
            />

            <Input
              type="date"
              className="w-[150px]"
              value={filters.dateTo}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, dateTo: e.target.value }));
                setCurrentPage(1);
              }}
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Stage Progression:</span>
              {PIPELINE_STAGES.slice(0, 8).map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${stage.color}20`,
                      color: stage.color,
                    }}
                  >
                    {stage.name}
                  </div>
                  {index < PIPELINE_STAGES.slice(0, 8).length - 1 && (
                    <ChevronDown className="h-3 w-3 text-muted-foreground mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedCandidates.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-primary/5 rounded-lg border">
              <span className="text-sm font-medium">
                {selectedCandidates.length} candidate(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setIsEmailDialogOpen(true)}
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ChevronDown className="h-4 w-4" />
                      Change Stage
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {PIPELINE_STAGES.map((stage) => (
                      <DropdownMenuItem
                        key={stage.id}
                        onClick={() => handleBulkAction(`change_stage_${stage.id}`)}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <UserPlus className="h-4 w-4" />
                      Assign TAP
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {mockUsers
                      .filter((u) => u.role === "TAP")
                      .map((user) => (
                        <DropdownMenuItem
                          key={user.id}
                          onClick={() => handleBulkAction(`assign_recruiter_${user.id}`)}
                        >
                          {user.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleBulkAction("export")}
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive"
                  onClick={() => handleBulkAction("reject")}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isSelectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>TAP</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCandidates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    No candidates found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={() => handleSelectCandidate(candidate.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{candidate.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {candidate.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.appliedRole}</TableCell>
                    <TableCell>{candidate.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{candidate.source}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={stageConfig[candidate.stage].bgColor}>
                        {stageConfig[candidate.stage].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderRating(candidate.rating)}</TableCell>
                    <TableCell>{candidate.recruiterName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(candidate.appliedAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Move Stage
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {PIPELINE_STAGES.map((stage) => (
                                <DropdownMenuItem
                                  key={stage.id}
                                  onClick={() => handleMoveStage(candidate, stage.id.replace(/ /g, "_").toLowerCase() as CandidateStage)}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full mr-2"
                                    style={{ backgroundColor: stage.color }}
                                  />
                                  {stage.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign TAP
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {mockUsers
                                .filter((u) => u.role === "TAP")
                                .map((user) => (
                                  <DropdownMenuItem
                                    key={user.id}
                                    onClick={() => handleAssignRecruiter(candidate, user.id)}
                                  >
                                    {user.name}
                                  </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCandidate(candidate);
                              setIsNoteDialogOpen(true);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Add Note
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleReject(candidate)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleBlacklist(candidate)}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Blacklist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredCandidates.length)} of{" "}
              {filteredCandidates.length} candidates
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note for {selectedCandidate?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                placeholder="Enter your note..."
                rows={4}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedCandidate && handleAddNote(selectedCandidate, noteContent)}
              disabled={!noteContent.trim()}
            >
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Send email to {selectedCandidates.length} selected candidate(s)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Enter your message..."
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEmailDialogOpen(false);
                setEmailSubject("");
                setEmailBody("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log(`Sending email to ${selectedCandidates.length} candidates: ${emailSubject}`);
                setIsEmailDialogOpen(false);
                setEmailSubject("");
                setEmailBody("");
              }}
              disabled={!emailSubject.trim() || !emailBody.trim()}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}