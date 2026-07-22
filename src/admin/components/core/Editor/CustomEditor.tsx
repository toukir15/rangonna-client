/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ToastService } from "@admin/utils/toastr.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Alert from "../Aleart/Aleart";
import Button from "../Button/Button";
import Icon from "../Icon/Icon";
import GallerySkeleton from "@admin/components/Skeleton/Purchase/gallerySkeleton";
import dynamic from "next/dynamic";
import "quill/dist/quill.snow.css";
import { stripTrailingEmptyQuillParagraphs } from "@admin/utils/stripTrailingEmptyQuillParagraphs";

const RichTextEditor = dynamic(
  () => import("@admin/components/core/Editor/RichTextEditor"),
  { ssr: false },
);

type AlignType = "left" | "center" | "right" | "justify";
type BlockType = "paragraph" | "image" | "heading" | "list" | "video" | "faq";

interface VideoBlock extends BaseBlock {
  type: "video";
  url: string;
  autoplay?: boolean;
  width?: number;
}

interface BaseBlock {
  id: string;
  type: BlockType;
  align?: AlignType;
}

interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  text: string;
  /** Raw Quill HTML used only inside the editor to avoid cursor/Enter glitches */
  editorHtml?: string;
  html?: string;
}

type ImageItem = {
  _id?: string;
  src: string;
  alt?: string;
  width?: number | null;
  align?: AlignType;
};

interface ImageBlock extends BaseBlock {
  type: "image";
  images: ImageItem[];
}

interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4;
  text?: string;
  html?: string;
  color?: string;
}

interface ListBlock extends BaseBlock {
  type: "list";
  items: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlock extends BaseBlock {
  type: "faq";
  items: FaqItem[];
}

const FAQ_SECTION_TITLE = "Frequently Asked Questions (FAQ)";

type Block =
  | ParagraphBlock
  | ImageBlock
  | HeadingBlock
  | ListBlock
  | VideoBlock
  | FaqBlock;

const uid = () => Math.random().toString(36).slice(2, 10);

/** ========== Utils ========== */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function styleTextAlign(align?: AlignType): string {
  if (!align || align === "left") return "";
  return ` style="text-align:${align}"`;
}

function styleTextAlignAndColor(align?: AlignType, color?: string): string {
  const styles: string[] = [];
  if (align && align !== "left") styles.push(`text-align:${align}`);
  if (color) styles.push(`color:${color}`);
  return styles.length ? ` style="${styles.join(";")}"` : "";
}

function buildHeadingHTML(
  level: 1 | 2 | 3 | 4,
  text: string,
  align?: AlignType,
) {
  return `<h${level}${styleTextAlignAndColor(align)}>${escapeHtml(text)}</h${level}>`;
}

function buildHeadingHTMLWithColor(
  level: 1 | 2 | 3 | 4,
  text: string,
  align?: AlignType,
  color?: string,
) {
  return `<h${level}${styleTextAlignAndColor(align, color)}>${escapeHtml(text)}</h${level}>`;
}

function extractFirstImgSrcFromHtml(html: string): string | null {
  const m = html?.match(/<img[^>]+src=(?:"|')([^"]+?)(?:"|')[^>]*>/i);
  const src = m ? m[1] : null;
  return src && /^https?:\/\//.test(src) ? src : null;
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

  .editor-preview img {
    display: inline-block;
    margin: 1rem 0;
    border-radius: 12px;
    max-width: 100%;
    height: auto;
  }

  /* Only top-level blocks — do not style inside .ql-editor (Quill snow.css handles that). */
  .editor-preview > h1,
  .editor-preview > h2,
  .editor-preview > h3,
  .editor-preview > h4,
  .editor-preview > ul,
  .editor-preview > ol {
    margin-bottom: 10px;
  }

  .editor-preview > h1 {
    font-size: 2rem;
    margin: 0.5rem 0 0.75rem;
    font-weight: 800;
    margin-bottom: 40px;
    line-height: 1.4;
  }

  .editor-preview > h2 {
    font-size: 1.5rem;
    margin: 0.5rem 0 0.5rem;
    font-weight: 700;
    margin-bottom: 30px;
    line-height: 1.4;
  }

  .editor-preview > h3 {
    font-size: 1.25rem;
    margin: 0.75rem 0 0.5rem;
    font-weight: 700;
    margin-bottom: 30px;
    line-height: 1.4;
  }

  .editor-preview > h4 {
    font-size: 1.1rem;
    margin: 0.5rem 0 0.25rem;
    font-weight: 700;
    margin-bottom: 30px;
    line-height: 1.4;
  }

  .editor-preview > ul {
    margin: 0.75rem 0 0.75rem 1.25rem;
    list-style: disc;
    padding-left: 1.25rem;
  }

  .editor-preview .editor-paragraph-block {
    margin: 0.75rem 0;
  }

  .editor-preview .editor-paragraph-block .ql-editor {
    min-height: 0;
    padding: 6px 0;
  }

  /* Quill toolbar alignment (preview + export); inline style on .ql-editor sets block default. */
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

  .editor-preview a {
    color: #2563eb;
    text-decoration: underline;
  }
  
  .editor-preview iframe {
    display: inline-block;
    width: auto;
    max-width: 100%;
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

  .editor-preview .editor-faq-block {
    margin: 1.5rem 0;
  }

  .editor-preview .editor-faq-block > h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 1.25rem;
    line-height: 1.4;
  }

  .editor-preview .editor-faq-item {
    margin-bottom: 1.25rem;
  }

  .editor-preview .editor-faq-question {
    margin: 0 0 0.35rem;
    font-weight: 600;
  }

  .editor-preview .editor-faq-answer {
    margin: 0;
    line-height: 1.6;
  }
`;

function htmlToEditorText(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");
  return temp.textContent || "";
}

function getNodeTextWithBreaks(node: Element): string {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.innerHTML = clone.innerHTML.replace(/<br\s*\/?>/gi, "\n");
  return clone.textContent || "";
}

function parsePixelWidth(styleValue?: string | null): number | null {
  if (!styleValue) return null;
  const m = styleValue.match(/^\s*(\d+(?:\.\d+)?)px\s*$/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function extractImagesFromNode(node: Element): ImageItem[] {
  const imgs = Array.from(node.querySelectorAll("img")) as HTMLImageElement[];
  if (imgs.length === 0) return [];

  const fallbackAlign =
    ((node as HTMLElement).style.textAlign as AlignType) || "center";

  return imgs
    .map((img) => {
      const src = img.getAttribute("src") || "";
      if (!src) return null;
      const widthFromStyle = parsePixelWidth((img as HTMLElement).style.width);
      const width = widthFromStyle ?? (img.width ? Number(img.width) : null);
      return {
        src,
        alt: img.alt || "",
        width,
        align: fallbackAlign,
      } as ImageItem;
    })
    .filter(Boolean) as ImageItem[];
}

function isImageWrapperNode(node: Element): boolean {
  const imgs = node.querySelectorAll("img");
  if (imgs.length === 0) return false;
  // Treat a node as "image wrapper" when it doesn't contain any meaningful text.
  const text = (node.textContent || "").replace(/\u00a0/g, " ").trim();
  return text.length === 0;
}

function parseHTMLToBlocks(html: string): Block[] {
  const temp = document.createElement("div");
  temp.innerHTML = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  const arr: Block[] = [];
  const children = Array.from(temp.children);

  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const tag = node.tagName.toLowerCase();

    if (/^h[1-4]$/.test(tag)) {
      const el = node as HTMLElement;
      arr.push({
        id: uid(),
        type: "heading",
        level: Number(tag.replace("h", "")) as 1 | 2 | 3 | 4,
        text: getNodeTextWithBreaks(node),
        html: node.outerHTML,
        align: (el.style.textAlign as AlignType) || "left",
        color: el.style.color || undefined,
      });
      continue;
    }

    if (
      tag === "div" &&
      (node as HTMLElement).classList.contains("editor-paragraph-block")
    ) {
      const el = node as HTMLElement;
      const qlEditor = el.querySelector(".ql-editor") as HTMLElement | null;
      const inner = qlEditor ? qlEditor.innerHTML : el.innerHTML;
      const alignRaw =
        (qlEditor?.style?.textAlign as string) ||
        (el as HTMLElement).style?.textAlign ||
        "";
      const align = (alignRaw || "left") as AlignType;
      arr.push({
        id: uid(),
        type: "paragraph",
        text: getNodeTextWithBreaks(node),
        editorHtml: inner,
        html: inner,
        align,
      });
      continue;
    }

    if (tag === "p") {
      arr.push({
        id: uid(),
        type: "paragraph",
        text: getNodeTextWithBreaks(node),
        editorHtml: node.outerHTML,
        html: node.outerHTML,
        align: ((node as HTMLElement).style.textAlign as AlignType) || "left",
      });
      continue;
    }

    if (tag === "ul") {
      arr.push({
        id: uid(),
        type: "list",
        items: Array.from(node.querySelectorAll("li")).map(
          (li) => li.textContent || "",
        ),
        align: ((node as HTMLElement).style.textAlign as AlignType) || "left",
      });
      continue;
    }

    if (
      tag === "div" &&
      (node as HTMLElement).classList.contains("editor-faq-block")
    ) {
      const el = node as HTMLElement;
      const items: FaqItem[] = [];
      el.querySelectorAll(".editor-faq-item").forEach((item) => {
        const qEl = item.querySelector(".editor-faq-question");
        const aEl = item.querySelector(".editor-faq-answer");
        let question = (qEl?.textContent || "").trim();
        question = question.replace(/^\d+\.\s*/, "");
        const answer = (aEl?.textContent || "").trim();
        items.push({ question, answer });
      });
      arr.push({
        id: uid(),
        type: "faq",
        items: items.length ? items : [{ question: "", answer: "" }],
        align: (el.style.textAlign as AlignType) || "left",
      });
      continue;
    }

    // Group consecutive image wrappers into a single image block so that
    // multi-image sections don't split into multiple sections after reload.
    if (isImageWrapperNode(node)) {
      const images: ImageItem[] = [];
      let groupAlign: AlignType = (((node as HTMLElement).style
        .textAlign as AlignType) || "center") as AlignType;

      for (let j = i; j < children.length; j++) {
        const n = children[j];
        if (!isImageWrapperNode(n)) break;
        groupAlign = (((n as HTMLElement).style.textAlign as AlignType) ||
          groupAlign ||
          "center") as AlignType;
        images.push(...extractImagesFromNode(n));
        i = j; // advance outer loop
      }

      if (images.length > 0) {
        arr.push({
          id: uid(),
          type: "image",
          images,
          align: groupAlign || "center",
        });
        continue;
      }
    }

    const img = node.querySelector("img") as HTMLImageElement | null;
    if (img) {
      arr.push({
        id: uid(),
        type: "image",
        images: [
          {
            src: img.getAttribute("src") || "",
            alt: img.alt || "",
            width: img.width || null,
            align:
              ((node as HTMLElement).style.textAlign as AlignType) || "center",
          },
        ],
        align: ((node as HTMLElement).style.textAlign as AlignType) || "center",
      });
      continue;
    }

    const iframe = node.querySelector("iframe") as HTMLIFrameElement | null;
    if (iframe) {
      arr.push({
        id: uid(),
        type: "video",
        url: iframe.getAttribute("src") || "",
        autoplay: iframe.src.includes("autoplay=1"),
        align: ((node as HTMLElement).style.textAlign as AlignType) || "center",
        width: iframe.width ? Number(iframe.width) : undefined,
      });
      continue;
    }
  }

  return arr;
}

function getMediaUrl(url?: string): string {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_IMAGE_URL || process.env.NEXT_PUBLIC_API_URL || "";

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function blockToHTML(block: Block): string {
  switch (block.type) {
    case "paragraph": {
      const b = block as ParagraphBlock;
      let inner =
        b.html?.trim() ||
        (b.text ? `<p>${escapeHtml(b.text)}</p>` : "<p><br></p>");
      inner = stripTrailingEmptyQuillParagraphs(inner);
      if (!inner) inner = "<p><br></p>";
      const blockAlignAttr = b.align || "left";
      return `<div class="editor-paragraph-block ql-snow"><div class="ql-editor" style="text-align:${blockAlignAttr}">${inner}</div></div>`;
    }

    case "heading": {
      const b = block as HeadingBlock;
      return b.html || buildHeadingHTML(b.level, b.text || "", b.align);
    }

    case "list": {
      const b = block as ListBlock;
      const items = b.items.map((it) => `<li>${escapeHtml(it)}</li>`).join("");
      return `<ul${styleTextAlign(b.align)}>${items}</ul>`;
    }

    case "image": {
      const b = block as ImageBlock;
      if (!b.images?.length) return "";

      return b.images
        .map((img) => {
          const src = getMediaUrl(img.src);
          const alt = img.alt ? escapeHtml(img.alt) : "";
          const align = img.align || b.align || "center";

          const widthStyle = img.width
            ? `width:${img.width}px; max-width:100%;`
            : `max-width:100%;`;

          return `
        <div style="text-align:${align}; margin:16px 0;">
          <img
            src="${escapeHtml(src)}"
            alt="${alt}"
            style="${widthStyle} height:auto; display:inline-block; border-radius:12px;"
          />
        </div>
      `;
        })
        .join("\n");
    }

    case "video": {
      const b = block as VideoBlock;
      if (!b.url) return "";

      const align = b.align || "center";
      const embedUrl = getEmbedUrl(b.url, b.autoplay);
      const widthStyle =
        align === "left"
          ? `width:100%; max-width:100%;`
          : b.width
            ? `width:${b.width}px; max-width:100%;`
            : `width:100%; max-width:640px;`;

      return `
    <div style="text-align:${align}; margin:16px 0;">
      <iframe
        src="${escapeHtml(embedUrl)}"
        style="${widthStyle} display:inline-block; aspect-ratio:16/9; border:0; border-radius:12px;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  `;
    }

    case "faq": {
      const b = block as FaqBlock;
      const itemsHtml = b.items
        .filter((item) => item.question.trim() || item.answer.trim())
        .map((item, i) => {
          const num = i + 1;
          const q = escapeHtml(item.question.trim());
          const a = escapeHtml(item.answer.trim());
          return `
    <div class="editor-faq-item">
      <p class="editor-faq-question"><strong>${num}. ${q}</strong></p>
      <p class="editor-faq-answer">${a}</p>
    </div>`;
        })
        .join("\n");

      if (!itemsHtml) return "";

      return `
<div class="editor-faq-block"${styleTextAlign(b.align)}>
  <h2>${escapeHtml(FAQ_SECTION_TITLE)}</h2>
  ${itemsHtml}
</div>`;
    }

    default:
      return "";
  }
}

/** ========== Palette ========== */
const PALETTE: Array<{
  key: string;
  label: string;
  create: () => Block;
  tags: string[];
}> = [
  {
    key: "p",
    label: "Paragraph",
    tags: ["paragraph", "text", "content", "heading", "list", "rich"],
    create: () => ({
      id: uid(),
      type: "paragraph",
      text: "",
      html: "<p><br></p>",
      align: "left",
    }),
  },
  {
    key: "img",
    label: "Image (Multi)",
    tags: ["image", "photo", "media", "upload"],
    create: () => ({
      id: uid(),
      type: "image",
      images: [],
      align: "center",
    }),
  },
  {
    key: "faq",
    label: "FAQ",
    tags: ["faq", "question", "answer", "qna"],
    create: () => ({
      id: uid(),
      type: "faq",
      items: [{ question: "", answer: "" }],
      align: "left",
    }),
  },
  {
    key: "h1",
    label: "Heading 1",
    tags: ["heading", "title", "h1"],
    create: () => ({
      id: uid(),
      type: "heading",
      level: 1,
      text: "Heading 1",
      html: buildHeadingHTMLWithColor(1, "Heading 1", "left", undefined),
      align: "left",
      color: undefined,
    }),
  },
  {
    key: "h2",
    label: "Heading 2",
    tags: ["heading", "subtitle", "h2"],
    create: () => ({
      id: uid(),
      type: "heading",
      level: 2,
      text: "Heading 2",
      html: buildHeadingHTMLWithColor(2, "Heading 2", "left", undefined),
      align: "left",
      color: undefined,
    }),
  },
  {
    key: "h3",
    label: "Heading 3",
    tags: ["heading", "subtitle", "h3"],
    create: () => ({
      id: uid(),
      type: "heading",
      level: 3,
      text: "Heading 3",
      html: buildHeadingHTMLWithColor(3, "Heading 3", "left", undefined),
      align: "left",
      color: undefined,
    }),
  },

  // {
  //   key: "ul",
  //   label: "List (UL)",
  //   tags: ["list", "bullet", "ul", "li"],
  //   create: () => ({
  //     id: uid(),
  //     type: "list",
  //     items: ["First item", "Second item", "Third item"],
  //     align: "left",
  //   }),
  // },
  {
    key: "video",
    label: "Video Embed",
    tags: ["video", "youtube", "vimeo", "embed"],
    create: () => ({
      id: uid(),
      type: "video",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      autoplay: false,
      align: "center",
    }),
  },
];

function getEmbedUrl(url: string, autoplay = false): string {
  if (!url) return "";
  let embedUrl = url.trim();

  if (embedUrl.includes("youtube.com/watch?v=")) {
    const id = embedUrl.split("v=")[1]?.split("&")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (embedUrl.includes("youtu.be/")) {
    const id = embedUrl.split("youtu.be/")[1]?.split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  } else if (embedUrl.includes("vimeo.com/")) {
    const id = embedUrl.split("vimeo.com/")[1]?.split("?")[0];
    embedUrl = `https://player.vimeo.com/video/${id}`;
  }

  if (autoplay) {
    embedUrl += embedUrl.includes("?") ? "&autoplay=1" : "?autoplay=1";
  }

  return embedUrl;
}

async function fetchGalleryImages(
  currentPage: number,
  productPerPage: number,
): Promise<{
  images: Array<{ _id?: string; url: string; alt?: string }>;
  meta: any;
}> {
  try {
    const res = await productService.getGalleryImage({
      page: currentPage,
      limit: productPerPage,
    });

    if (res?.success) {
      const images = res?.data?.data || [];
      const meta = res?.data?.meta || {};
      const formattedImages = images.map((img: any) => ({
        _id: img._id,
        url: img.src,
        alt: img.title || "",
      }));
      return { images: formattedImages, meta };
    } else {
      ToastService.error(res?.message);
      return { images: [], meta: {} };
    }
  } catch (err) {
    console.error("Gallery fetch error:", err);
    return { images: [], meta: {} };
  }
}

/** ========== Gallery Modal ========== */
function GalleryModal({
  open,
  onClose,
  onSelectMany,
  version,
}: {
  open: boolean;
  onClose: () => void;
  onSelectMany: (
    items: Array<{ _id?: string; url: string; alt?: string }>,
  ) => void;
  version?: number;
}) {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<
    Array<{ _id?: string; url: string; alt?: string }>
  >([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [productPerPage, setProductPerPage] = useState<number>(
    Number(
      typeof window !== "undefined"
        ? localStorage.getItem("GallaryPerPage") || 10
        : 10,
    ),
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const totalPages = Math.ceil(totalRecords / productPerPage);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<any>();

  const handleProductPerPageChange = (newPerPage: number) => {
    setProductPerPage(newPerPage);
    if (typeof window !== "undefined") {
      localStorage.setItem("GallaryPerPage", newPerPage.toString());
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    setSelected({});
  }, [version]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const { images, meta } = await fetchGalleryImages(
          currentPage,
          productPerPage,
        );
        setList(images || []);
        setTotalRecords(meta?.total_record || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, currentPage, productPerPage]);

  const toggle = (key: string) =>
    setSelected((p) => ({ ...p, [key]: !p[key] }));

  const pickedKeys = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [selected],
  );

  async function onUploadLocal(files?: FileList | null) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).slice(0, 10);
    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      fileArray.forEach((img) => formData.append("images", img));
      const res = await productService.createGallery(formData, (percent) => {
        setProgress(percent);
      });

      if (res?.success) {
        ToastService.success(res?.message);
        const { images, meta } = await fetchGalleryImages(
          currentPage,
          productPerPage,
        );
        setList(images || []);
        setTotalRecords(meta?.total_record || 0);
        setSelected({});
      } else {
        ToastService.error(res?.message || "Upload failed!");
      }
    } catch (err: any) {
      ToastService.error(err.message || "Something went wrong!");
    } finally {
      setUploading(false);
      setProgress(100);
    }
  }

  if (!open) return null;

  const handleRemove = () => {
    const idsToDelete = list
      .filter((img) => pickedKeys.includes(img._id || ""))
      .map((img) => img._id)
      .filter(Boolean) as string[];

    if (!idsToDelete.length) {
      ToastService.warning("Please select at least one image to delete.");
      return;
    }

    setRemove(idsToDelete);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    if (!remove?.length) return;
    setIsAlertOpen(false);

    try {
      const res = await productService.deleteGalleryImage(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        const { images, meta } = await fetchGalleryImages(
          currentPage,
          productPerPage,
        );
        setList(images || []);
        setTotalRecords(meta?.total_record || 0);
        setSelected({});
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      >
        <h3 className="text-xl font-semibold mb-2">Confirm Delete</h3>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete {remove?.length || 0} image(s)?
        </p>
        <div className="flex justify-center">
          <Icon name="delete" size={80} className="text-red-400" />
        </div>
      </Alert>

      <div className="w-[min(960px,95vw)] overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-3">
          <div className="font-semibold">Gallery</div>
          {pickedKeys.length ? (
            <Button
              type="button"
              disabled={pickedKeys.length === 0}
              onClick={handleRemove}
              className="!px-3 !py-1 bg-red-600 text-white rounded-md text-sm"
            >
              Delete Selected
            </Button>
          ) : null}
          <Icon
            name="close"
            size={30}
            className="text-gray-400 cursor-pointer"
            onClick={onClose}
          />
        </div>

        <div className="p-3 border-b">
          <div className="mb-2 text-sm font-medium text-slate-700">
            Upload (local)
          </div>
          <label
            htmlFor="gallery-upload"
            className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all
              ${uploading ? "opacity-70 border-slate-300 bg-slate-50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50/30"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-slate-400 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 10.5l4.5-4.5m0 0l4.5 4.5m-4.5-4.5V18"
              />
            </svg>
            {uploading ? (
              <div className="w-full mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1 text-center font-medium">
                  Uploading… {progress}%
                </p>
              </div>
            ) : (
              <span className="text-sm text-slate-600 font-medium text-center">
                Click or drag up to 10 images to upload
              </span>
            )}
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => onUploadLocal(e.target.files)}
            />
          </label>
          <p className="mt-2 text-xs text-slate-500 text-center">
            You can upload multiple images (max 10) • JPG, PNG, WEBP supported
          </p>
        </div>

        <div className="p-3 overflow-auto" style={{ maxHeight: "50vh" }}>
          {loading ? (
            <GallerySkeleton />
          ) : list.length === 0 ? (
            <div className="text-sm text-slate-500">No images found.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {list.map((img) => {
                const key = (img._id as string) || img.url;
                const isSel = !!selected[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`relative overflow-hidden rounded-xl border hover:shadow ${isSel ? "ring-2 ring-blue-500" : "border-slate-200"}`}
                    title={img.alt || img.url}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="w-full h-60 object-cover"
                    />
                    {isSel && (
                      <div className="absolute inset-0 bg-blue-500/20" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 border-t">
          <div className="text-xs text-slate-500">
            Selected: <b>{pickedKeys.length}</b>
          </div>
          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalRecords}
            className="mt-0"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm"
              onClick={() => setSelected({})}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              disabled={pickedKeys.length === 0}
              onClick={() => {
                const pickedItems = list
                  .filter((i) =>
                    pickedKeys.includes((i._id as string) || i.url),
                  )
                  .map((i) => ({ _id: i._id, url: i.url, alt: i.alt }));
                onSelectMany(pickedItems);
                onClose();
              }}
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ========== Main Component ========== */
export default function CustomEditor({
  onChange,
  initialHtml = "",
}: {
  onChange?: (finalHtml: string) => void;
  initialHtml?: string;
}) {
  const defaultAlignForBlock = (b: Block): AlignType => {
    if (b.type === "paragraph" || b.type === "heading") return "left";
    if (b.type === "image") return "center";
    return "left";
  };

  // hello

  const didApplyDefaultAlignRef = useRef(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [customCss] = useState(DEFAULT_CSS);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryVersion, setGalleryVersion] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [openAddMenuId, setOpenAddMenuId] = useState<string | null>(null);
  const addSectionMenuRef = useRef<HTMLDivElement | null>(null);

  // Refs for debouncing
  const saveParagraphTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousHtmlRef = useRef<string>("");

  // image refs for resize
  const imgRefs = useRef<Record<string, HTMLImageElement | null>>({});
  const resizingRef = useRef<{
    blockId: string | null;
    imgKey: string | null;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
    ratio: number;
    active: boolean;
  }>({
    blockId: null,
    imgKey: null,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    ratio: 1,
    active: false,
  });

  // Video resize refs
  const videoResizeRef = useRef<{
    blockId: string | null;
    startX: number;
    startWidth: number;
    active: boolean;
  }>({
    blockId: null,
    startX: 0,
    startWidth: 0,
    active: false,
  });

  const dragFrom = useRef<{ kind: "palette" | "board"; payload: any } | null>(
    null,
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveParagraphTimeoutRef.current) {
        clearTimeout(saveParagraphTimeoutRef.current);
      }
    };
  }, []);

  // Close "Add Section" dropdown when clicking outside
  useEffect(() => {
    if (!openAddMenuId) return;

    const onPointerDownCapture = (e: Event) => {
      const el = addSectionMenuRef.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return;
      setOpenAddMenuId(null);
    };

    window.addEventListener("pointerdown", onPointerDownCapture, true);
    return () =>
      window.removeEventListener("pointerdown", onPointerDownCapture, true);
  }, [openAddMenuId]);

  // Debounced save paragraph function
  function saveParagraph(blockId: string, html: string) {
    if (saveParagraphTimeoutRef.current) {
      clearTimeout(saveParagraphTimeoutRef.current);
    }

    saveParagraphTimeoutRef.current = setTimeout(() => {
      const text = htmlToEditorText(html);

      // Keep Quill HTML as-is (headings, lists, bold, multiple <p>, tables) — the old
      // "merge all <p> into one" step stripped bullets and structure.
      const normalizeParagraphHtml = (rawHtml: string) => {
        if (typeof document === "undefined") {
          const safe = escapeHtml(text).replace(/\n/g, "<br>");
          return `<p>${safe}</p>`;
        }
        const trimmed = (rawHtml || "").trim();
        if (!trimmed || trimmed === "<p></p>") {
          return "<p><br></p>";
        }
        return trimmed;
      };

      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
                ...(b as ParagraphBlock),
                text,
                editorHtml: html,
                html: normalizeParagraphHtml(html),
              }
            : b,
        ),
      );
    }, 100);
  }

  function saveHeading(blockId: string, value: string) {
    const hb = blocks.find((b) => b.id === blockId) as HeadingBlock;
    const safeHTML = escapeHtml(value).replace(/\n/g, "<br>");
    const html = `<h${hb.level}${styleTextAlignAndColor(hb.align, hb.color)}>${safeHTML}</h${hb.level}>`;

    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...(b as HeadingBlock),
              text: value,
              html,
            }
          : b,
      ),
    );
  }

  function setAlign(blockId: string, align: AlignType) {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        if (b.type === "paragraph") {
          const pb = b as ParagraphBlock;
          return { ...pb, align };
        }
        if (b.type === "heading") {
          const hb = b as HeadingBlock;
          const text = hb.text ?? "";
          return {
            ...hb,
            align,
            html: buildHeadingHTMLWithColor(hb.level, text, align, hb.color),
          };
        }
        return { ...b, align };
      }),
    );
  }

  function deleteBlockById(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedId === blockId) {
      setSelectedId(null);
      setSelectedImageIds([]);
    }
    setGalleryVersion((v) => v + 1);
    ToastService.success(`Block with ID "${blockId}" deleted`);
  }

  function startInlineEdit(blockId: string) {
    setSelectedId(blockId);
    setEditingId(blockId);
  }

  function stopInlineEdit() {
    setEditingId(null);
  }

  const selected = useMemo(
    () => blocks.find((b) => b.id === selectedId) || null,
    [blocks, selectedId],
  );

  useEffect(() => {
    if (!selected || selected.type !== "image") {
      setSelectedImageIds([]);
    }
  }, [selectedId, selected]);

  useEffect(() => {
    if (!isInitialized && initialHtml) {
      try {
        const parsed = parseHTMLToBlocks(initialHtml);
        setBlocks(parsed);
        setIsInitialized(true);
      } catch (err) {
        console.error("Failed to parse initial HTML:", err);
      }
    }
  }, [initialHtml, isInitialized]);

  // One-time migration: ensure heading/paragraph defaults are actually stored as "justify"
  useEffect(() => {
    if (didApplyDefaultAlignRef.current) return;
    if (!blocks.length) return;
    didApplyDefaultAlignRef.current = true;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.align) return b;
        const align = defaultAlignForBlock(b);
        if (b.type === "heading") {
          const hb = b as HeadingBlock;
          const text = hb.text || "";
          return {
            ...hb,
            align,
            html: buildHeadingHTMLWithColor(hb.level, text, align, hb.color),
          } as HeadingBlock;
        }
        if (b.type === "paragraph") {
          const pb = b as ParagraphBlock;
          const text = pb.text || "";
          return {
            ...pb,
            align,
            html:
              pb.html || (text ? `<p>${escapeHtml(text)}</p>` : "<p><br></p>"),
          } as ParagraphBlock;
        }
        if (b.type === "image") {
          return { ...(b as ImageBlock), align } as ImageBlock;
        }
        return { ...b, align } as Block;
      }),
    );
  }, [blocks, defaultAlignForBlock]);

  const inner = useMemo(() => blocks.map(blockToHTML).join("\n"), [blocks]);
  const htmlOutput = useMemo(
    () => `<style>${customCss}</style>\n${inner}`,
    [inner, customCss],
  );

  useEffect(() => {
    if (onChange && htmlOutput !== previousHtmlRef.current) {
      previousHtmlRef.current = htmlOutput;
      onChange?.(htmlOutput);
    }
  }, [htmlOutput, onChange]);

  // DnD helpers
  function onBoardDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function onBoardDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!dragFrom.current) return;
    const d = dragFrom.current;
    const board = e.currentTarget.closest(".board-container") as HTMLElement;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const blocksEls = Array.from(board.querySelectorAll("[data-block-id]"));
    let dropIndex = blocksEls.length;
    for (let i = 0; i < blocksEls.length; i++) {
      const el = blocksEls[i] as HTMLElement;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2 - rect.top) {
        dropIndex = i;
        break;
      }
    }

    if (d.kind === "palette") {
      const created = (d.payload as (typeof PALETTE)[number]).create();
      setBlocks((prev) => {
        const copy = [...prev];
        copy.splice(dropIndex, 0, created);
        return copy;
      });
      setSelectedId(created.id);
      setEditingId(
        created.type === "image" || created.type === "faq" ? null : created.id,
      );
      setSelectedImageIds([]);
    } else if (d.kind === "board") {
      const dragId = d.payload as string;
      setBlocks((prev) => {
        const copy = [...prev];
        const fromIdx = copy.findIndex((b) => b.id === dragId);
        if (fromIdx === -1) return prev;
        const [moved] = copy.splice(fromIdx, 1);
        copy.splice(dropIndex, 0, moved);
        return copy;
      });
    }
    dragFrom.current = null;
  }

  useEffect(() => {
    function onGlobalPaste(e: ClipboardEvent) {
      if (!selectedId) return;
      const blk = blocks.find((b) => b.id === selectedId);
      if (!blk || blk.type !== "image") return;
      const dt = e.clipboardData;
      if (!dt) return;
      const html = dt.getData("text/html");
      const hostedFromHtml = extractFirstImgSrcFromHtml(html);
      const text = dt.getData("text/plain");
      const hostedFromText = text && /^https?:\/\//.test(text) ? text : null;
      const finalSrc = hostedFromHtml || hostedFromText;
      if (!finalSrc) return;
      e.preventDefault();
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.id !== selectedId || b.type !== "image") return b;
          const ib = b as ImageBlock;
          return {
            ...ib,
            images: [
              ...ib.images,
              { src: finalSrc, alt: "Pasted image", width: null },
            ],
          };
        }),
      );
      setTimeout(() => setEditingId(null), 0);
    }
    window.addEventListener("paste", onGlobalPaste);
    return () => window.removeEventListener("paste", onGlobalPaste);
  }, [selectedId, blocks]);

  return (
    <div className="min-h-auto mt-4">
      <div className="mx-auto grid grid-cols-1 gap-4">
        {/* LEFT: Main board */}
        <div className="w-full">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Main Board</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreview((v) => !v)}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              >
                {isPreview ? "Exit Preview" : "Preview"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBlocks([]);
                  setSelectedId(null);
                  setEditingId(null);
                  setSelectedImageIds([]);
                  setGalleryVersion((v) => v + 1);
                }}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 hover:bg-rose-100"
              >
                Clear
              </button>
            </div>
          </div>

          {!isPreview ? (
            <div
              onDragOver={onBoardDragOver}
              onDrop={(e) => onBoardDrop(e)}
              className="board-container rounded-2xl border border-dashed border-slate-300 bg-white p-4 min-h-[500px]"
            >
              <div className="space-y-3">
                {blocks.map((b, i) => (
                  <div key={b.id} data-block-id={b.id}>
                    {renderBlockView(b, i)}
                  </div>
                ))}
                <div
                  ref={addSectionMenuRef}
                  className="relative flex justify-center py-3"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAddMenuId((prev) =>
                        prev === "last" ? null : "last",
                      );
                    }}
                    className="flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span className="text-base leading-none">+</span>
                    Add Section
                  </button>
                  {openAddMenuId === "last" && (
                    <div className="absolute top-12 z-40 w-56 overflow-hidden rounded-xl border bg-white shadow-xl">
                      {PALETTE.map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const created = p.create();
                            setBlocks((prev) => [...prev, created]);
                            setSelectedId(created.id);
                            setSelectedImageIds([]);
                            setOpenAddMenuId(null);
                            setEditingId(
                              created.type === "image" || created.type === "faq"
                                ? null
                                : created.id,
                            );
                          }}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          <span>{p.label}</span>
                          <span className="text-xs text-blue-600">Add</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-6">
              <div
                className="editor-preview min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
              />
            </div>
          )}
        </div>
      </div>

      <GalleryModal
        open={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectMany={(items) => {
          if (!selectedId) return;
          setBlocks((prev) => {
            const newBlocks = prev.map((b) => {
              if (b.id !== selectedId || b.type !== "image") return b;
              const ib = b as ImageBlock;
              const existingKeys = new Set(
                ib.images.map((img) => img._id || img.src),
              );
              const newImages = items
                .filter((it) => !existingKeys.has(it._id || it.url))
                .map((it) => ({
                  _id: it._id,
                  src: it.url,
                  alt: it.alt?.trim() || "",
                  width: null,
                }));
              if (newImages.length > 0) {
                return { ...ib, images: [...ib.images, ...newImages] };
              }
              return ib;
            });
            return [...newBlocks];
          });
          setTimeout(() => {
            setSelectedId(selectedId);
            setEditingId(null);
          }, 100);
        }}
        version={galleryVersion}
      />
    </div>
  );

  // Helper functions for rendering
  function moveBlock(blockId: string, direction: "up" | "down") {
    setBlocks((prev) => {
      const currentIndex = prev.findIndex((b) => b.id === blockId);
      if (currentIndex === -1) return prev;
      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(currentIndex, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  }

  function onResizeMouseDown(
    blockId: string,
    imgKey: string,
    e: React.MouseEvent,
  ) {
    e.preventDefault();
    e.stopPropagation();
    const refKey = `${blockId}:${imgKey}`;
    const img = imgRefs.current[refKey];
    if (!img) return;
    const rectW = img.clientWidth || (img as any).width || 0;
    const rectH = img.clientHeight || (img as any).height || 0;
    const natW = img.naturalWidth || rectW || 1;
    const natH = img.naturalHeight || rectH || 1;
    const ratio = (rectW || natW) / (rectH || natH);
    resizingRef.current = {
      blockId,
      imgKey,
      startX: (e as any).clientX,
      startY: (e as any).clientY,
      startW: rectW || natW,
      startH: rectH || natH,
      ratio,
      active: true,
    };
    window.addEventListener("mousemove", onResizeMouseMove);
    window.addEventListener("mouseup", onResizeMouseUp);
    (document.body as any).style.cursor = "nwse-resize";
  }

  function onResizeMouseMove(e: MouseEvent) {
    const r = resizingRef.current;
    if (!r.active || !r.blockId || !r.imgKey) return;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    const proposeFromX = r.startW + dx;
    const proposeFromY = (r.startH + dy) * r.ratio;
    const newW = Math.max(60, Math.max(proposeFromX, proposeFromY));
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== r.blockId || b.type !== "image") return b;
        const ib = b as ImageBlock;
        const next = ib.images.map((img) => {
          const key = img._id || img.src;
          if (key !== r.imgKey) return img;
          return { ...img, width: Math.round(newW) };
        });
        return { ...ib, images: next };
      }),
    );
  }

  function onResizeMouseUp() {
    const r = resizingRef.current;
    if (!r.active) return;
    r.active = false;
    r.blockId = null;
    r.imgKey = null;
    (document.body as any).style.cursor = "";
    window.removeEventListener("mousemove", onResizeMouseMove);
    window.removeEventListener("mouseup", onResizeMouseUp);
  }

  function onResizeVideoMouseDown(blockId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const blk = blocks.find((b) => b.id === blockId) as VideoBlock;
    const currentWidth = (blk as any).width || 640;
    videoResizeRef.current = {
      blockId,
      startX: e.clientX,
      startWidth: currentWidth,
      active: true,
    };
    window.addEventListener("mousemove", onResizeVideoMouseMove);
    window.addEventListener("mouseup", onResizeVideoMouseUp);
    (document.body as any).style.cursor = "nwse-resize";
  }

  function onResizeVideoMouseMove(e: MouseEvent) {
    const ref = videoResizeRef.current;
    if (!ref.active || !ref.blockId) return;
    const dx = e.clientX - ref.startX;
    const newWidth = Math.max(200, ref.startWidth + dx);
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === ref.blockId ? { ...(b as VideoBlock), width: newWidth } : b,
      ),
    );
  }

  function onResizeVideoMouseUp() {
    const ref = videoResizeRef.current;
    ref.active = false;
    ref.blockId = null;
    (document.body as any).style.cursor = "";
    window.removeEventListener("mousemove", onResizeVideoMouseMove);
    window.removeEventListener("mouseup", onResizeVideoMouseUp);
  }

  function renderBlockView(block: Block, index: number) {
    const isSelected = selectedId === block.id;
    const isEditing = editingId === block.id;
    const blockAlign = (block.align ||
      defaultAlignForBlock(block)) as AlignType;

    const outerCls = [
      "group relative rounded-2xl border p-4 bg-white shadow-sm select-none ",
      isSelected ? "ring-2 ring-blue-500 border-blue-500" : "border-slate-200",
    ].join(" ");

    const moveButtons = (
      <div className="absolute -left-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-1 group-hover:flex">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            moveBlock(block.id, "up");
          }}
          disabled={index === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border bg-white text-slate-600 shadow hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          title="Move Up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            moveBlock(block.id, "down");
          }}
          disabled={index === blocks.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border bg-white text-slate-600 shadow hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          title="Move Down"
        >
          ↓
        </button>
      </div>
    );

    const dropZoneTop = (
      <div
        onDragOver={onBoardDragOver}
        onDrop={(e) => onBoardDrop(e)}
        className="h-3 -mt-1 -mb-1 rounded border-2 border-dashed border-transparent"
      />
    );
    const dropZoneBottom = (
      <div
        onDragOver={onBoardDragOver}
        onDrop={(e) => onBoardDrop(e)}
        className="h-3 -mt-1 -mb-1 rounded border-2 border-dashed border-transparent"
      />
    );

    const inlineAlignButton = (blockId: string, current?: AlignType) => (
      <div className="absolute left-1/2 top-2 z-10 hidden -translate-x-1/2 items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-xs shadow group-hover:flex">
        {(["left", "center", "right", "justify"] as AlignType[]).map((a) => (
          <button
            key={a}
            type="button"
            className={`rounded border px-2 py-0.5 hover:bg-slate-50 ${current === a ? "border-blue-500 text-blue-600" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setAlign(blockId, a);
            }}
            title={`Align ${a}`}
          >
            {a[0].toUpperCase()}
          </button>
        ))}
      </div>
    );

    function renderInlineEditor() {
      if (block.type === "heading") {
        const b = block as HeadingBlock;

        return (
          <div
            // className="rounded-lg border bg-white p-3"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <textarea
              autoFocus
              className="w-full resize-none rounded-lg border p-2 text-sm font-semibold outline-none focus:border-blue-500"
              rows={3}
              value={b.text || ""}
              onChange={(e) => saveHeading(b.id, e.target.value)}
            />

            <div className="flex items-center justify-between gap-3 border-t pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700">
                  Color
                </span>
                <input
                  type="color"
                  value={b.color || "#000000"}
                  onChange={(e) => {
                    const color = e.target.value;
                    setBlocks((prev) =>
                      prev.map((blk) => {
                        if (blk.id !== b.id || blk.type !== "heading")
                          return blk;
                        const hb = blk as HeadingBlock;
                        const safe = escapeHtml(hb.text || "").replace(
                          /\n/g,
                          "<br>",
                        );
                        return {
                          ...hb,
                          color,
                          html: `<h${hb.level}${styleTextAlignAndColor(hb.align, color)}>${safe}</h${hb.level}>`,
                        } as HeadingBlock;
                      }),
                    );
                  }}
                  className="h-8 w-10 cursor-pointer rounded border p-1"
                  title="Pick heading color"
                />
              </div>
              <button
                type="button"
                onClick={stopInlineEdit}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        );
      }

      if (block.type === "paragraph") {
        const b = block as ParagraphBlock;
        return (
          <div
            className="rounded-lg border bg-white"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <RichTextEditor
              key={b.id}
              content={
                b.editorHtml ||
                b.html ||
                (b.text ? `<p>${escapeHtml(b.text)}</p>` : "<p><br></p>")
              }
              placeholder="Write headings, lists, bold text..."
              onChange={(html) => saveParagraph(b.id, html)}
            />

            <div className="flex justify-end border-t p-2">
              <button
                type="button"
                onClick={() => stopInlineEdit()}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        );
      }
      if (block.type === "video") {
        const b = block as VideoBlock;

        return (
          <div className="space-y-3 rounded-lg border bg-white p-3">
            <input
              autoFocus
              type="text"
              className="w-full rounded-lg border p-2 text-sm"
              value={b.url}
              onChange={(e) =>
                setBlocks((prev) =>
                  prev.map((item) =>
                    item.id === b.id
                      ? { ...(item as VideoBlock), url: e.target.value }
                      : item,
                  ),
                )
              }
              placeholder="Paste YouTube / Vimeo URL"
            />

            <div className="flex justify-end border-t pt-2">
              <button
                type="button"
                onClick={stopInlineEdit}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
              >
                Done
              </button>
            </div>
          </div>
        );
      }

      return null;
    }

    function renderReadView() {
      return (
        <div
          className={outerCls}
          onClick={() => {
            setSelectedId(block.id);
            setSelectedImageIds([]);
          }}
          onDoubleClickCapture={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              block.type === "paragraph" ||
              block.type === "heading" ||
              block.type === "list"
            ) {
              startInlineEdit(block.id);
            }
          }}
        >
          {moveButtons}
          {(block.type === "heading" ||
            block.type === "paragraph" ||
            block.type === "list") &&
            inlineAlignButton(block.id, blockAlign)}
          {(block.type === "heading" ||
            block.type === "paragraph" ||
            block.type === "list") && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteBlockById(block.id);
              }}
              className="absolute right-2 top-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-xs shadow hover:bg-rose-600"
              title="Delete section"
            >
              ×
            </button>
          )}
          {block.type === "image" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteBlockById(block.id);
              }}
              className="absolute -right-3 -top-4 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-xs shadow hover:bg-rose-600"
              title="Delete image section"
            >
              ×
            </button>
          )}
          {block.type === "video" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteBlockById(block.id);
              }}
              className="absolute -right-3 -top-4 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-xs shadow hover:bg-rose-600"
              title="Delete video section"
            >
              ×
            </button>
          )}

          {block.type === "heading" && (
            <div
              className="pointer-events-none"
              dangerouslySetInnerHTML={{
                __html:
                  (block as HeadingBlock).html ||
                  buildHeadingHTMLWithColor(
                    (block as HeadingBlock).level,
                    (block as HeadingBlock).text || "",
                    blockAlign,
                    (block as HeadingBlock).color,
                  ),
              }}
            />
          )}

          {block.type === "paragraph" && (
            <div className="ql-snow pointer-events-none text-slate-700">
              <div
                className="ql-editor min-h-0 py-1 !pt-1 !pb-1 px-0 text-[14px] leading-relaxed"
                style={{
                  textAlign: (blockAlign ||
                    "left") as React.CSSProperties["textAlign"],
                }}
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    const raw =
                      (block as ParagraphBlock).html ||
                      ((block as ParagraphBlock).text
                        ? `<p>${escapeHtml((block as ParagraphBlock).text || "")}</p>`
                        : "<p><br></p>");
                    const trimmed = stripTrailingEmptyQuillParagraphs(raw);
                    return trimmed || "<p><br></p>";
                  })(),
                }}
              />
            </div>
          )}

          {block.type === "image" && (
            <div className="space-y-6">
              {/* {(block as ImageBlock).images.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No image selected yet. Click &quot;Open Gallery&quot; to upload or select image.
                </div>
              )} */}
              {(block as ImageBlock).images.map((img) => {
                const key = img._id || img.src;
                const isImgSelected =
                  isSelected && selectedImageIds.includes(key);
                const imgAlign = img.align || "center";
                return (
                  <div
                    key={key}
                    style={{ textAlign: imgAlign }}
                    className="w-full"
                  >
                    <div className="inline-block align-top">
                      <div
                        className={`relative inline-block rounded-xl ${isImgSelected ? "ring-2 ring-blue-500" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(block.id);
                          setSelectedImageIds((prev) =>
                            e.shiftKey
                              ? prev.includes(key)
                                ? prev.filter((i) => i !== key)
                                : [...prev, key]
                              : [key],
                          );
                        }}
                      >
                        <img
                          ref={(el) => {
                            imgRefs.current[`${block.id}:${key}`] = el;
                          }}
                          src={img.src}
                          alt={img.alt || ""}
                          className="rounded-xl max-w-full h-auto select-none"
                          style={{
                            width: img.width || undefined,
                            display: "inline-block",
                          }}
                          draggable={false}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlocks(
                              (prev) =>
                                prev
                                  .map((b) => {
                                    if (b.id !== block.id) return b as Block;
                                    const ib = b as ImageBlock;
                                    const next = ib.images.filter(
                                      (m) => (m._id || m.src) !== key,
                                    );
                                    if (next.length === 0) {
                                      return { ...ib, images: [] } as Block;
                                    }
                                    return { ...ib, images: next } as Block;
                                  })
                                  .filter(Boolean) as Block[],
                            );
                            setSelectedImageIds((prev) =>
                              prev.filter((id) => id !== key),
                            );
                            setGalleryVersion((v) => v + 1);
                          }}
                          className="absolute -top-2 left-0 hidden group-hover:flex items-center justify-center w-9 h-9 rounded-full bg-rose-500 text-white text-xs shadow"
                          title="Remove this image"
                        >
                          ×
                        </button>
                        <div
                          onMouseDown={(e) =>
                            onResizeMouseDown(block.id, key, e)
                          }
                          className="absolute w-3 h-3 bg-white border border-slate-400 rounded-sm"
                          style={{
                            right: "-6px",
                            bottom: "-6px",
                            cursor: "nwse-resize",
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-2 mt-2">
                        {(
                          ["left", "center", "right", "justify"] as AlignType[]
                        ).map((a) => (
                          <button
                            type="button"
                            key={a}
                            onClick={(e) => {
                              e.stopPropagation();
                              setBlocks((prev) =>
                                prev.map((b) => {
                                  if (b.id !== block.id || b.type !== "image")
                                    return b;
                                  const ib = b as ImageBlock;
                                  const next = ib.images.map((im) =>
                                    (im._id || im.src) === key
                                      ? { ...im, align: a }
                                      : im,
                                  );
                                  return { ...ib, images: next };
                                }),
                              );
                            }}
                            className={`rounded border px-2 py-1 text-xs font-medium transition ${
                              imgAlign === a
                                ? "border-blue-500 text-blue-600 bg-blue-50"
                                : "border-slate-300 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {a.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <label className="mt-2 block max-w-xs text-left">
                        <span className="mb-1 block text-[11px] font-medium text-slate-600">
                          Alt text
                        </span>
                        <input
                          type="text"
                          value={img.alt ?? ""}
                          onChange={(e) => {
                            e.stopPropagation();
                            const nextAlt = e.target.value;
                            setBlocks((prev) =>
                              prev.map((b) => {
                                if (b.id !== block.id || b.type !== "image")
                                  return b;
                                const ib = b as ImageBlock;
                                return {
                                  ...ib,
                                  images: ib.images.map((im) =>
                                    (im._id || im.src) === key
                                      ? { ...im, alt: nextAlt }
                                      : im,
                                  ),
                                };
                              }),
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Describe this image (accessibility & SEO)"
                          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
              {(block as ImageBlock).images.length === 0 && (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 transition hover:border-gray-400">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(block.id);
                      setSelectedImageIds([]);
                      setGalleryVersion((v) => v + 1);
                      setIsGalleryOpen(true);
                    }}
                    className="flex items-center gap-2 border rounded-lg border-gray-300 px-4 py-2 text-sm font-medium text-black shadow-sm transition-all duration-200 hover:bg-gray-300 hover:shadow-md active:scale-95"
                  >
                    <span className="text-base">🖼️</span>
                    Add Image
                  </button>
                </div>
              )}
            </div>
          )}

          {block.type === "list" && (
            <ul
              className="list-disc pl-6 pointer-events-none"
              style={{ textAlign: blockAlign as any }}
            >
              {(block as ListBlock).items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          )}

          {block.type === "faq" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlockById(block.id);
                }}
                className="absolute right-2 top-2 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-xs shadow hover:bg-rose-600"
                title="Delete FAQ section"
              >
                ×
              </button>
              <h2 className="text-xl font-bold text-slate-900 pointer-events-none">
                {FAQ_SECTION_TITLE}
              </h2>
              {(block as FaqBlock).items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="mt-2 text-sm font-semibold text-slate-500 shrink-0">
                      {itemIndex + 1}.
                    </span>
                    <div className="flex-1 space-y-3">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Question
                        </span>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => {
                            const nextQuestion = e.target.value;
                            setBlocks((prev) =>
                              prev.map((b) => {
                                if (b.id !== block.id || b.type !== "faq")
                                  return b;
                                const fb = b as FaqBlock;
                                return {
                                  ...fb,
                                  items: fb.items.map((faqItem, i) =>
                                    i === itemIndex
                                      ? {
                                          ...faqItem,
                                          question: nextQuestion,
                                        }
                                      : faqItem,
                                  ),
                                };
                              }),
                            );
                          }}
                          placeholder="e.g. Is this product suitable for everyday wear?"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-slate-600">
                          Answer
                        </span>
                        <textarea
                          value={item.answer}
                          rows={3}
                          onChange={(e) => {
                            const nextAnswer = e.target.value;
                            setBlocks((prev) =>
                              prev.map((b) => {
                                if (b.id !== block.id || b.type !== "faq")
                                  return b;
                                const fb = b as FaqBlock;
                                return {
                                  ...fb,
                                  items: fb.items.map((faqItem, i) =>
                                    i === itemIndex
                                      ? { ...faqItem, answer: nextAnswer }
                                      : faqItem,
                                  ),
                                };
                              }),
                            );
                          }}
                          placeholder="e.g. Yes. Its lightweight design makes it perfect for daily use."
                          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                    {(block as FaqBlock).items.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlocks((prev) =>
                            prev.map((b) => {
                              if (b.id !== block.id || b.type !== "faq")
                                return b;
                              const fb = b as FaqBlock;
                              return {
                                ...fb,
                                items: fb.items.filter(
                                  (_, i) => i !== itemIndex,
                                ),
                              };
                            }),
                          );
                        }}
                        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Remove this FAQ item"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setBlocks((prev) =>
                    prev.map((b) => {
                      if (b.id !== block.id || b.type !== "faq") return b;
                      const fb = b as FaqBlock;
                      return {
                        ...fb,
                        items: [...fb.items, { question: "", answer: "" }],
                      };
                    }),
                  );
                }}
                className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
              >
                <span className="text-base leading-none">+</span>
                Add FAQ Item
              </button>
            </div>
          )}

          {block.type === "video" && (
            <div
              className={`relative my-4 w-full overflow-hidden rounded-xl bg-black border transition ${
                selectedId === block.id
                  ? "border-blue-500 shadow-sm"
                  : "border-transparent"
              }`}
              style={{ textAlign: block.align || "center" }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(block.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setEditingId(block.id);
              }}
            >
              {selectedId === block.id && (
                <div className="absolute top-2 right-2 z-20 flex gap-1 bg-white/90 rounded-md shadow p-1">
                  {(["left", "center", "right", "justify"] as AlignType[]).map(
                    (a) => (
                      <button
                        key={a}
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlocks((prev) =>
                            prev.map((b) =>
                              b.id === block.id ? { ...b, align: a } : b,
                            ),
                          );
                        }}
                        className={`px-2 py-1 text-xs rounded border transition ${
                          block.align === a
                            ? "border-blue-500 text-blue-600 bg-blue-50"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {a[0].toUpperCase()}
                      </button>
                    ),
                  )}
                </div>
              )}
              <div
                className="inline-block relative"
                style={{
                  width: (block as VideoBlock).width
                    ? `${(block as any).width}px`
                    : "640px",
                  aspectRatio: "16 / 9",
                }}
              >
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(block.id);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(block.id);
                  }}
                />
                <iframe
                  src={getEmbedUrl(
                    (block as VideoBlock).url,
                    (block as VideoBlock).autoplay,
                  )}
                  className="absolute left-0 top-0 h-full w-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {selectedId === block.id && (
                  <div
                    onMouseDown={(e) => onResizeVideoMouseDown(block.id, e)}
                    className="absolute w-4 h-4 bg-white border border-slate-400 rounded-sm cursor-nwse-resize"
                    style={{ right: "-8px", bottom: "-8px" }}
                    title="Drag to resize"
                  />
                )}
              </div>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 group-hover:ring-1 group-hover:ring-slate-300" />
        </div>
      );
    }

    return (
      <div key={block.id} className="drag-group">
        {dropZoneTop}
        {isEditing ? (
          <div className={outerCls}>{renderInlineEditor()}</div>
        ) : (
          renderReadView()
        )}
        {dropZoneBottom}
      </div>
    );
  }
}
