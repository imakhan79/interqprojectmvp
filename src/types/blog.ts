export type BlogStatus = "draft" | "scheduled" | "published" | "archived";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  featured_image: string | null;
  thumbnail: string | null;
  category: string | null;
  tags: string[];
  author_id: string | null;
  author_name: string | null;
  status: BlogStatus;
  featured: boolean;
  views: number;
  likes: number;
  reading_time: number;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BlogInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string | null;
  thumbnail: string | null;
  category: string;
  tags: string[];
  author_name: string;
  status: BlogStatus;
  featured: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string;
  published_at: string | null;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  featured: number;
  totalViews: number;
  totalLikes: number;
}

export type BlogSortOption = "newest" | "oldest" | "most_viewed" | "alphabetical";
