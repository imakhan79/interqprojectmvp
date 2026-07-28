import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Eye, Heart, Share2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getBlogBySlug, incrementViews, toggleLikeBlog, hasLikedBlog,
  getRelatedBlogs, getAdjacentBlogs,
} from "@/services/blogService";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import type { Blog } from "@/types/blog";

interface Heading { id: string; text: string; level: number }

export default function BlogDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [related, setRelated] = useState<Blog[]>([]);
  const [prevNext, setPrevNext] = useState<{ previous: Blog | null; next: Blog | null }>({ previous: null, next: null });
  const [headings, setHeadings] = useState<Heading[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    getBlogBySlug(slug).then(async (data) => {
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setBlog(data);
      setLikes(data.likes);
      setLiked(hasLikedBlog(data.id));
      setLoading(false);

      if (!viewedRef.current) {
        viewedRef.current = true;
        incrementViews(data.id).catch(() => {});
      }

      const [rel, adj] = await Promise.all([
        getRelatedBlogs(data.category, data.id, 3),
        data.published_at ? getAdjacentBlogs(data.published_at, data.id) : Promise.resolve({ previous: null, next: null }),
      ]);
      setRelated(rel);
      setPrevNext(adj);
    }).catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (!contentRef.current) return;
    const nodes = Array.from(contentRef.current.querySelectorAll("h2, h3")) as HTMLElement[];
    const found: Heading[] = nodes.map((n, i) => {
      const id = `heading-${i}`;
      n.id = id;
      return { id, text: n.textContent || "", level: n.tagName === "H2" ? 2 : 3 };
    });
    setHeadings(found);
  }, [blog?.content]);

  const handleLike = async () => {
    if (!blog) return;
    try {
      const result = await toggleLikeBlog(blog.id);
      setLikes(result.likes);
      setLiked(result.liked);
    } catch {
      toast({ title: "Could not update like", variant: "destructive" });
    }
  };

  const handleShare = async (platform?: "twitter" | "linkedin" | "facebook") => {
    const url = window.location.href;
    if (!platform) {
      if (navigator.share) {
        navigator.share({ title: blog?.title, url }).catch(() => {});
      } else {
        navigator.clipboard.writeText(url);
        toast({ title: "Link copied to clipboard" });
      }
      return;
    }
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(blog?.title || "")}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedNavigation />
        <div className="max-w-3xl mx-auto pt-32 px-4 space-y-4">
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded-xl animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-full" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col">
        <EnhancedNavigation />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <h1 className="text-2xl font-bold">Article not found</h1>
          <Button onClick={() => navigate("/blogs")}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  const canonicalUrl = typeof window !== "undefined" ? `${window.location.origin}/blogs/${blog.slug}` : `https://www.interq.online/blogs/${blog.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.summary || blog.meta_description || undefined,
    image: blog.featured_image || undefined,
    author: { "@type": "Person", name: blog.author_name || "InterQ Team" },
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{blog.meta_title || blog.title} | InterQ Blog</title>
        <meta name="description" content={blog.meta_description || blog.summary || ""} />
        {blog.keywords && <meta name="keywords" content={blog.keywords} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.summary || ""} />
        {blog.featured_image && <meta property="og:image" content={blog.featured_image} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.summary || ""} />
        {blog.featured_image && <meta name="twitter:image" content={blog.featured_image} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <EnhancedNavigation />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => navigate("/blogs")}>
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Button>

          {blog.category && <Badge className="mb-4">{blog.category}</Badge>}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">{blog.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
            <span className="font-medium text-foreground">{blog.author_name}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ""}</span>
            {blog.updated_at !== blog.created_at && (
              <span className="text-xs">Updated {new Date(blog.updated_at).toLocaleDateString()}</span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {blog.reading_time} min read</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {blog.views} views</span>
          </div>

          {blog.featured_image && (
            <img src={blog.featured_image} alt={blog.title} className="w-full h-auto max-h-[420px] object-cover rounded-xl mb-8" />
          )}

          {headings.length > 0 && (
            <Card className="mb-8 bg-muted/40">
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Table of Contents</p>
                <ul className="space-y-1 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
                      <a href={`#${h.id}`} className="text-primary hover:underline">{h.text}</a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div
            ref={contentRef}
            className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
          />

          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {blog.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}

          <div className="flex items-center gap-3 mt-8 pt-8 border-t">
            <Button variant={liked ? "default" : "outline"} className="gap-2" onClick={handleLike}>
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {likes}
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleShare()}><Share2 className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>X</Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("linkedin")}>LinkedIn</Button>
            <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>Facebook</Button>
          </div>

          {(prevNext.previous || prevNext.next) && (
            <div className="grid grid-cols-2 gap-4 mt-8">
              {prevNext.previous ? (
                <Link to={`/blogs/${prevNext.previous.slug}`} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Previous</span>
                  <p className="font-medium mt-1 line-clamp-2">{prevNext.previous.title}</p>
                </Link>
              ) : <div />}
              {prevNext.next ? (
                <Link to={`/blogs/${prevNext.next.slug}`} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors text-right">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end">Next <ChevronRight className="w-3 h-3" /></span>
                  <p className="font-medium mt-1 line-clamp-2">{prevNext.next.title}</p>
                </Link>
              ) : <div />}
            </div>
          )}

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">Related Articles</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.id} to={`/blogs/${r.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                      <div className="h-28 bg-muted">
                        {r.featured_image && <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover" />}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium line-clamp-2">{r.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
