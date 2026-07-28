import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Search, MoreHorizontal, Eye, Pencil, Copy, Trash2, Star, StarOff,
  FileText, CheckCircle2, Clock, Sparkles, BarChart3, Heart, Loader2, RotateCcw,
} from "lucide-react";
import type { Blog, BlogSortOption, BlogStats } from "@/types/blog";
import {
  listBlogsAdmin, getBlogStats, softDeleteBlog, restoreBlog, hardDeleteBlog,
  duplicateBlog, setBlogStatus, toggleFeatured, bulkSetStatus, bulkSoftDelete,
} from "@/services/blogService";
import { BlogEditor } from "@/components/admin/blog/BlogEditor";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  archived: "bg-amber-100 text-amber-800",
};

export default function BlogManagement() {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState<BlogSortOption>("newest");
  const [selected, setSelected] = useState<string[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out after 10s")), 10000)
      );
      const [list, s] = await Promise.race([
        Promise.all([
          listBlogsAdmin({ search, status: statusFilter as any, category: categoryFilter, sort }),
          getBlogStats(),
        ]),
        timeout,
      ]);
      setBlogs(list);
      setStats(s);
    } catch (err) {
      console.error("Blog load failed:", err);
      toast({ title: "Failed to load blogs", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter, categoryFilter, sort]);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const categories = useMemo(() => Array.from(new Set(blogs.map((b) => b.category).filter(Boolean))) as string[], [blogs]);
  const allSelected = blogs.length > 0 && selected.length === blogs.length;

  const toggleSelectAll = () => setSelected(allSelected ? [] : blogs.map((b) => b.id));
  const toggleSelect = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const runAction = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      toast({ title: successMsg });
      load();
    } catch (err) {
      toast({ title: "Action failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const statCards = stats ? [
    { label: "Total Blogs", value: stats.total, icon: FileText, color: "text-blue-600 bg-blue-500/10" },
    { label: "Published", value: stats.published, icon: CheckCircle2, color: "text-green-600 bg-green-500/10" },
    { label: "Drafts", value: stats.draft, icon: Pencil, color: "text-gray-600 bg-gray-500/10" },
    { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-amber-600 bg-amber-500/10" },
    { label: "Featured", value: stats.featured, icon: Sparkles, color: "text-purple-600 bg-purple-500/10" },
    { label: "Total Views", value: stats.totalViews, icon: BarChart3, color: "text-cyan-600 bg-cyan-500/10" },
    { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "text-rose-600 bg-rose-500/10" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
          <p className="text-muted-foreground mt-1">Create, publish, and manage blog posts</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => { setEditingBlog(null); setEditorOpen(true); }}>
          <Plus className="w-5 h-5" /> Create Blog
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", c.color)}>
                <c.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search blogs…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="trashed">Trash</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as BlogSortOption)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
              <span className="text-sm font-medium">{selected.length} selected</span>
              <Button size="sm" variant="outline" onClick={() => runAction(() => bulkSetStatus(selected, "published"), "Published selected")}>Publish Selected</Button>
              <Button size="sm" variant="outline" onClick={() => runAction(() => bulkSetStatus(selected, "draft"), "Moved to draft")}>Draft Selected</Button>
              <Button size="sm" variant="destructive" onClick={() => runAction(() => bulkSoftDelete(selected), "Deleted selected")}>Delete Selected</Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-2 w-8"><Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} /></th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Author</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Publish Date</th>
                  <th className="p-2">Views</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Updated</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
                ) : blogs.length === 0 ? (
                  <tr><td colSpan={11} className="p-8 text-center text-muted-foreground">No blogs found.</td></tr>
                ) : (
                  blogs.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/40 group">
                      <td className="p-2"><Checkbox checked={selected.includes(b.id)} onCheckedChange={() => toggleSelect(b.id)} /></td>
                      <td className="p-2">
                        {b.featured_image
                          ? <img src={b.featured_image} alt="" className="w-14 h-10 object-cover rounded" />
                          : <div className="w-14 h-10 bg-muted rounded" />}
                      </td>
                      <td className="p-2 max-w-[220px]">
                        <div className="font-medium truncate flex items-center gap-1.5">
                          {b.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />}
                          <span className="truncate">{b.title}</span>
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">{b.category || "—"}</td>
                      <td className="p-2 text-muted-foreground">{b.author_name || "—"}</td>
                      <td className="p-2"><Badge className={STATUS_STYLES[b.status]}>{b.status}</Badge></td>
                      <td className="p-2 text-muted-foreground">{b.published_at ? new Date(b.published_at).toLocaleDateString() : "—"}</td>
                      <td className="p-2">{b.views}</td>
                      <td className="p-2 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                      <td className="p-2 text-muted-foreground">{new Date(b.updated_at).toLocaleDateString()}</td>
                      <td className="p-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {b.deleted_at ? (
                              <>
                                <DropdownMenuItem onClick={() => runAction(() => restoreBlog(b.id), "Restored")}>
                                  <RotateCcw className="w-4 h-4 mr-2" /> Restore
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(b)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                {b.status === "published" && (
                                  <DropdownMenuItem onClick={() => window.open(`/blogs/${b.slug}`, "_blank")}>
                                    <Eye className="w-4 h-4 mr-2" /> View
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => { setEditingBlog(b); setEditorOpen(true); }}>
                                  <Pencil className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => runAction(() => duplicateBlog(b.id), "Duplicated")}>
                                  <Copy className="w-4 h-4 mr-2" /> Duplicate
                                </DropdownMenuItem>
                                {b.status !== "published" ? (
                                  <DropdownMenuItem onClick={() => runAction(() => setBlogStatus(b.id, "published"), "Published")}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Publish
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => runAction(() => setBlogStatus(b.id, "draft"), "Unpublished")}>
                                    <Pencil className="w-4 h-4 mr-2" /> Unpublish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => runAction(() => setBlogStatus(b.id, "draft"), "Saved as draft")}>
                                  <FileText className="w-4 h-4 mr-2" /> Save as Draft
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => runAction(() => toggleFeatured(b.id, !b.featured), b.featured ? "Unfeatured" : "Featured")}>
                                  {b.featured ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                                  {b.featured ? "Unfeature" : "Feature"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(b)}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {editorOpen && (
        <BlogEditor
          blog={editingBlog}
          onClose={() => setEditorOpen(false)}
          onSaved={() => { setEditorOpen(false); load(); }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget?.deleted_at ? "Delete permanently?" : "Move to trash?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.deleted_at
                ? `"${deleteTarget?.title}" will be permanently deleted. This cannot be undone.`
                : `"${deleteTarget?.title}" will be moved to trash. You can restore it later.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleteTarget) return;
                const target = deleteTarget;
                runAction(
                  () => (target.deleted_at ? hardDeleteBlog(target.id) : softDeleteBlog(target.id)),
                  target.deleted_at ? "Deleted permanently" : "Moved to trash"
                );
                setDeleteTarget(null);
              }}
            >
              {deleteTarget?.deleted_at ? "Delete Permanently" : "Move to Trash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
