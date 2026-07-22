import React, { useCallback, useRef, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Icon from "../Icon/Icon";

interface SinglePdfUploadProps {
  onChange: (file: File | null) => void;
  value?: File | string | null; // File (new) OR string url (edit mode)
  label?: string;
  className?: string;
  required?: boolean;
  maxSize?: number; // bytes
  disabled?: boolean;
}

const SinglePdfUpload: React.FC<SinglePdfUploadProps> = ({
  onChange,
  value = null,
  label = "Upload PDF",
  className = "",
  required = false,
  maxSize = 10 * 1024 * 1024, // 10MB default for pdf
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // for opening pdf (url or object url)
  const [fileName, setFileName] = useState<string | null>(null);
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
      setPreviewUrl(null);
      setFileName(null);
      return;
    }

    if (typeof value === "string") {
      // existing pdf URL from server
      setPreviewUrl(value);
      // try to infer filename
      const inferred = value.split("/").pop()?.split("?")[0] || "document.pdf";
      setFileName(inferred);
      return;
    }

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      setPreviewUrl(url);
      setFileName(value.name);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

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
          setError("Invalid file type. Only PDF is allowed.");
        } else {
          setError("Unable to accept this file");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Extra safety check
        if (file.type !== "application/pdf") {
          setError("Invalid file type. Only PDF is allowed.");
          return;
        }

        onChange(file);
      }
    },
    [disabled, maxSize, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize,
    maxFiles: 1,
    multiple: false,
    disabled,
  });

  const handleRemove = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation?.();
    if (disabled) return;
    onChange(null);
    setPreviewUrl(null);
    setFileName(null);
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
          previewUrl ? "w-full p-4" : "w-full p-6",
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
          error ? "border-red-500" : "",
          disabled ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input {...getInputProps()} ref={inputRef} />

        {previewUrl ? (
          <div className="relative space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <Icon name="picture_as_pdf" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {fileName || "document.pdf"}
                </p>

                <div className="flex items-center gap-3 mt-1">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-blue-600 dark:text-blue-400 underline"
                  >
                    View PDF
                  </a>

                  {!disabled && (
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="text-sm text-red-600 dark:text-red-400 underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors h-10 w-10"
                aria-label="Remove PDF"
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Icon name={"upload_file"} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {disabled
                ? "Uploading disabled"
                : isDragActive
                ? "Drop the PDF here"
                : "Drag & drop or click to upload PDF"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PDF (Max {Math.round(maxSize / (1024 * 1024))}MB)
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

export default SinglePdfUpload;
