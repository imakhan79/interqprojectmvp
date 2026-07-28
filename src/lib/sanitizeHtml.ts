import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "code", "pre",
  "ul", "ol", "li", "blockquote",
  "table", "thead", "tbody", "tr", "th", "td",
  "a", "img", "figure", "figcaption", "span", "div",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "src", "alt", "title", "class", "width", "height", "colspan", "rowspan",
];

/** Sanitize rich-text HTML before rendering to prevent stored XSS. */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty || "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}
