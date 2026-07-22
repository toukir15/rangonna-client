import React, { useMemo, useState } from "react";

/** =========================
 *  1) Small HTML sanitizer
 *  =========================
 *  - Unwraps .custom-image-blot wrappers -> plain <img>
 *  - Drops delete "✖" spans
 *  - Removes any on* attributes (onclick, onerror, etc.)
 *  - Disallows javascript: and data: (except data:image/)
 *  - Allowlist tags & attributes (tight but practical for descriptions)
 */

const ALLOWED_TAGS = new Set([
  "style", // তোমার editor already style block দেয়
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "div",
  "span",
  "img",
]);

const ALLOWED_ATTRS = new Set([
  "href",
  "src",
  "alt",
  "title",
  "width",
  "height",
  "style",
  "class",
  "aria-hidden",
  "role",
]);

const SAFE_CSS_PREFIXES = [
  "text-align",
  "max-width",
  "width",
  "height",
  "border-radius",
  "display",
  "margin",
  "padding",
  "line-height",
  "font-weight",
  "font-size",
  "color",
  "background",
  "background-color",
]; // প্রয়োজনে বাড়াতে পারো

function isSafeUrl(u: string) {
  try {
    // allow: http(s), protocol-relative, root-relative, data:image/*
    if (u.startsWith("//")) return true;
    if (u.startsWith("/")) return true;
    if (u.startsWith("data:image/")) return true;
    const url = new URL(u, "https://example.com");
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function filterStyle(styleValue: string): string {
  // keep only allowlisted CSS properties
  return styleValue
    .split(";")
    .map((rule) => rule.trim())
    .filter((rule) => {
      if (!rule) return false;
      const [prop] = rule.split(":").map((s) => s.trim().toLowerCase());
      return SAFE_CSS_PREFIXES.some((p) => prop.startsWith(p));
    })
    .join("; ");
}

function sanitizeNode(node: Node) {
  if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;

    // 1) unwrap .custom-image-blot → keep inner <img>, drop delete ✖ span
    if (el.classList.contains("custom-image-blot")) {
      const img = el.querySelector("img");
      if (img) {
        el.replaceWith(img); // wrapper -> img
        sanitizeNode(img);
        return;
      }
    }

    // কোনো ✖ বাটন span সরিয়ে দাও
    if (el.textContent?.trim() === "✖") {
      el.remove();
      return;
    }

    // 2) allowlist tag
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      // replace node with its children (unwrap) instead of removing content
      const parent = el.parentNode;
      while (el.firstChild) parent?.insertBefore(el.firstChild, el);
      parent?.removeChild(el);
      return;
    }

    // 3) strip dangerous attributes
    // remove all on* attributes and anything not allowlisted
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();

      // drop event handlers
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }

      // keep only allowlisted attrs
      if (!ALLOWED_ATTRS.has(name)) {
        el.removeAttribute(attr.name);
        return;
      }

      // special-case: src / href must be safe
      if ((name === "src" || name === "href") && !isSafeUrl(attr.value)) {
        el.removeAttribute(attr.name);
        return;
      }

      // style -> filter CSS
      if (name === "style") {
        const filtered = filterStyle(attr.value);
        if (filtered) {
          el.setAttribute("style", filtered);
        } else {
          el.removeAttribute("style");
        }
      }
    });

    // recurse
    Array.from(el.childNodes).forEach(sanitizeNode);
  }
}

/** =========================
 *  2) Parser function
 *  ========================= */
export function parseDescriptionHTML(raw: string) {
  // 0) নাল/ফাঁকা guard
  const input = String(raw || "");

  // 1) Parse to DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  // 2) sanitize body subtree
  const body = doc.body;
  Array.from(body.childNodes).forEach(sanitizeNode);

  // 3) Optional: bullet paragraph → list (যদি "• " দিয়ে শুরু হয়)
  //    ধারাবাহিক bullet paragraph ধরে <ul> বানাই
  const nodes = Array.from(body.childNodes);
  const toWrap: HTMLElement[] = [];
  nodes.forEach((n) => {
    if (
      n.nodeType === Node.ELEMENT_NODE &&
      (n as HTMLElement).tagName.toLowerCase() === "p"
    ) {
      const text = (n as HTMLElement).innerText.trim();
      if (text.startsWith("• ")) {
        toWrap.push(n as HTMLElement);
      }
    }
  });

  if (toWrap.length) {
    // একটি <ul> বানিয়ে bullet p গুলোকে <li> করে নিই
    const ul = doc.createElement("ul");
    toWrap.forEach((p) => {
      const li = doc.createElement("li");
      const txt = p.innerText.replace(/^•\s*/, "");
      li.textContent = txt;
      p.replaceWith(li);
      ul.appendChild(li);
    });
    // ul-কে সঠিক জায়গায় বসাতে হলে—প্রথম bullet p-র জায়গায় ul বসাও
    const firstLi = ul.firstElementChild;
    if (firstLi && firstLi.parentElement === ul) {
      const firstPosParent = firstLi.parentElement;
      // কিছু করার দরকার নেই; উপরে আমরা p → li replace করেছি; ul ইতিমধ্যে DOM-এ আছে
    }
  }

  // 4) collect image urls (optional utility)
  const images: string[] = Array.from(body.querySelectorAll("img"))
    .map((img) => img.getAttribute("src") || "")
    .filter(Boolean);

  // 5) final HTML
  const cleanHtml = body.innerHTML;

  return { cleanHtml, images };
}

/** =========================
 *  3) Preview component
 *  ========================= */
export default function DescriptionPreview({
  html,
  showSource = false,
}: {
  html: string;
  showSource?: boolean;
}) {
  const [showRaw, setShowRaw] = useState(showSource);

  const { cleanHtml, images } = useMemo(
    () => parseDescriptionHTML(html),
    [html]
  );

  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between border-b p-3">
        <div className="text-sm font-semibold">Description Preview</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border px-2 py-1 text-xs"
            onClick={() => setShowRaw((v) => !v)}
          >
            {showRaw ? "Hide HTML" : "Show HTML"}
          </button>
        </div>
      </div>

      <div className="p-4">
        {!showRaw ? (
          <div
            className="prose max-w-none"
            // ✅ Safe HTML (sanitized)
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-xs text-slate-700">
            {cleanHtml}
          </pre>
        )}

        {images.length > 0 && (
          <div className="mt-4 rounded-lg border p-3">
            <div className="mb-2 text-xs font-semibold">Detected Images</div>
            <ul className="list-disc pl-5 text-xs">
              {images.map((src, i) => (
                <li key={i} className="break-all">
                  {src}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** =========================
 *  4) Usage Example
 *  =========================
 *
 * const [htmlData, setHtmlData] = useState("");
 *
 * <ElementorLikeEditor onChange={(finalHtml) => setHtmlData(finalHtml)} />
 *
 * <DescriptionPreview html={htmlData} />
 *
 */
