// "use client";
// import Image from "next/image";
// import React, { useEffect, useState, DragEvent } from "react";
// import Icon from "@admin/components/core/Icon/Icon";

// /** =========================
//  * Types
//  * ========================= */
// export interface ExistingItem {
//   isExisting: true;
//   src: string;
//   name?: string;
//   id?: string;
//   previewUrl?: string;
// }

// export interface NewUploadItem {
//   isExisting?: false;
//   file: File;
//   name: string;
//   size: number;
//   type: string;
//   lastModified: number;
//   previewUrl: string;
//   path: string;
//   relativePath: string;
// }

// export type GalleryItem = ExistingItem | NewUploadItem;

// interface MultipleImageUploadProps {
//   value: GalleryItem[];
//   onChange: (items: GalleryItem[]) => void;
//   label?: string;
//   error?: string;
//   maxImages?: number;
//   height?: string;
// }

// const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
//   value = [],
//   onChange,
//   label = "Upload Images",
//   error,
//   maxImages = 4,
//   height = "h-20",
// }) => {
//   const [dragActive, setDragActive] = useState(false);

//   const isNewItem = (it: GalleryItem): it is NewUploadItem =>
//     !(it as ExistingItem).isExisting;

//   const formatDate = (ms: number) => {
//     const d = new Date(ms);
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//       2,
//       "0"
//     )}-${String(d.getDate()).padStart(2, "0")}`;
//   };

//   const createVirtualPath = (f: File) => {
//     const datePart = formatDate(f.lastModified || Date.now());
//     return `./${datePart}-${f.lastModified || Date.now()}-${f.name}`;
//   };

//   const filesToNewItems = (files: File[]): NewUploadItem[] => {
//     return files.map((f) => {
//       const previewUrl = URL.createObjectURL(f);
//       const p = createVirtualPath(f);
//       return {
//         isExisting: false,
//         file: f,
//         name: f.name,
//         size: f.size,
//         type: f.type,
//         lastModified: f.lastModified,
//         previewUrl,
//         path: p,
//         relativePath: p,
//       };
//     });
//   };

//   useEffect(() => {
//     return () => {
//       value?.forEach((it) => {
//         if (isNewItem(it) && it.previewUrl) {
//           try {
//             URL.revokeObjectURL(it.previewUrl);
//           } catch {}
//         }
//       });
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const addImages = (files: File[]) => {
//     const imageFiles = files.filter((file) => file.type.startsWith("image/"));
//     const newItems = filesToNewItems(imageFiles);

//     const normalizedExisting = (value || []).map((it) =>
//       !isNewItem(it) ? { ...it, previewUrl: it.previewUrl || it.src } : it
//     );

//     const combined = [...normalizedExisting, ...newItems].slice(0, maxImages);
//     onChange(combined);
//   };

//   // ========== Clipboard paste handler ==========
//   useEffect(() => {
//     const handlePaste = (e: ClipboardEvent) => {
//       const files: File[] = [];
//       if (e.clipboardData?.items) {
//         for (const item of e.clipboardData.items) {
//           if (item.type.startsWith("image/")) {
//             const file = item.getAsFile();
//             if (file) files.push(file);
//           }
//         }
//       }
//       if (files.length) {
//         e.preventDefault();
//         addImages(files);
//       }
//     };

//     window.addEventListener("paste", handlePaste);
//     return () => window.removeEventListener("paste", handlePaste);
//   }, [value]); // keep value to update correctly

//   // ---------- Drag & Drop ----------
//   const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     const filesArray = Array.from(e.dataTransfer.files || []);
//     if (filesArray.length) addImages(filesArray);
//   };

//   const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(true);
//   };

//   const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const filesArray = Array.from(e.target.files || []);
//     if (filesArray.length) addImages(filesArray);
//     e.currentTarget.value = "";
//   };

//   const handleRemoveImage = (index: number) => {
//     const updated = [...(value || [])];
//     const target = updated[index];
//     if (target && isNewItem(target)) {
//       try {
//         URL.revokeObjectURL(target.previewUrl);
//       } catch {}
//     }
//     updated.splice(index, 1);
//     onChange(updated);
//   };

//   const showUploadCard = (value?.length || 0) < maxImages;

//   const normalized = (value || []).map((it) =>
//     isNewItem(it) ? it : { ...it, previewUrl: it.previewUrl || it.src }
//   );

//   const tileBase = `relative w-full border rounded-lg overflow-hidden group ${height}`;
//   const gridBase = "grid grid-cols-4 gap-4";

//   const inputId = "multi-upload-input";

//   return (
//     <div className="flex flex-col gap-2">
//       {label && (
//         <label className="font-medium text-gray-700 dark:text-gray-300">
//           {label}
//         </label>
//       )}

//       <div className={gridBase}>
//         {normalized.map((item, index) => (
//           <div
//             key={index}
//             className={tileBase}
//             title={item.name || item.previewUrl}
//           >
//             <Image
//               src={item.previewUrl!}
//               alt={`Preview ${index + 1}`}
//               fill
//               unoptimized
//               className="object-cover"
//             />
//             <button
//               type="button"
//               onClick={() => handleRemoveImage(index)}
//               aria-label={`Remove image ${index + 1}`}
//               className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
//             >
//               <Icon name="close" className="text-white" size={20} />
//             </button>

//             {!isNewItem(item) && (
//               <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
//                 existing
//               </span>
//             )}
//           </div>
//         ))}

//         {showUploadCard && (
//           <label
//             htmlFor={inputId}
//             className={`${tileBase} flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors duration-300 ${
//               dragActive
//                 ? "border-blue-500 bg-blue-50"
//                 : "border-gray-300 bg-gray-50 dark:bg-gray-700"
//             }`}
//             onDrop={handleDrop}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//           >
//             <input
//               id={inputId}
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleFileChange}
//               className="hidden"
//             />
//             <div className="flex flex-col items-center text-gray-500 pointer-events-none">
//               <Icon name="add_photo_alternate" variant="outlined" size={26} />
//               <p className="text-[10px] text-gray-400">{`(${
//                 maxImages - (normalized?.length || 0)
//               } remaining)`}</p>
//               <p className="text-[9px] text-gray-400 mt-1">Paste (Ctrl+V)</p>
//             </div>
//           </label>
//         )}
//       </div>

//       {error && <p className="text-red-500 text-sm">{error}</p>}
//     </div>
//   );
// };

// export default MultipleImageUpload;

"use client";
import Image from "next/image";
import React, { useEffect, useState, DragEvent, useRef } from "react";
import Icon from "@admin/components/core/Icon/Icon";

/** =========================
 * Types
 * ========================= */
export interface ExistingItem {
  isExisting: true;
  src: string;
  name?: string;
  id?: string;
  previewUrl?: string;
}

export interface NewUploadItem {
  isExisting?: false;
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  previewUrl: string;
  path: string;
  relativePath: string;
}

export type GalleryItem = ExistingItem | NewUploadItem;

interface MultipleImageUploadProps {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  label?: string;
  error?: string;
  maxImages?: number;
  height?: string;
  layout?: "grid" | "list";

  /**
   * ✅ If true → paste works only after clicking inside div.
   * Otherwise → paste always works globally.
   */
  pasteRequireClick?: boolean;

  /** Render fields (e.g. title/text inputs) beside each image in list layout */
  renderImageFields?: (index: number) => React.ReactNode;
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  label = "Upload Images",
  error,
  maxImages = 4,
  height = "h-20",
  layout = "grid",
  pasteRequireClick = false,
  renderImageFields,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [pasteEnabled, setPasteEnabled] = useState(!pasteRequireClick);
  const divRef = useRef<HTMLDivElement | null>(null);

  const isNewItem = (it: GalleryItem): it is NewUploadItem =>
    !(it as ExistingItem).isExisting;

  const formatDate = (ms: number) => {
    const d = new Date(ms);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const createVirtualPath = (f: File) => {
    const datePart = formatDate(f.lastModified || Date.now());
    return `./${datePart}-${f.lastModified || Date.now()}-${f.name}`;
  };

  const filesToNewItems = (files: File[]): NewUploadItem[] =>
    files.map((f) => {
      const previewUrl = URL.createObjectURL(f);
      const p = createVirtualPath(f);
      return {
        isExisting: false,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        lastModified: f.lastModified,
        previewUrl,
        path: p,
        relativePath: p,
      };
    });

  // ✅ Clean up object URLs
  useEffect(() => {
    return () => {
      value?.forEach((it) => {
        if (isNewItem(it) && it.previewUrl) {
          try {
            URL.revokeObjectURL(it.previewUrl);
          } catch {}
        }
      });
    };
  }, [value]);

  const addImages = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newItems = filesToNewItems(imageFiles);
    const normalizedExisting = (value || []).map((it) =>
      !isNewItem(it) ? { ...it, previewUrl: it.previewUrl || it.src } : it,
    );
    const combined = [...normalizedExisting, ...newItems].slice(0, maxImages);
    onChange(combined);
  };

  // ✅ Clipboard paste handler (conditional)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!pasteEnabled) return;

      const files: File[] = [];
      if (e.clipboardData?.items) {
        for (const item of e.clipboardData.items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) files.push(file);
          }
        }
      }

      if (files.length) {
        e.preventDefault();
        addImages(files);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [pasteEnabled, value]);

  // ✅ Outside click detector (for pasteRequireClick mode)
  useEffect(() => {
    if (!pasteRequireClick) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setPasteEnabled(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [pasteRequireClick]);

  // ---------- Drag & Drop ----------
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const filesArray = Array.from(e.dataTransfer.files || []);
    if (filesArray.length) addImages(filesArray);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesArray = Array.from(e.target.files || []);
    if (filesArray.length) addImages(filesArray);
    e.currentTarget.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...(value || [])];
    const target = updated[index];
    if (target && isNewItem(target)) {
      try {
        URL.revokeObjectURL(target.previewUrl);
      } catch {}
    }
    updated.splice(index, 1);
    onChange(updated);
  };

  const showUploadCard = (value?.length || 0) < maxImages;

  const normalized = (value || []).map((it) =>
    isNewItem(it) ? it : { ...it, previewUrl: it.previewUrl || it.src },
  );

  const tileBase = `relative w-full border rounded-lg overflow-hidden group ${height}`;
  const listTileSize = "h-40 w-40";
  const gridBase = "grid md:grid-cols-4 grid-cols-2 gap-4";
  const inputId = "multi-upload-input";

  const renderImageTile = (item: GalleryItem, index: number, listMode = false) => (
    <div
      className={
        listMode
          ? `relative ${listTileSize} shrink-0 border rounded-lg overflow-hidden group`
          : tileBase
      }
      title={item.name || item.previewUrl}
    >
      <Image
        src={item.previewUrl!}
        alt={`Preview ${index + 1}`}
        fill
        unoptimized
        className="object-cover"
      />
      <button
        type="button"
        onClick={() => handleRemoveImage(index)}
        aria-label={`Remove image ${index + 1}`}
        className="absolute top-1 right-1 bg-red-500 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
      >
        <Icon name="close" className="text-white" size={20} />
      </button>

      {!isNewItem(item) && (
        <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
          existing
        </span>
      )}
    </div>
  );

  const renderUploadCard = (fullWidth = false) =>
    showUploadCard ? (
      <label
        htmlFor={inputId}
        className={`${fullWidth ? `relative ${listTileSize} w-full min-h-40` : tileBase} flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors duration-300 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 dark:bg-gray-700"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center text-gray-500 pointer-events-none">
          <Icon name="add_photo_alternate" variant="outlined" size={26} />
          <p className="text-[10px] text-gray-400">{`(${
            maxImages - (normalized?.length || 0)
          } remaining)`}</p>
          <p className="text-[9px] text-gray-400 mt-1">
            Paste (Ctrl+V):{" "}
            <span className="font-semibold">
              {pasteRequireClick
                ? pasteEnabled
                  ? "Active (click outside to disable)"
                  : "Click to enable"
                : "Always ON"}
            </span>
          </p>
        </div>
      </label>
    ) : null;

  // ${
  //   pasteEnabled ? "ring-2 ring-blue-400 ring-offset-2 rounded-md" : ""
  // }
  return (
    <div
      ref={divRef}
      className={`flex flex-col gap-2 transition`}
      onClick={() => {
        if (pasteRequireClick) setPasteEnabled(true);
      }}
    >
      {label && (
        <label className="font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {layout === "list" ? (
        <div className="space-y-4">
          {normalized.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              {renderImageTile(item, index, true)}
              {renderImageFields && (
                <div className="flex-1 min-w-0 space-y-2">
                  {renderImageFields(index)}
                </div>
              )}
            </div>
          ))}
          {renderUploadCard(true)}
        </div>
      ) : (
        <div className={gridBase}>
          {normalized.map((item, index) => renderImageTile(item, index))}
          {renderUploadCard()}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default MultipleImageUpload;
