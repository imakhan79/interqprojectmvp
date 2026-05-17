import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assessment {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: number;
  duration: number;
  isPublished: boolean;
  passingScore: number;
  attempts: number;
  createdAt: string;
  description: string;
}

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: "1", title: "JavaScript Fundamentals", category: "Programming", difficulty: "Easy", questions: 25, duration: 30, isPublished: true, passingScore: 70, attempts: 142, createdAt: "2024-01-10", description: "Basic JavaScript concepts including variables, functions, and DOM manipulation." },
  { id: "2", title: "React Advanced Patterns", category: "Frontend", difficulty: "Hard", questions: 30, duration: 60, isPublished: true, passingScore: 75, attempts: 89, createdAt: "2024-01-20", description: "Advanced React patterns including hooks, context, and performance optimization." },
  { id: "3", title: "Python Data Structures", category: "Programming", difficulty: "Medium", questions: 20, duration: 45, isPublished: true, passingScore: 65, attempts: 234, createdAt: "2024-02-01", description: "Python lists, dictionaries, sets, and algorithm complexity." },
  { id: "4", title: "SQL Database Design", category: "Database", difficulty: "Medium", questions: 15, duration: 30, isPublished: false, passingScore: 70, attempts: 0, createdAt: "2024-02-15", description: "Database normalization, query optimization and schema design." },
  { id: "5", title: "System Design Interview", category: "Architecture", difficulty: "Hard", questions: 10, duration: 90, isPublished: true, passingScore: 80, attempts: 56, createdAt: "2024-02-20", description: "Design scalable distributed systems and microservices architecture." },
  { id: "6", title: "DevOps & CI/CD", category: "DevOps", difficulty: "Medium", questions: 20, duration: 40, isPublished: true, passingScore: 70, attempts: 78, createdAt: "2024-03-01", description: "Docker, Kubernetes, Jenkins pipelines and deployment strategies." },
  { id: "7", title: "AWS Cloud Practitioner", category: "Cloud", difficulty: "Easy", questions: 30, duration: 45, isPublished: false, passingScore: 72, attempts: 0, createdAt: "2024-03-05", description: "AWS core services, security, and billing fundamentals." },
  { id: "8", title: "Behavioral Interview Assessment", category: "Soft Skills", difficulty: "Easy", questions: 15, duration: 20, isPublished: true, passingScore: 60, attempts: 312, createdAt: "2024-03-10", description: "Situational and behavioral questions for cultural fit evaluation." },
];

const DIFFICULTY_CONFIG = {
  Easy: { color: "bg-green-500/10 text-green-600 border-green-500/30" },
  Medium: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
  Hard: { color: "bg-red-500/10 text-red-600 border-red-500/30" },
};

const CATEGORIES = ["Programming", "Frontend", "Database", "Architecture", "DevOps", "Cloud", "Soft Skills"];

export default function TestManagement() {
  const [assessments, setAssessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Assessment | null>(null);
  const [viewingTest, setViewingTest] = useState<Assessment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newTest, setNewTest] = useState({
    title: "", category: "Programming", difficulty: "Medium" as Assessment["difficulty"],
    questions: 20, duration: 30, passingScore: 70, description: ""
  });

  const filtered = assessments.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || a.category === categoryFilter;
    const matchDiff = difficultyFilter === "all" || a.difficulty === difficultyFilter;
    const matchPub = publishFilter === "all" ||
      (publishFilter === "published" && a.isPublished) ||
      (publishFilter === "draft" && !a.isPublished);
    return matchSearch && matchCat && matchDiff && matchPub;
  });

  const handleCreate = () => {
    if (!newTest.title) return;
    const test: Assessment = {
      id: String(assessments.length + 1),
      ...newTest,
      isPublished: false,
      attempts: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAssessments([test, ...assessments]);
    setNewTest({ title: "", category: "Programming", difficulty: "Medium", questions: 20, duration: 30, passingScore: 70, description: "" });
    setIsCreateOpen(false);
  };

  const handleSaveEdit = () => {
    if (!editingTest) return;
    setAssessments(assessments.map(a => a.id === editingTest.id ? editingTest : a));
    setIsEditOpen(false);
    setEditingTest(null);
  };

  const handleTogglePublish = (id: string) => {
    setAssessments(assessments.map(a => a.id === id ? { ...a, isPublished: !a.isPublished } : a));
  };

  const handleDelete = (id: string) => {
    setAssessments(assessments.filter(a => a.id !== id));
    setDeleteId(null);
  };

  const stats = {
    total: assessments.length,
    published: assessments.filter(a => a.isPublished).length,
    totalAttempts: assessments.reduce((sum, a) => sum + a.attempts, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Test Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} tests found</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tests..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={publishFilter} onValueChange={setPublishFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Pass Score</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((test) => (
                <TableRow key={test.id} className="group">
                  <TableCell className="font-medium max-w-[180px] truncate">{test.title}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{test.category}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", DIFFICULTY_CONFIG[test.difficulty].color)}>
                      {test.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{test.questions}</TableCell>
                  <TableCell className="text-sm">{test.duration}m</TableCell>
                  <TableCell className="text-sm">{test.passingScore}%</TableCell>
                  <TableCell className="text-sm">{test.attempts}</TableCell>
                  <TableCell>
                    <Badge
                      variant={test.isPublished ? "default" : "outline"}
                      className="text-xs cursor-pointer"
                      onClick={() => handleTogglePublish(test.id)}
                    >
                      {test.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setViewingTest(test); setIsViewOpen(true); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setEditingTest({ ...test }); setIsEditOpen(true); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(test.id)}>
                          {test.isPublished ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                          {test.isPublished ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(test.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium">No tests found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Create New Test</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. JavaScript Fundamentals" value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe what this test covers..." value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newTest.category} onValueChange={(v) => setNewTest({ ...newTest, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={newTest.difficulty} onValueChange={(v) => setNewTest({ ...newTest, difficulty: v as Assessment["difficulty"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Questions</Label>
                <Input type="number" value={newTest.questions} onChange={(e) => setNewTest({ ...newTest, questions: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input type="number" value={newTest.duration} onChange={(e) => setNewTest({ ...newTest, duration: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={newTest.passingScore} onChange={(e) => setNewTest({ ...newTest, passingScore: Number(e.target.value) })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Edit Test</DialogTitle></DialogHeader>
          {editingTest && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={editingTest.title} onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editingTest.category} onValueChange={(v) => setEditingTest({ ...editingTest, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={editingTest.difficulty} onValueChange={(v) => setEditingTest({ ...editingTest, difficulty: v as Assessment["difficulty"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Input type="number" value={editingTest.questions} onChange={(e) => setEditingTest({ ...editingTest, questions: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" value={editingTest.duration} onChange={(e) => setEditingTest({ ...editingTest, duration: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input type="number" value={editingTest.passingScore} onChange={(e) => setEditingTest({ ...editingTest, passingScore: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Test Details</DialogTitle></DialogHeader>
          {viewingTest && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{viewingTest.title}</h2>
                <Badge variant={viewingTest.isPublished ? "default" : "outline"}>
                  {viewingTest.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              {viewingTest.description && <p className="text-sm text-muted-foreground">{viewingTest.description}</p>}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Category</p><p className="font-medium">{viewingTest.category}</p></div>
                <div><p className="text-muted-foreground text-xs">Difficulty</p><p className="font-medium">{viewingTest.difficulty}</p></div>
                <div><p className="text-muted-foreground text-xs">Questions</p><p className="font-medium">{viewingTest.questions}</p></div>
                <div><p className="text-muted-foreground text-xs">Duration</p><p className="font-medium">{viewingTest.duration} minutes</p></div>
                <div><p className="text-muted-foreground text-xs">Passing Score</p><p className="font-medium">{viewingTest.passingScore}%</p></div>
                <div><p className="text-muted-foreground text-xs">Total Attempts</p><p className="font-medium">{viewingTest.attempts}</p></div>
                <div><p className="text-muted-foreground text-xs">Created</p><p className="font-medium">{new Date(viewingTest.createdAt).toLocaleDateString()}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Delete Test?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            This will permanently delete the test and all associated data. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
