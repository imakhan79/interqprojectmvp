import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, ArrowRight } from "lucide-react";
import { listPublishedBlogs, subscribeToBlogChanges } from "@/services/blogService";
import type { Blog } from "@/types/blog";

export default function LatestBlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    listPublishedBlogs(6)
      .then(setBlogs)
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Auto-refresh whenever admin creates/edits/publishes/deletes a blog — no manual refresh needed
    const unsubscribe = subscribeToBlogChanges(load);
    return unsubscribe;
  }, []);

  if (!loading && blogs.length === 0) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">Latest Blogs</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Insights &amp; Updates</h2>
          <p className="text-muted-foreground text-lg">Hiring tips, product updates, and industry news from the InterQ team.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card animate-pulse h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="group h-full overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <div className="relative h-44 overflow-hidden bg-muted">
                    {blog.featured_image ? (
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20" />
                    )}
                    {blog.category && (
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">{blog.category}</Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col h-[calc(100%-11rem)]">
                    <h3 className="font-semibold text-lg leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{blog.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ""}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {blog.reading_time} min read</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {blog.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{blog.author_name}</span>
                      <Button asChild variant="ghost" size="sm" className="gap-1 group-hover:gap-2 transition-all">
                        <Link to={`/blogs/${blog.slug}`}>Read More <ArrowRight className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/blogs">View All Blogs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
