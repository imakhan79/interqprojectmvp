import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination";
import { Search, Calendar, Clock, Eye, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { listPublishedBlogsPaged, subscribeToBlogChanges } from "@/services/blogService";
import type { Blog as BlogType } from "@/types/blog";

const PAGE_SIZE = 9;

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<"newest" | "most_viewed">("newest");
  const [page, setPage] = useState(1);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const load = () => {
    setLoading(true);
    listPublishedBlogsPaged({ page, pageSize: PAGE_SIZE, category, tag, search, sort })
      .then((res) => {
        setBlogs(res.blogs);
        setTotal(res.total);
      })
      .catch(() => {
        setBlogs([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  // Load a broader, unfiltered sample once to populate category/tag filter chips
  // (independent of the current filtered/paged result set).
  useEffect(() => {
    listPublishedBlogsPaged({ page: 1, pageSize: 200, sort: "newest" }).then((res) => {
      setAllCategories(Array.from(new Set(res.blogs.map((b) => b.category).filter(Boolean))) as string[]);
      setAllTags(Array.from(new Set(res.blogs.flatMap((b) => b.tags))));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = subscribeToBlogChanges(load);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, tag, sort]);

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const featured = page === 1 && !search && category === "all" && tag === "all" ? blogs.find((b) => b.featured) : null;
  const rest = featured ? blogs.filter((b) => b.id !== featured.id) : blogs;

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== "ellipsis") pages.push("ellipsis");
    }
    return pages;
  }, [totalPages, page]);

  const canonicalUrl = typeof window !== "undefined" ? `${window.location.origin}/blogs` : "https://www.interq.online/blogs";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog — Insights on Hiring & Technical Interviews | InterQ</title>
        <meta name="description" content="Hiring tips, product updates, and industry news from the InterQ team." />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Blog — InterQ" />
        <meta property="og:description" content="Hiring tips, product updates, and industry news from the InterQ team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog — InterQ" />
        <meta name="twitter:description" content="Hiring tips, product updates, and industry news from the InterQ team." />
      </Helmet>
      <EnhancedNavigation />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Insights &amp; Updates</h1>
            <p className="text-lg text-muted-foreground">Hiring tips, product updates, and industry news.</p>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
                <button
                  onClick={() => { setSort("newest"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    sort === "newest" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Latest
                </button>
                <button
                  onClick={() => { setSort("most_viewed"); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    sort === "most_viewed" ? "bg-background shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Popular
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {["all", ...allCategories].map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {c === "all" ? "All Categories" : c}
                </button>
              ))}
            </div>

            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {["all", ...allTags].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTag(t); setPage(1); }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      tag === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    #{t === "all" ? "all tags" : t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No articles found.</div>
          ) : (
            <>
              {featured && (
                <Link to={`/blogs/${featured.slug}`}>
                  <Card className="mb-8 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="grid md:grid-cols-2">
                      <div className="h-56 md:h-full bg-muted">
                        {featured.featured_image && <img src={featured.featured_image} alt={featured.title} className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                      <CardContent className="p-6 flex flex-col justify-center">
                        <Badge className="w-fit mb-3">{featured.category}</Badge>
                        <h2 className="text-2xl font-bold mb-2">{featured.title}</h2>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{featured.summary}</p>
                        <span className="text-sm font-medium text-primary flex items-center gap-1">Read Story <ArrowRight className="w-4 h-4" /></span>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              )}

              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((b, i) => (
                    <motion.div key={b.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/blogs/${b.slug}`}>
                        <Card className="group h-full overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                          <div className="relative h-44 bg-muted overflow-hidden">
                            {b.featured_image && <img src={b.featured_image} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                            {b.category && <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">{b.category}</Badge>}
                          </div>
                          <CardContent className="p-5">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{b.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{b.summary}</p>
                            {b.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {b.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.published_at ? new Date(b.published_at).toLocaleDateString() : ""}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.reading_time}m</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {b.views}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>

              {totalPages > 1 && (
                <Pagination className="mt-10">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                        className={page === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {pageNumbers.map((p, i) =>
                      p === "ellipsis" ? (
                        <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); setPage(p); }}>
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                        className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
