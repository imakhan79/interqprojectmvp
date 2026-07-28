import { supabase } from "@/integrations/supabase/client";
import type { Blog, BlogInput, BlogStats, BlogSortOption, BlogStatus } from "@/types/blog";

const TABLE = "blogs";
const BUCKET = "blog-images";

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countCharacters(html: string): number {
  return html.replace(/<[^>]*>/g, "").length;
}

/** Client-side image resize/compression before upload (no server pipeline available). */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob || file),
      file.type === "image/png" ? "image/png" : "image/jpeg",
      quality
    );
  });
}

export async function uploadBlogImage(file: File, folder: "featured" | "thumbnail" | "content" = "content"): Promise<string> {
  const compressed = await compressImage(file);
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export interface BlogListFilters {
  search?: string;
  category?: string;
  status?: BlogStatus | "trashed" | "all";
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: BlogSortOption;
}

export async function listBlogsAdmin(filters: BlogListFilters = {}): Promise<Blog[]> {
  let query = (supabase as any).from(TABLE).select("*");

  if (filters.status === "trashed") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
  }

  if (filters.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters.author && filters.author !== "all") query = query.eq("author_name", filters.author);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  switch (filters.sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "most_viewed":
      query = query.order("views", { ascending: false });
      break;
    case "alphabetical":
      query = query.order("title", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Blog[]) ?? [];
}

export async function getBlogStats(): Promise<BlogStats> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select("status, featured, views, likes")
    .is("deleted_at", null);
  if (error) throw error;
  const rows = (data as { status: BlogStatus; featured: boolean; views: number; likes: number }[]) ?? [];

  return {
    total: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
    scheduled: rows.filter((r) => r.status === "scheduled").length,
    featured: rows.filter((r) => r.featured).length,
    totalViews: rows.reduce((sum, r) => sum + (r.views || 0), 0),
    totalLikes: rows.reduce((sum, r) => sum + (r.likes || 0), 0),
  };
}

export async function getBlogById(id: string): Promise<Blog | null> {
  const { data, error } = await (supabase as any).from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Blog | null;
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data as Blog | null;
}

export async function listPublishedBlogs(limit = 6, category?: string): Promise<Blog[]> {
  let query = (supabase as any)
    .from(TABLE)
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category && category !== "all") query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Blog[]) ?? [];
}

export interface PublishedBlogsPageFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  search?: string;
  sort?: "newest" | "most_viewed";
}

export interface PublishedBlogsPage {
  blogs: Blog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listPublishedBlogsPaged(filters: PublishedBlogsPageFilters = {}): Promise<PublishedBlogsPage> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? 9;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase as any)
    .from(TABLE)
    .select("*", { count: "exact" })
    .eq("status", "published")
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString());

  if (filters.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters.tag && filters.tag !== "all") query = query.contains("tags", [filters.tag]);
  if (filters.search) query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);

  query = filters.sort === "most_viewed"
    ? query.order("views", { ascending: false })
    : query.order("published_at", { ascending: false });

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    blogs: (data as Blog[]) ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRelatedBlogs(category: string | null, excludeId: string, limit = 3): Promise<Blog[]> {
  let query = (supabase as any)
    .from(TABLE)
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .lte("published_at", new Date().toISOString())
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Blog[]) ?? [];
}

export async function getAdjacentBlogs(publishedAt: string, excludeId: string): Promise<{ previous: Blog | null; next: Blog | null }> {
  const [{ data: prevData }, { data: nextData }] = await Promise.all([
    (supabase as any)
      .from(TABLE)
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .lt("published_at", publishedAt)
      .neq("id", excludeId)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    (supabase as any)
      .from(TABLE)
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .gt("published_at", publishedAt)
      .neq("id", excludeId)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return { previous: (prevData as Blog) ?? null, next: (nextData as Blog) ?? null };
}

export async function createBlog(input: BlogInput): Promise<Blog> {
  const payload = {
    ...input,
    reading_time: calcReadingTime(input.content),
    published_at:
      input.status === "published" && !input.published_at ? new Date().toISOString() : input.published_at,
  };
  const { data, error } = await (supabase as any).from(TABLE).insert(payload).select().single();
  if (error) throw error;
  return data as Blog;
}

export async function updateBlog(id: string, input: Partial<BlogInput>): Promise<Blog> {
  const payload: Record<string, unknown> = { ...input };
  if (typeof input.content === "string") {
    payload.reading_time = calcReadingTime(input.content);
  }
  if (input.status === "published" && !input.published_at) {
    payload.published_at = new Date().toISOString();
  }
  const { data, error } = await (supabase as any).from(TABLE).update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Blog;
}

export async function duplicateBlog(id: string): Promise<Blog> {
  const original = await getBlogById(id);
  if (!original) throw new Error("Blog not found");

  const slugBase = `${original.slug}-copy`;
  let slug = slugBase;
  let attempt = 1;
  // Ensure uniqueness
  while (true) {
    const { data } = await (supabase as any).from(TABLE).select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    attempt += 1;
    slug = `${slugBase}-${attempt}`;
  }

  const { id: _id, created_at, updated_at, views, likes, published_at, ...rest } = original;
  const { data, error } = await (supabase as any)
    .from(TABLE)
    .insert({ ...rest, title: `${original.title} (Copy)`, slug, status: "draft", views: 0, likes: 0, published_at: null })
    .select()
    .single();
  if (error) throw error;
  return data as Blog;
}

export async function setBlogStatus(id: string, status: BlogStatus, publishedAt?: string | null): Promise<Blog> {
  const payload: Record<string, unknown> = { status };
  if (status === "published" && !publishedAt) {
    payload.published_at = new Date().toISOString();
  } else if (status === "scheduled" && publishedAt) {
    payload.published_at = publishedAt;
  } else if (status === "draft") {
    payload.published_at = null;
  }
  const { data, error } = await (supabase as any).from(TABLE).update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data as Blog;
}

export async function toggleFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).update({ featured }).eq("id", id);
  if (error) throw error;
}

export async function softDeleteBlog(id: string): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function restoreBlog(id: string): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).update({ deleted_at: null }).eq("id", id);
  if (error) throw error;
}

export async function hardDeleteBlog(id: string): Promise<void> {
  const { error } = await (supabase as any).from(TABLE).delete().eq("id", id);
  if (error) throw error;
}

export async function bulkSetStatus(ids: string[], status: BlogStatus): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (status === "published") payload.published_at = new Date().toISOString();
  const { error } = await (supabase as any).from(TABLE).update(payload).in("id", ids);
  if (error) throw error;
}

export async function bulkSoftDelete(ids: string[]): Promise<void> {
  const { error } = await (supabase as any)
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw error;
}

export async function incrementViews(id: string): Promise<void> {
  const { error } = await (supabase as any).rpc("increment_blog_views", { blog_id: id });
  if (error) throw error;
}

const LIKED_STORAGE_KEY = "interq_liked_blogs";

export function hasLikedBlog(id: string): boolean {
  try {
    const liked: string[] = JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY) || "[]");
    return liked.includes(id);
  } catch {
    return false;
  }
}

export async function toggleLikeBlog(id: string): Promise<{ likes: number; liked: boolean }> {
  const alreadyLiked = hasLikedBlog(id);
  const { data, error } = await (supabase as any).rpc("toggle_blog_like", {
    blog_id: id,
    should_increment: !alreadyLiked,
  });
  if (error) throw error;

  try {
    const liked: string[] = JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY) || "[]");
    const next = alreadyLiked ? liked.filter((l) => l !== id) : [...liked, id];
    localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }

  return { likes: data as number, liked: !alreadyLiked };
}

export function subscribeToBlogChanges(onChange: () => void): () => void {
  const channel = supabase
    .channel("public:blogs")
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE }, () => onChange())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
