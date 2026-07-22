"use client";

import React, { useEffect, useRef } from "react";

interface HTMLContentProps {
  htmlContent: string;
}

const DEFAULT_CSS = `
.editor-preview {
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, sans-serif;
  line-height: 1.6;
  color: #0f172a;
  background: #fff;
  padding: 0;
  margin: 0;
}

.editor-preview::after {
  content: "";
  display: table;
  clear: both;
}

/* Quill text alignment */
.editor-preview .ql-align-left {
  text-align: left !important;
}

.editor-preview .ql-align-center {
  text-align: center !important;
}

.editor-preview .ql-align-right {
  text-align: right !important;
}

.editor-preview .ql-align-justify {
  text-align: justify !important;
}

.editor-preview h1 {
  font-size: 2rem;
  margin: 0.5rem 0 0.75rem;
  font-weight: 800;
  line-height: 1.4;
}

.editor-preview h2 {
  font-size: 1.75rem;
  margin: 0.75rem 0;
  font-weight: 800;
  line-height: 1.35;
  display: block;
  width: 100%;
  text-align: center;
  color: #ffffff;
  background: var(--color-primary);
  padding: 1rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  scroll-margin-top: 5rem;
}

.editor-preview h3 {
  font-size: 1.25rem;
  margin: 0.75rem 0 0.5rem;
  font-weight: 700;
  line-height: 1.4;
}

.editor-preview h4 {
  font-size: 1.1rem;
  margin: 0.5rem 0 0.25rem;
  font-weight: 700;
  line-height: 1.4;
}

.editor-preview p {
  margin: 0.75rem 0;
  line-height: 1.75;
  text-align: justify;
}

.editor-preview ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
  list-style: disc;
}

.editor-preview ol {
  margin: 0.75rem 0;
  padding-left: 0;
  list-style: none;
}

.editor-preview li {
  margin: 0.4rem 0;
  line-height: 1.6;
}

.editor-preview .ql-ui {
  display: none !important;
}

.editor-preview ol > li[data-list="bullet"] {
  list-style-type: disc;
  list-style-position: outside;
  margin-left: 1.5rem;
}

.editor-preview ol > li[data-list="ordered"] {
  list-style-type: decimal;
  list-style-position: outside;
  margin-left: 1.5rem;
}

.editor-preview ul > li {
  list-style-type: disc;
  margin-left: 0.25rem;
}

.editor-preview img {
  border-radius: 12px;
  max-width: 100%;
  height: auto !important;
}

.editor-preview img[data-align="left"],
.editor-preview img[style*="float: left"],
.editor-preview img[style*="float:left"] {
  float: left;
  display: inline;
  margin: 0 1em 1em 0 !important;
}

.editor-preview img[data-align="right"],
.editor-preview img[style*="float: right"],
.editor-preview img[style*="float:right"] {
  float: right;
  display: inline;
  margin: 0 0 1em 1em !important;
}

.editor-preview img[data-align="center"],
.editor-preview img[style*="margin"][style*="auto"] {
  float: none !important;
  display: block !important;
  margin: 1rem auto !important;
}

.editor-preview a {
  color: #2563eb;
  text-decoration: underline;
}

.editor-preview iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  border-radius: 12px;
  margin: 1rem 0;
  background: #000;
}

.editor-preview video {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 1rem 0;
  background: #000;
}
`;

const getImageAlign = (img: HTMLImageElement): "left" | "center" | "right" | null => {
  const dataAlign = img.getAttribute("data-align");
  if (dataAlign === "left" || dataAlign === "center" || dataAlign === "right") {
    return dataAlign;
  }

  const floatValue = img.style.cssFloat || img.style.float;
  if (floatValue === "left") return "left";
  if (floatValue === "right") return "right";

  const inlineStyle = img.getAttribute("style") || "";
  if (/float:\s*left/i.test(inlineStyle)) return "left";
  if (/float:\s*right/i.test(inlineStyle)) return "right";
  if (/margin:\s*[^;]*auto/i.test(inlineStyle) && /display:\s*block/i.test(inlineStyle)) {
    return "center";
  }

  return null;
};

const applyImageStyles = (img: HTMLImageElement) => {
  if (!img.getAttribute("alt")) {
    img.setAttribute("alt", "Campaign image");
  }

  img.loading = "lazy";
  img.style.maxWidth = "100%";
  img.style.height = "auto";

  const align = getImageAlign(img);

  if (align === "left") {
    img.style.float = "left";
    img.style.display = "inline";
    img.style.margin = "0 1em 1em 0";
  } else if (align === "right") {
    img.style.float = "right";
    img.style.display = "inline";
    img.style.margin = "0 0 1em 1em";
  } else if (align === "center") {
    img.style.float = "none";
    img.style.display = "block";
    img.style.margin = "1rem auto";
  }
};

const BlogDescriptionParser: React.FC<HTMLContentProps> = ({ htmlContent }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    root.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    root.querySelectorAll("img").forEach((img) => {
      applyImageStyles(img as HTMLImageElement);
    });

    if (!document.querySelector("style[data-campaign-content-css]")) {
      const style = document.createElement("style");
      style.setAttribute("data-campaign-content-css", "true");
      style.innerHTML = DEFAULT_CSS;
      document.head.appendChild(style);
    }
  }, [htmlContent]);

  return (
    <div ref={containerRef} className="editor-preview ql-editor">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
};

export default BlogDescriptionParser;
