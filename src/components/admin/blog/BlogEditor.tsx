import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Quote,
  Code, Code2, Table as TableIcon, ImageIcon, LinkIcon, Undo2, Redo2, Eye, EyeOff,
  Loader2, X, Upload, Save,
} from "lucide-react";
import type { Blog, BlogInput, BlogStatus } from "@/types/blog";
import { generateSlug, calcReadingTime, uploadBlogImage, createBlog, updateBlog, countWords, countCharacters } from "@/services/blogService";

const lowlight = createLowlight(common);
const CATEGORIES = ["Career Advice", "Hiring Tips", "Product Updates", "Industry News", "Assessments", "Interviews", "Company Culture"];
const AUTOSAVE_DELAY_MS = 3000;

interface BlogEditorProps {
  blog?: Blog | null;
  onClose: () => void;
  onSaved: () => void;
}

function Toolbar({ editor, onInsertImage }: { editor: Editor | null; onInsertImage: () => void }) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded-md hover:bg-muted transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`;

  const headingValue = [1, 2, 3, 4, 5, 6].find((l) => editor.isActive("heading", { level: l }))?.toString() ?? "p";

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30 sticky top-0 z-10 rounded-t-lg">
      <Select
        value={headingValue}
        onValueChange={(v) =>
          v === "p"
            ? editor.chain().focus().setParagraph().run()
            : editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run()
        }
      >
        <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Paragraph</SelectItem>
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <SelectItem key={l} value={String(l)}>Heading {l}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" className={btn(editor.isActive("underline"))} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><UnderlineIcon className="w-4 h-4" /></button>
      <button type="button" className={btn(editor.isActive("strike"))} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough className="w-4 h-4" /></button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List className="w-4 h-4" /></button>
      <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
      <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote / Callout"><Quote className="w-4 h-4" /></button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <button type="button" className={btn(editor.isActive("code"))} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline Code"><Code className="w-4 h-4" /></button>
      <button type="button" className={btn(editor.isActive("codeBlock"))} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block"><Code2 className="w-4 h-4" /></button>
      <button
        type="button"
        className={btn(false)}
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>
      <button type="button" className={btn(false)} onClick={onInsertImage} title="Insert Image"><ImageIcon className="w-4 h-4" /></button>
      <button
        type="button"
        className={btn(editor.isActive("link"))}
        onClick={() => {
          const url = window.prompt("Link URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        title="Insert Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 className="w-4 h-4" /></button>
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 className="w-4 h-4" /></button>
    </div>
  );
}

export function BlogEditor({ blog, onClose, onSaved }: BlogEditorProps) {
  const { toast } = useToast();
  const isEdit = !!blog;

  const [title, setTitle] = useState(blog?.title ?? "");
  const [slug, setSlug] = useState(blog?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [summary, setSummary] = useState(blog?.summary ?? "");
  const [category, setCategory] = useState(blog?.category ?? CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState(blog?.tags?.join(", ") ?? "");
  const [authorName, setAuthorName] = useState(blog?.author_name ?? "InterQ Team");
  const [featuredImage, setFeaturedImage] = useState(blog?.featured_image ?? "");
  const [thumbnail, setThumbnail] = useState(blog?.thumbnail ?? "");
  const [metaTitle, setMetaTitle] = useState(blog?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(blog?.meta_description ?? "");
  const [keywords, setKeywords] = useState(blog?.keywords ?? "");
  const [status, setStatus] = useState<BlogStatus>(blog?.status ?? "draft");
  const [scheduleDate, setScheduleDate] = useState(blog?.published_at ? blog.published_at.slice(0, 16) : "");
  const [featured, setFeatured] = useState(blog?.featured ?? false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const draftIdRef = useRef<string | null>(blog?.id ?? null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featuredInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Start writing your blog post…" }),
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: blog?.content ?? "",
    editorProps: {
      attributes: { class: "prose prose-slate dark:prose-invert max-w-none min-h-[400px] px-4 py-4 focus:outline-none" },
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/")) {
          event.preventDefault();
          uploadBlogImage(file, "content").then((url) => {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: url });
            const tr = view.state.tr.insert(view.state.selection.from, node);
            view.dispatch(tr);
          });
          return true;
        }
        return false;
      },
    },
    onUpdate: () => scheduleAutosave(),
  });

  useEffect(() => {
    if (!slugTouched && title) setSlug(generateSlug(title));
  }, [title, slugTouched]);

  const buildInput = useCallback((): BlogInput => {
    const html = editor?.getHTML() ?? "";
    return {
      title,
      slug: slug || generateSlug(title),
      summary,
      content: html,
      featured_image: featuredImage || null,
      thumbnail: thumbnail || featuredImage || null,
      category,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      author_name: authorName,
      status,
      featured,
      meta_title: metaTitle || title,
      meta_description: metaDescription || summary,
      keywords,
      published_at: status === "scheduled" && scheduleDate ? new Date(scheduleDate).toISOString() : null,
    };
  }, [editor, title, slug, summary, featuredImage, thumbnail, category, tagsInput, authorName, status, featured, metaTitle, metaDescription, keywords, scheduleDate]);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      if (!title.trim()) return;
      try {
        const html = editor?.getHTML() ?? "";
        if (!draftIdRef.current) {
          const created = await createBlog({ ...buildInput(), content: html, status: "draft", published_at: null });
          draftIdRef.current = created.id;
        } else {
          await updateBlog(draftIdRef.current, {
            title, slug: slug || generateSlug(title), summary, content: html,
            featured_image: featuredImage || null, thumbnail: thumbnail || featuredImage || null,
            category, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
            author_name: authorName, meta_title: metaTitle || title, meta_description: metaDescription || summary, keywords,
          });
        }
        setLastSaved(new Date());
      } catch {
        // silent — autosave failures shouldn't interrupt writing
      }
    }, AUTOSAVE_DELAY_MS);
  }, [buildInput, title, slug, summary, featuredImage, thumbnail, category, tagsInput, authorName, metaTitle, metaDescription, keywords, editor]);

  useEffect(() => {
    scheduleAutosave();
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, summary, category, tagsInput, authorName, featuredImage, thumbnail, metaTitle, metaDescription, keywords]);

  const persist = async (finalStatus: BlogStatus, successMessage: string) => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      const input = { ...buildInput(), status: finalStatus };
      if (draftIdRef.current) {
        await updateBlog(draftIdRef.current, input);
      } else {
        const created = await createBlog(input);
        draftIdRef.current = created.id;
      }
      setLastSaved(new Date());
      toast({ title: successMessage });
      onSaved();
    } catch (err) {
      toast({ title: "Failed to save", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, setter: (url: string) => void, uploadingSetter: (v: boolean) => void, folder: "featured" | "thumbnail") => {
    uploadingSetter(true);
    try {
      const url = await uploadBlogImage(file, folder);
      setter(url);
    } catch (err) {
      toast({ title: "Image upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      uploadingSetter(false);
    }
  };

  const wordCount = editor ? editor.storage.characterCount.words() : 0;
  const charCount = editor ? editor.storage.characterCount.characters() : 0;
  const readingTime = useMemo(() => calcReadingTime(editor?.getHTML() ?? ""), [editor?.getHTML()]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-3 bg-card">
        <div className="min-w-0">
          <h2 className="font-bold text-lg truncate">{isEdit ? "Edit Blog" : "Create Blog"}</h2>
          <p className="text-xs text-muted-foreground">
            {lastSaved ? `Auto-saved ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowPreview((p) => !p)} className="gap-1.5">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Editor" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => persist("draft", "Saved as draft")} disabled={saving} className="gap-1.5">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          {status === "scheduled" ? (
            <Button size="sm" onClick={() => persist("scheduled", "Scheduled")} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Schedule Publish
            </Button>
          ) : (
            <Button size="sm" onClick={() => persist("published", isEdit ? "Updated" : "Published")} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} {isEdit && blog?.status === "published" ? "Update" : "Publish"}
            </Button>
          )}
          {isEdit && blog?.status === "published" && (
            <Button variant="outline" size="sm" onClick={() => persist("draft", "Unpublished")} disabled={saving}>
              Unpublish
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor / Preview */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog title…"
              className="text-2xl sm:text-3xl font-bold h-auto py-2 border-0 border-b rounded-none px-0 focus-visible:ring-0"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Slug:</span>
              <Input
                value={slug}
                onChange={(e) => { setSlug(generateSlug(e.target.value)); setSlugTouched(true); }}
                className="h-7 text-xs font-mono max-w-xs"
              />
            </div>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description / summary…"
              className="resize-none"
              rows={2}
            />

            {!showPreview ? (
              <div className="border rounded-lg">
                <Toolbar editor={editor} onInsertImage={() => fileInputRef.current?.click()} />
                <EditorContent editor={editor} />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editor) return;
                    const url = await uploadBlogImage(file, "content");
                    editor.chain().focus().setImage({ src: url }).run();
                    e.target.value = "";
                  }}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-6">
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(editor?.getHTML() ?? "") }}
                />
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <ScrollArea className="w-80 flex-shrink-0 border-l hidden lg:block">
          <div className="p-4 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs">Featured Image</Label>
              {featuredImage && <img src={featuredImage} alt="Featured" className="w-full h-32 object-cover rounded-lg" />}
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => featuredInputRef.current?.click()} disabled={uploadingFeatured}>
                {uploadingFeatured ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {featuredImage ? "Replace" : "Upload"} Featured Image
              </Button>
              <input ref={featuredInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, setFeaturedImage, setUploadingFeatured, "featured");
                e.target.value = "";
              }} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Thumbnail</Label>
              {thumbnail && <img src={thumbnail} alt="Thumbnail" className="w-full h-20 object-cover rounded-lg" />}
              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => thumbInputRef.current?.click()} disabled={uploadingThumb}>
                {uploadingThumb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {thumbnail ? "Replace" : "Upload"} Thumbnail
              </Button>
              <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, setThumbnail, setUploadingThumb, "thumbnail");
                e.target.value = "";
              }} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="hiring, remote, tips" className="h-9" />
              <div className="flex flex-wrap gap-1">
                {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Author</Label>
              <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="h-9" />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Featured Post</Label>
              <Switch checked={featured} onCheckedChange={setFeatured} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as BlogStatus)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "scheduled" && (
              <div className="space-y-2">
                <Label className="text-xs">Publish Date &amp; Time</Label>
                <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="h-9" />
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">SEO</p>
              <div className="space-y-2">
                <Label className="text-xs">SEO Title</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={title} className="h-9" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">SEO Description</Label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder={summary} rows={2} className="resize-none" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Keywords</Label>
                <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="hiring, recruitment, ai" className="h-9" />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
