import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { Search, Briefcase, Building2, Calendar, Clock, CheckCircle, Star, FileText, Loader2 } from "lucide-react";

interface ApplicationRow {
  id: string;
  job_id: string | null;
  status: string;
  rating: number | null;
  created_at: string;
  jobs: { title: string; companies: { name: string } | null } | null;
}

const stageColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-indigo-100 text-indigo-700",
  interview: "bg-orange-100 text-orange-700",
  offer: "bg-emerald-100 text-emerald-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const stageLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function JobSeekerApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("candidates")
        .select("id, job_id, status, rating, created_at, jobs(title, companies(name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setApplications((data as any[]) || []);
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const filtered = applications.filter((a) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      (a.jobs?.title || "").toLowerCase().includes(term) ||
      (a.jobs?.companies?.name || "").toLowerCase().includes(term)
    );
  });

  const stats = {
    total: applications.length,
    active: applications.filter((a) => a.status !== "rejected" && a.status !== "hired").length,
    interviews: applications.filter((a) => a.status === "interview").length,
    offers: applications.filter((a) => a.status === "offer").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track your job applications and status</p>
        </div>
        <Button onClick={() => navigate("/jobseeker/jobs")}>
          <Briefcase className="w-4 h-4 mr-2" />
          Browse Jobs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="w-6 h-6 text-indigo-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <Clock className="w-6 h-6 text-blue-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Interviews</p>
              <p className="text-2xl font-bold text-purple-600">{stats.interviews}</p>
            </div>
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Offers</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.offers}</p>
            </div>
            <Star className="w-6 h-6 text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold">All Applications</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  {applications.length === 0
                    ? "No applications yet — browse the job board to get started."
                    : "No applications match your search."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <p className="font-medium">{app.jobs?.title || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{app.jobs?.companies?.name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={stageColors[app.status] || "bg-muted text-foreground"}>
                      {stageLabel(app.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.rating ? (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="ml-1">{app.rating}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
