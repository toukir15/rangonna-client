"use client";

import React, { useEffect, useRef } from "react";

interface HTMLContentProps {
  htmlContent: string;
}

/**
 * CustomHTMLParser
 * - Responsive images
 * - Clean typography
 * - Auto target="_blank" for links
 * - Removes empty <p><br></p> lines
 */

/** Google Ads / GA linker params often appended to same-site links via GTM. */
const TRACKING_QUERY_KEYS = new Set([
  "_gl",
  "_gcl_au",
  "gclid",
  "gbraid",
  "wbraid",
  "dclid",
  "gclsrc",
]);

function stripGoogleLinkerParams(href: string, baseOrigin: string): string {
  try {
    const url = new URL(href, baseOrigin);
    let changed = false;
    for (const key of [...url.searchParams.keys()]) {
      const lower = key.toLowerCase();
      if (
        TRACKING_QUERY_KEYS.has(lower) ||
        lower.startsWith("_gcl")
      ) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (!changed) return href;
    const q = url.searchParams.toString();
    return q
      ? `${url.origin}${url.pathname}?${q}${url.hash}`
      : `${url.origin}${url.pathname}${url.hash}`;
  } catch {
    return href;
  }
}

function shouldSanitizeHostname(hostname: string): boolean {
  const h = hostname.replace(/^www\./i, "").toLowerCase();
  if (h === "naviforce.com.bd") return true;
  if (typeof window !== "undefined") {
    const current = window.location.hostname.replace(/^www\./i, "").toLowerCase();
    if (h === current) return true;
  }
  return false;
}

const DEFAULT_CSS = `
.editor-preview {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Helvetica, Arial, Noto Sans, sans-serif;
  line-height: 1.6;
  color: #0f172a;
  background: #fff;
  padding: 0;
  margin: 0;
}

/* Images */
.editor-preview img {
  display: block;
  margin: 1rem auto;
  border-radius: 12px;
  max-width: 100%;
  height: auto;
}

/* Headings */
.editor-preview h1 {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.4;
  margin: 1rem 0;
}

.editor-preview h2 {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 1rem 0;
}

.editor-preview h3 {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0.9rem 0;
}

.editor-preview h4 {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0.8rem 0;
}

/* Paragraph */
.editor-preview p {
  margin: 0.75rem 0;
  line-height: 1.8;
  text-align: justify;
}

/* Lists */
.editor-preview ul,
.editor-preview ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.editor-preview li {
  margin: 0.4rem 0;
  line-height: 1.7;
}

/* Links */
.editor-preview a {
  color: #2563eb;
  text-decoration: underline;
}

/* iframe */
.editor-preview iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  border-radius: 12px;
  margin: 1rem 0;
  background: #000;
}

/* video */
.editor-preview video {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1rem 0;
  background: #000;
}

/* Tables: wide specs tables overflow mobile without a scroll shell */
.editor-preview .editor-preview-table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
  margin: 1rem 0;
}

.editor-preview table {
  width: max-content;
  min-width: 100%;
  max-width: none;
  border-collapse: collapse;
  font-size: 0.875rem;
  line-height: 1.5;
  background: #fff;
}

.editor-preview th,
.editor-preview td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}

.editor-preview th {
  background: #f1f5f9;
  font-weight: 600;
  color: #0f172a;
}

.editor-preview caption {
  caption-side: top;
  text-align: left;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
`;

const CustomHTMLParser: React.FC<HTMLContentProps> = ({
  htmlContent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Remove empty paragraph tags
   * Example:
   * <p><br></p>
   * <p>&nbsp;</p>
   */
  const cleanedHTML = htmlContent
    .replace(/<p><br><\/p>/g, "")
    .replace(/<p>(&nbsp;|\\s)*<\/p>/g, "")
    .trim();

  useEffect(() => {
    const root = containerRef.current;

    if (!root) return;

    const baseOrigin =
      typeof window !== "undefined" ? window.location.origin : "https://naviforce.com.bd";

    /**
     * Strip GTM / Ads linker junk from same-site URLs (href + click).
     */
    const onLinkClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target;
      if (!(target instanceof Node)) return;

      const a = (target as Element).closest?.("a[href]");
      if (!a || !root.contains(a)) return;

      const el = a as HTMLAnchorElement;
      const raw = el.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return;

      try {
        const url = new URL(el.href);
        if (!/^https?:$/i.test(url.protocol)) return;
        if (!shouldSanitizeHostname(url.hostname)) return;

        const cleaned = stripGoogleLinkerParams(url.href, baseOrigin);
        if (cleaned === url.href) return;

        e.preventDefault();
        e.stopPropagation();
        window.open(cleaned, el.target || "_blank", "noopener,noreferrer");
      } catch {
        /* ignore */
      }
    };

    root.addEventListener("click", onLinkClickCapture, true);

    /**
     * Open links in new tab + normalize href (removes linker params from HTML)
     */
    root.querySelectorAll("a[href]").forEach((node) => {
      const a = node as HTMLAnchorElement;
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) return;

      try {
        const url = new URL(raw, baseOrigin);
        if (/^https?:$/i.test(url.protocol) && shouldSanitizeHostname(url.hostname)) {
          const cleaned = stripGoogleLinkerParams(url.href, baseOrigin);
          a.setAttribute("href", cleaned);
        }
      } catch {
        /* keep original */
      }

      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    /**
     * Wide HTML tables: wrap so horizontal scroll works (raw <table> overflows otherwise).
     */
    root.querySelectorAll("table").forEach((table) => {
      const parent = table.parentElement;
      if (parent?.classList.contains("editor-preview-table-scroll")) return;

      const wrap = document.createElement("div");
      wrap.className = "editor-preview-table-scroll";
      wrap.setAttribute("role", "region");
      wrap.setAttribute("aria-label", "Product specification table");
      table.parentNode?.insertBefore(wrap, table);
      wrap.appendChild(table);
    });

    /**
     * Responsive images
     */
    root.querySelectorAll("img").forEach((img) => {
      if (!img.getAttribute("alt")) {
        img.setAttribute("alt", "Product image");
      }

      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "12px";

      img.loading = "lazy";
    });

    /**
     * Inject CSS once
     */
    if (!document.querySelector("#editor-preview-style")) {
      const style = document.createElement("style");

      style.id = "editor-preview-style";
      style.innerHTML = DEFAULT_CSS;

      document.head.appendChild(style);
    }

    return () => {
      root.removeEventListener("click", onLinkClickCapture, true);
    };
  }, [cleanedHTML]);

  return (
    <div
      ref={containerRef}
      className="editor-preview"
    >
      <div
        dangerouslySetInnerHTML={{
          __html: cleanedHTML,
        }}
      />
    </div>
  );
};

export default CustomHTMLParser;