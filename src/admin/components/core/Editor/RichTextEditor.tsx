"use client";

import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import QuillTableBetter from "quill-table-better";
import "quill-table-better/dist/quill-table-better.css";
import imageCompression from "browser-image-compression";
import { UploadService } from "@admin/@services/apis/Upload/Upload.service";
import { ToastService } from "@admin/utils/toastr.service";

interface Props {
  content?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  uploadFolder?: string;
}

// ✅ FULL COLOR PALETTE
const COLORS = [
  "#000000",
  "#e60000",
  "#ff9900",
  "#ffff00",
  "#008a00",
  "#0066cc",
  "#9933ff",
  "#ffffff",
  "#facccc",
  "#ffebcc",
  "#ffffcc",
  "#cce8cc",
  "#cce0f5",
  "#ebd6ff",
  "#bbbbbb",
  "#f06666",
  "#ffc266",
  "#ffff66",
  "#66b966",
  "#66a3e0",
  "#c285ff",
  "#888888",
  "#a10000",
  "#b26b00",
  "#b2b200",
  "#006100",
  "#0047b2",
  "#6b24b2",
  "#444444",
  "#5c0000",
  "#663d00",
  "#666600",
  "#003700",
  "#002966",
  "#3d1466",
];

type ImageAlign = "left" | "center" | "right";

const getAlignFromParent = (img: Element): ImageAlign | null => {
  const parent = img.parentElement;
  if (!parent) return null;

  if (parent.classList.contains("ql-align-center")) return "center";
  if (parent.classList.contains("ql-align-right")) return "right";
  if (parent.classList.contains("ql-align-left")) return "left";

  const textAlign = (parent as HTMLElement).style.textAlign;
  if (textAlign === "center") return "center";
  if (textAlign === "right") return "right";
  if (textAlign === "left") return "left";

  return null;
};

const getImageAlignment = (img: HTMLImageElement): ImageAlign | null => {
  const savedAlign = img.getAttribute("data-align");
  if (savedAlign === "left" || savedAlign === "center" || savedAlign === "right") {
    return savedAlign;
  }

  const parentAlign = getAlignFromParent(img);
  if (parentAlign) return parentAlign;

  if (img.style.float === "left") return "left";
  if (img.style.float === "right") return "right";
  if (
    img.style.display === "block" &&
    (img.style.margin.includes("auto") ||
      img.style.marginLeft === "auto" ||
      img.style.marginRight === "auto")
  ) {
    return "center";
  }

  return null;
};

const applyImageAlignment = (img: HTMLImageElement, align: ImageAlign) => {
  img.style.float = "";
  img.style.margin = "";
  img.style.display = "";
  img.removeAttribute("data-align");

  if (align === "left") {
    img.style.display = "inline";
    img.style.float = "left";
    img.style.margin = "0 1em 1em 0";
  } else if (align === "center") {
    img.style.display = "block";
    img.style.float = "none";
    img.style.margin = "0.75rem auto";
  } else {
    img.style.display = "inline";
    img.style.float = "right";
    img.style.margin = "0 0 1em 1em";
  }

  img.setAttribute("data-align", align);

  const parent = img.parentElement;
  if (parent?.tagName === "P") {
    parent.classList.remove("ql-align-left", "ql-align-center", "ql-align-right");
    parent.classList.add(`ql-align-${align}`);
    parent.style.textAlign = align;
  }
};

const parseImageAlignmentMap = (html: string): Map<string, ImageAlign> => {
  const map = new Map<string, ImageAlign>();
  if (!html?.trim()) return map;

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    const src = img.getAttribute("src");
    if (!src) return;

    const align = getImageAlignment(img);
    if (align) map.set(src, align);
  });

  return map;
};

const syncImageAttributes = (img: HTMLImageElement) => {
  if (img.width) {
    img.setAttribute("width", String(img.width));
    img.style.width = `${img.width}px`;
  }
  if (img.height) {
    img.setAttribute("height", String(img.height));
    img.style.height = `${img.height}px`;
  }
};

const applyImageAlignmentMap = (
  root: HTMLElement,
  alignmentMap: Map<string, ImageAlign>,
) => {
  root.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    const src = img.getAttribute("src");
    if (!src) return;

    const align = alignmentMap.get(src) || getImageAlignment(img);
    if (align) {
      applyImageAlignment(img, align);
      syncImageAttributes(img);
    }
  });
};

const serializeEditorHtml = (html: string): string => {
  if (!html?.trim()) return html || "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    const align = getImageAlignment(img);
    if (align) {
      applyImageAlignment(img, align);
      syncImageAttributes(img);
    }
  });

  return doc.body.innerHTML;
};

const initValue = (quill: Quill, html: string) => {
  const alignmentMap = parseImageAlignmentMap(html);
  const delta = quill.clipboard.convert({ html });
  const range = quill.getSelection();
  quill.updateContents(delta, Quill.sources.USER);
  quill.setSelection(
    delta.length() - (range?.length || 0),
    Quill.sources.SILENT,
  );
  quill.scrollSelectionIntoView();
  applyImageAlignmentMap(quill.root, alignmentMap);
};

const uploadEditorImage = async (file: File, folder: string) => {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });

  const res = await UploadService.uploadFileDirect(compressed, folder);
  const fileUrl = res?.data?.fileUrl;

  if (!res?.success || !fileUrl) {
    throw new Error(res?.message || "Image upload failed");
  }

  return fileUrl as string;
};

const insertImageAtSelection = (quill: Quill, url: string) => {
  const range = quill.getSelection(true);
  const index = range?.index ?? quill.getLength();
  quill.insertEmbed(index, "image", url, Quill.sources.USER);
  quill.setSelection(index + 1, 0, Quill.sources.SILENT);
};

const setupQuillImageResize = (
  quill: Quill,
  onResizeComplete: () => void,
) => {
  const container = quill.root.parentElement;
  if (!container) return () => {};

  container.style.position = container.style.position || "relative";

  let activeImg: HTMLImageElement | null = null;
  let overlay: HTMLDivElement | null = null;
  let sizeLabel: HTMLDivElement | null = null;
  let alignToolbar: HTMLDivElement | null = null;
  let alignButtons: Partial<Record<ImageAlign, HTMLButtonElement>> = {};

  const updateAlignButtons = () => {
    if (!activeImg) return;

    const currentAlign = getImageAlignment(activeImg);
    (Object.entries(alignButtons) as [ImageAlign, HTMLButtonElement | undefined][]).forEach(
      ([align, button]) => {
        if (!button) return;
        const isActive = currentAlign === align;
        button.style.background = isActive ? "#2563eb" : "#ffffff";
        button.style.color = isActive ? "#ffffff" : "#111827";
        button.style.borderColor = isActive ? "#2563eb" : "#d1d5db";
      },
    );
  };

  const reposition = () => {
    if (!overlay || !activeImg) return;

    const imgRect = activeImg.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    Object.assign(overlay.style, {
      left: `${imgRect.left - containerRect.left + container.scrollLeft}px`,
      top: `${imgRect.top - containerRect.top + container.scrollTop}px`,
      width: `${imgRect.width}px`,
      height: `${imgRect.height}px`,
    });

    if (sizeLabel) {
      sizeLabel.textContent = `${Math.round(imgRect.width)} x ${Math.round(imgRect.height)}`;
    }

    if (alignToolbar) {
      const centerLeft =
        imgRect.left - containerRect.left + container.scrollLeft + imgRect.width / 2;
      const bottomTop =
        imgRect.top - containerRect.top + container.scrollTop + imgRect.height + 8;

      alignToolbar.style.left = `${centerLeft}px`;
      alignToolbar.style.top = `${bottomTop}px`;
      alignToolbar.style.transform = "translateX(-50%)";
    }
  };

  const hide = () => {
    overlay?.remove();
    alignToolbar?.remove();
    overlay = null;
    sizeLabel = null;
    alignToolbar = null;
    alignButtons = {};
    activeImg = null;
  };

  const addAlignButton = (label: string, align: ImageAlign) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    Object.assign(button.style, {
      minWidth: "52px",
      height: "24px",
      padding: "0 8px",
      fontSize: "11px",
      fontWeight: "600",
      border: "1px solid #d1d5db",
      borderRadius: "4px",
      background: "#ffffff",
      color: "#111827",
      cursor: "pointer",
      pointerEvents: "auto",
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!activeImg) return;

      applyImageAlignment(activeImg, align);
      syncImageAttributes(activeImg);
      updateAlignButtons();
      reposition();
      onResizeComplete();
    });

    alignToolbar?.appendChild(button);
    alignButtons[align] = button;
  };

  const deleteActiveImage = () => {
    if (!activeImg) return;

    const img = activeImg;
    hide();

    try {
      const blot = Quill.find(img);
      if (blot) {
        const index = quill.getIndex(blot as never);
        quill.deleteText(index, 1, Quill.sources.USER);
      } else {
        img.remove();
      }
    } catch {
      img.remove();
    }

    onResizeComplete();
  };

  const addDeleteButton = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.title = "Delete image";
    button.setAttribute("aria-label", "Delete image");
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>`;
    Object.assign(button.style, {
      width: "28px",
      height: "24px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #fecaca",
      borderRadius: "4px",
      background: "#fef2f2",
      color: "#dc2626",
      cursor: "pointer",
      pointerEvents: "auto",
    });

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      deleteActiveImage();
    });

    alignToolbar?.appendChild(button);
  };

  const addHandle = (
    cursor: string,
    position: Partial<CSSStyleDeclaration>,
    resize: (dx: number, startWidth: number, aspectRatio: number) => number,
  ) => {
    const handle = document.createElement("div");
    Object.assign(handle.style, {
      position: "absolute",
      width: "10px",
      height: "10px",
      backgroundColor: "#ffffff",
      border: "1px solid #777",
      boxSizing: "border-box",
      cursor,
      zIndex: "22",
      pointerEvents: "auto",
      ...position,
    });

    handle.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!activeImg) return;

      const startX = event.clientX;
      const startWidth = activeImg.width || activeImg.naturalWidth || 300;
      const startHeight = activeImg.height || activeImg.naturalHeight || 200;
      const aspectRatio = startWidth / startHeight;

      const onMove = (moveEvent: MouseEvent) => {
        if (!activeImg) return;

        const dx = moveEvent.clientX - startX;
        const maxWidth = Math.max(container.clientWidth - 24, 120);
        const nextWidth = Math.max(
          80,
          Math.min(resize(dx, startWidth, aspectRatio), maxWidth),
        );
        const nextHeight = Math.round(nextWidth / aspectRatio);

        activeImg.width = nextWidth;
        activeImg.height = nextHeight;
        activeImg.style.width = `${nextWidth}px`;
        activeImg.style.height = `${nextHeight}px`;
        reposition();
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);

        if (activeImg) {
          syncImageAttributes(activeImg);
          onResizeComplete();
        }
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    overlay?.appendChild(handle);
  };

  const show = (img: HTMLImageElement) => {
    if (activeImg === img) return;

    hide();
    activeImg = img;
    quill.setSelection(null);

    overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      boxSizing: "border-box",
      border: "1px dashed #444",
      zIndex: "20",
      pointerEvents: "none",
    });

    sizeLabel = document.createElement("div");
    Object.assign(sizeLabel.style, {
      position: "absolute",
      top: "-28px",
      left: "0",
      background: "#111827",
      color: "#fff",
      fontSize: "11px",
      lineHeight: "1.2",
      padding: "2px 6px",
      borderRadius: "4px",
      pointerEvents: "none",
      zIndex: "23",
      whiteSpace: "nowrap",
    });
    overlay.appendChild(sizeLabel);

    alignToolbar = document.createElement("div");
    Object.assign(alignToolbar.style, {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
      zIndex: "24",
      pointerEvents: "auto",
      transform: "translateX(-50%)",
      padding: "4px",
      borderRadius: "6px",
      background: "rgba(255, 255, 255, 0.96)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e5e7eb",
    });
    addAlignButton("Left", "left");
    addAlignButton("Center", "center");
    addAlignButton("Right", "right");
    addDeleteButton();
    container.appendChild(alignToolbar);
    updateAlignButtons();

    addHandle("nwse-resize", { left: "-5px", top: "-5px" }, (dx, startWidth) =>
      startWidth - dx,
    );
    addHandle("nesw-resize", { right: "-5px", top: "-5px" }, (dx, startWidth) =>
      startWidth + dx,
    );
    addHandle("nesw-resize", { right: "-5px", bottom: "-5px" }, (dx, startWidth) =>
      startWidth + dx,
    );
    addHandle("nwse-resize", { left: "-5px", bottom: "-5px" }, (dx, startWidth) =>
      startWidth - dx,
    );

    container.appendChild(overlay);
    reposition();
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.tagName === "IMG" && quill.root.contains(target)) {
      show(target as HTMLImageElement);
      return;
    }

    if (
      (overlay && overlay.contains(target)) ||
      (alignToolbar && alignToolbar.contains(target))
    ) {
      return;
    }

    if (overlay || alignToolbar) {
      hide();
    }
  };

  const onScroll = () => reposition();
  const onWindowResize = () => reposition();

  quill.root.addEventListener("click", onClick);
  window.addEventListener("resize", onWindowResize);
  container.addEventListener("scroll", onScroll, true);

  return () => {
    hide();
    quill.root.removeEventListener("click", onClick);
    window.removeEventListener("resize", onWindowResize);
    container.removeEventListener("scroll", onScroll, true);
  };
};

const RichTextEditor: React.FC<Props> = ({
  content = "",
  onChange,
  placeholder = "Write something...",
  uploadFolder = "editor",
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef(onChange);
  const uploadFolderRef = useRef(uploadFolder);
  const isUploadingRef = useRef(false);

  const publishEditorHtml = (quill: Quill) => {
    applyImageAlignmentMap(
      quill.root,
      parseImageAlignmentMap(quill.root.innerHTML),
    );
    onChangeRef.current?.(serializeEditorHtml(quill.root.innerHTML));
  };

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    uploadFolderRef.current = uploadFolder;
  }, [uploadFolder]);

  const handleImageUpload = async (quill: Quill, file: File) => {
    if (!file.type.startsWith("image/")) {
      ToastService.warning("Please select a valid image file");
      return;
    }

    if (isUploadingRef.current) return;

    isUploadingRef.current = true;
    try {
      const fileUrl = await uploadEditorImage(file, uploadFolderRef.current);
      insertImageAtSelection(quill, fileUrl);
      publishEditorHtml(quill);
      ToastService.success("Image uploaded successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Image upload failed";
      ToastService.error(message);
    } finally {
      isUploadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;
    if (quillRef.current) return;

    if (!(Quill as any).__REGISTERED__) {
      Quill.register(
        {
          "modules/table-better": QuillTableBetter,
        },
        true,
      );

      (Quill as any).__REGISTERED__ = true;
    }

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder,
      modules: {
        table: false,
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: COLORS }, { background: COLORS }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "table-better"],
          ["clean"],
        ],
        "table-better": {
          language: "en_US",
          toolbarTable: true,
        },
        // Do not pass table-better `keyboardBindings` alone: Quill deep-merges it over
        // Keyboard.DEFAULTS and table Tab handlers override list/indent Tab behavior, so
        // bullet / ordered lists stop working. Table module still registers its formats.
        clipboard: {
          // Custom matcher for paste events
          matchers: [
            [
              "img",
              (node: any, delta: any) => {
                // Handle image pasting if needed
                return delta;
              },
            ],
          ],
        },
      },
    });

    const toolbar = quill.getModule("toolbar") as {
      addHandler?: (name: string, handler: () => void) => void;
    };

    toolbar?.addHandler?.("image", () => {
      fileInputRef.current?.click();
    });

    // Paste once: capture on host (before .ql-editor) so Quill's handler never runs; prefer HTML for lists/formatting.
    const host = editorRef.current;
    const handlePaste = (e: ClipboardEvent) => {
      if (!host?.contains(e.target as Node)) return;

      // Quill Snow puts link/image URL fields in `.ql-tooltip` inside this host. Our capture
      // handler must not steal paste from those inputs or the URL becomes plain text in the editor.
      const pasteEl =
        e.target instanceof Element
          ? e.target
          : (e.target as Node | null)?.parentElement;
      if (pasteEl instanceof Element) {
        if (pasteEl.closest(".ql-tooltip")) return;
        if (pasteEl.closest("input, textarea")) return;
      }

      e.preventDefault();
      e.stopPropagation();

      const clipboardItems = e.clipboardData?.items;
      if (clipboardItems?.length) {
        for (const item of Array.from(clipboardItems)) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              void handleImageUpload(quill, file);
            }
            return;
          }
        }
      }

      const plainText = e.clipboardData?.getData("text/plain") ?? "";
      const htmlText = (e.clipboardData?.getData("text/html") ?? "").trim();

      const selection = quill.getSelection(true);
      const pasteIndex = selection?.index ?? quill.getLength();
      const selLen = selection?.length ?? 0;

      if (selLen > 0) {
        quill.deleteText(pasteIndex, selLen, Quill.sources.USER);
      }

      const normalizePlainText = (input: string) => {
        const normalized = input
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .trim();

        if (!normalized) return "";

        const paragraphs = normalized
          .split(/\n{2,}/g)
          .map((p) =>
            p
              .replace(/\n+/g, " ")
              .replace(/[ \t]+/g, " ")
              .trim(),
          )
          .filter(Boolean);

        return paragraphs.join("\n\n");
      };

      if (htmlText) {
        const delta = quill.clipboard.convert({ html: htmlText });
        if (delta.length() > 0) {
          quill.updateContents(
            new (Quill.import("delta") as any)()
              .retain(pasteIndex)
              .concat(delta),
            Quill.sources.USER,
          );
          quill.setSelection(
            pasteIndex + delta.length(),
            0,
            Quill.sources.SILENT,
          );
          return;
        }
      }

      if (plainText) {
        const safeText = normalizePlainText(plainText);
        const toInsert = safeText || plainText;
        quill.insertText(pasteIndex, toInsert, Quill.sources.USER);
        quill.setSelection(
          pasteIndex + toInsert.length,
          0,
          Quill.sources.SILENT,
        );
      }
    };

    host.addEventListener("paste", handlePaste, { capture: true });

    if (content) {
      initValue(quill, content);
    }

    quill.on("text-change", () => {
      publishEditorHtml(quill);
    });

    const cleanupImageResize = setupQuillImageResize(quill, () => {
      publishEditorHtml(quill);
    });

    quillRef.current = quill;

    return () => {
      cleanupImageResize();
      host.removeEventListener("paste", handlePaste, { capture: true });
      quillRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;

    const quill = quillRef.current;
    const currentHtml = quill.root.innerHTML;
    const normalizedContent = content || "";
    const isEmptyEditor =
      currentHtml === "" ||
      currentHtml === "<p><br></p>" ||
      currentHtml === "<p></p>";

    if (!normalizedContent) {
      if (!isEmptyEditor) {
        quill.setContents([]);
      }
      return;
    }

    if (currentHtml !== normalizedContent) {
      quill.setContents([]);
      initValue(quill, normalizedContent);
    }
  }, [content]);

  return (
    <div className="rich-text-quill-root">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          const quill = quillRef.current;

          if (file && quill) {
            void handleImageUpload(quill, file);
          }

          event.target.value = "";
        }}
      />
      <div ref={editorRef} style={{ minHeight: "200px" }} />

      <style jsx global>{`
        .ql-editor table {
          width: 100%;
          border-collapse: collapse;
        }

        .ql-editor td,
        .ql-editor th {
          padding: 4px;
        }

        .ql-editor {
          font-size: 14px;
          line-height: 1.6;
        }

        /* Skip justify on li — it breaks Quill 2 list markers. Reinforce li/.ql-ui so Tailwind preflight can't hide bullets. */
        .ql-snow .ql-editor li {
          list-style-type: none;
          padding-left: 1.5em;
          position: relative;
        }

        .ql-snow .ql-editor li > .ql-ui::before {
          display: inline-block;
          margin-left: -1.5em;
          margin-right: 0.3em;
          text-align: right;
          white-space: nowrap;
          width: 1.2em;
        }

        /* Must use a real • char — "\\2022" in this template broke content and showed the escape. */
        .ql-snow .ql-editor li[data-list="bullet"] > .ql-ui::before {
          content: "•";
        }

        /* Default justify only inside our editor — not on every p (that overrode ql-align + preview). */
        .rich-text-quill-root .ql-editor {
          text-align: justify;
        }

        /* List lines without explicit Quill align: don't inherit justify (marker layout). */
        .rich-text-quill-root .ql-editor li:not([class*="ql-align"]) {
          text-align: start;
        }

        .ql-editor .ql-align-left {
          text-align: left;
        }
        .ql-editor .ql-align-center {
          text-align: center;
        }
        .ql-editor .ql-align-right {
          text-align: right;
        }
        .ql-editor .ql-align-justify {
          text-align: justify;
        }

        .rich-text-quill-root .ql-editor img {
          max-width: 100%;
          margin: 0.75rem 0;
          border-radius: 8px;
          cursor: pointer;
        }

        .rich-text-quill-root .ql-editor img[data-align="left"] {
          float: left;
          margin: 0 1em 1em 0;
        }

        .rich-text-quill-root .ql-editor img[data-align="center"] {
          display: block;
          float: none;
          margin: 0.75rem auto;
        }

        .rich-text-quill-root .ql-editor img[data-align="right"] {
          float: right;
          margin: 0 0 1em 1em;
        }

        .rich-text-quill-root .ql-container {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
