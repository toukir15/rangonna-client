"use client";

import React, { useEffect, useMemo, useRef } from "react";
import "quill/dist/quill.snow.css";
import { stripTrailingEmptyQuillParagraphs } from "@admin/utils/stripTrailingEmptyQuillParagraphs";

const DEFAULT_CSS = `
  .editor-preview {
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, sans-serif;
    line-height: 1.6;
    color: #0f172a;
    background: #fff;
    padding: 0;
    margin: 0;
    word-break: break-word;
    overflow-wrap: anywhere;
  }

  .editor-preview img {
    display: inline-block;
    margin: 0.75rem 0;
    border-radius: 12px;
    max-width: 100% !important;
    height: auto !important;
  }

  /* One margin block each — avoid h1 { margin-bottom: 40px } stacking with other margins (looked like huge gaps). */
  .editor-preview h1 {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.3;
    margin: 0 0 0.6em;
  }

  .editor-preview h2 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.35;
    margin: 0.85em 0 0.5em;
  }

  .editor-preview h3 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.4;
    margin: 0.85em 0 0.45em;
  }

  .editor-preview h4 {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.4;
    margin: 0.75em 0 0.4em;
  }

  /* Do not force justify on all p — breaks Quill ql-align + .ql-editor inline text-align from export. */
  .editor-preview p {
    margin: 0.35em 0;
    line-height: 1.7;
  }

  .editor-preview .ql-editor {
    min-height: 0;
    padding: 0;
  }

  .editor-preview .ql-editor .ql-align-left {
    text-align: left;
  }
  .editor-preview .ql-editor .ql-align-center {
    text-align: center;
  }
  .editor-preview .ql-editor .ql-align-right {
    text-align: right;
  }
  .editor-preview .ql-editor .ql-align-justify {
    text-align: justify;
  }

  .editor-preview ul {
    margin: 0.5em 0 0.5em 1.25rem;
    list-style: disc;
    padding-left: 1.25rem;
  }

  .editor-preview ol {
    margin: 0.5em 0 0.5em 1.25rem;
    list-style: decimal;
    padding-left: 1.25rem;
  }

  .editor-preview li {
    margin: 0.2em 0;
    line-height: 1.6;
  }

  .editor-preview a {
    color: #2563eb;
    text-decoration: underline;
  }

  .editor-preview blockquote {
    border-left: 4px solid #cbd5e1;
    margin: 1rem 0;
    padding: 0.75rem 1rem;
    background: #f8fafc;
    color: #334155;
  }

  .editor-preview pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 1rem;
    border-radius: 12px;
    overflow-x: auto;
    margin: 1rem 0;
  }

  .editor-preview code {
    background: #f1f5f9;
    padding: 0.15rem 0.35rem;
    border-radius: 6px;
    font-size: 0.9em;
  }

  .editor-preview pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
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

  .editor-preview .table-wrapper {
    width: 100%;
    overflow-x: auto;
    margin: 1rem 0;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: block;
  }

  .editor-preview .table-wrapper table,
  .editor-preview table {
    width: 100% !important;
    min-width: 600px;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    background: #fff !important;
  }

  .editor-preview table thead,
  .editor-preview .table-wrapper table thead {
    background: #FA8072 !important;
  }

  .editor-preview table th,
  .editor-preview table td,
  .editor-preview .table-wrapper table th,
  .editor-preview .table-wrapper table td {
    border: 1px solid #e2e8f0 !important;
    padding: 12px 14px !important;
    text-align: left !important;
    vertical-align: top !important;
    line-height: 1.6 !important;
  }

  .editor-preview table th,
  .editor-preview .table-wrapper table th {
    font-weight: 700 !important;
    color: #0f172a !important;
    white-space: nowrap;
  }

  .editor-preview table td,
  .editor-preview .table-wrapper table td {
    color: #334155 !important;
  }

  .editor-preview table tbody tr:nth-child(even),
  .editor-preview .table-wrapper table tbody tr:nth-child(even) {
    background: #fcfcfd !important;
  }

  .editor-preview table tbody tr:hover,
  .editor-preview .table-wrapper table tbody tr:hover {
    background: #f8fafc !important;
  }

  .editor-preview hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 1.5rem 0;
  }
`;

interface Props {
  htmlContent?: string;
}

const CustomHTMLParser: React.FC<Props> = ({ htmlContent = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeHtml = useMemo(
    () => stripTrailingEmptyQuillParagraphs(htmlContent || ""),
    [htmlContent],
  );

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    root.querySelectorAll("a").forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });

    root.querySelectorAll("img").forEach((img) => {
      if (!img.getAttribute("alt")) {
        img.setAttribute("alt", "Product image");
      }
      img.setAttribute("loading", "lazy");
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.borderRadius = "12px";
      img.style.margin = "0.75rem 0";
    });

    root.querySelectorAll("table").forEach((table) => {
      const parent = table.parentElement;

      if (!parent || !parent.classList.contains("table-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });
  }, [htmlContent]);

  return (
    <div className="editor-preview">
      <style jsx global>{DEFAULT_CSS}</style>

      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
};

export default CustomHTMLParser;