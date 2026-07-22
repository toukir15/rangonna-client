"use client";
import Image from "next/image";
import React, { useEffect, useState, DragEvent } from "react";
import Icon from "../Icon/Icon";

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
}

const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  label = "Upload Images",
  error,
  maxImages = 4,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const isNewItem = (it: GalleryItem): it is NewUploadItem =>
    !(it as ExistingItem).isExisting;

  const formatDate = (ms: number) => {
    const d = new Date(ms);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const createVirtualPath = (f: File) => {
    const datePart = formatDate(f.lastModified || Date.now());
    return `./${datePart}-${f.lastModified || Date.now()}-${f.name}`;
  };

  const filesToNewItems = (files: File[]): NewUploadItem[] => {
    return files.map((f) => {
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
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addImages = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const newItems = filesToNewItems(imageFiles);

    const normalizedExisting = (value || []).map((it) => {
      if (!isNewItem(it)) {
        return { ...it, previewUrl: it.previewUrl || it.src };
      }
      return it;
    });

    const combined = [...normalizedExisting, ...newItems].slice(0, maxImages);
    onChange(combined);
  };

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
    isNewItem(it) ? it : { ...it, previewUrl: it.previewUrl || it.src }
  );

  // layout
  const tileBase =
    "relative aspect-square border rounded-lg overflow-hidden group h-32 w-32";
  const gridBase = "flex items-center flex-wrap gap-4";

  const inputId = "multi-upload-input";

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700 ">{label}</label>}

      <div className={gridBase}>
        {/* Preview tiles */}
        {normalized.map((item, index) => (
          <div
            key={index}
            className={tileBase}
            title={item.name || item.previewUrl}
          >
            <Image
              src={item.previewUrl!}
              alt={`Preview ${index + 1}`}
              fill
              unoptimized
              className="object-cover "
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              aria-label={`Remove image ${index + 1}`}
              className="absolute top-1 right-1 bg-primary-light0 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
            >
              <Icon name="close" className="text-white" size={20} />
            </button>
            {!isNewItem(item) && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                existing
              </span>
            )}
          </div>
        ))}

        {/* Upload tile */}
        {showUploadCard && (
          <label
            htmlFor={inputId}
            className={`${tileBase} flex items-center justify-center cursor-pointer border-2 border-dashed transition-colors duration-300 h-32 w-32 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
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
            </div>
          </label>
        )}
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
};

export default MultipleImageUpload;
