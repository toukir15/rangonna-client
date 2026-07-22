import React, { useCallback, useRef, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Icon from "../Icon/Icon";

interface SingleImageUploadProps {
  onChange: (file: File | null) => void;
  value?: File | string | null;
  label?: string;
  className?: string;
  required?: boolean;
  maxSize?: number; // bytes
  accept?: string[]; // e.g. ["image/jpeg","image/png","image/webp"]
  disabled?: boolean;
}

const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  onChange,
  value = null,
  label = "Upload Image",
  className = "",
  required = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = ["image/jpeg", "image/png", "image/webp"],
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null); // for cleanup
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep preview in sync with external value (Edit mode friendly)
  React.useEffect(() => {
    // cleanup previous object URL if switching
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }

    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      // existing image URL from server
      setPreview(value);
      return;
    }

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      setPreview(url);
      return;
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Final cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (disabled) return;
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          setError(
            `File is too large. Max size is ${Math.round(
              maxSize / (1024 * 1024)
            )}MB`
          );
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          setError("Invalid file type");
        } else {
          setError("Unable to accept this file");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
      }
    },
    [disabled, maxSize, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.join(",") as any,
    maxSize,
    maxFiles: 1,
    multiple: false,
    disabled,
  });

  const handleRemove = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation?.();
    if (disabled) return;
    onChange(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`} aria-disabled={disabled}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div
        {...getRootProps()}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
          if (e.key === "Backspace" || e.key === "Delete") handleRemove(e);
        }}
        className={[
          "border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
          preview ? "w-64" : "w-full p-6",
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
          error ? "border-red-500" : "",
          disabled ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} ref={inputRef} />

        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="h-60 w-60 mx-auto rounded-md object-contain"
              draggable={false}
            />

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors h-10 w-10"
                aria-label="Remove image"
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Icon name={"add_photo_alternate"} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {disabled
                ? "Uploading disabled"
                : isDragActive
                ? "Drop the image here"
                : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {accept
                .map((type) => (type.includes("/") ? type.split("/")[1] : type))
                .join(", ")}{" "}
              (Max {Math.round(maxSize / (1024 * 1024))}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default SingleImageUpload;
