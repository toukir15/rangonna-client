import React, { useState } from "react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles,
  accept,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (maxFiles && files.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }
    const updatedFiles = [...files, ...selectedFiles];
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (maxFiles && files.length + droppedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }
    const updatedFiles = [...files, ...droppedFiles];
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesSelected(updatedFiles);
  };

  return (
    <div className="p-2 border border-dashed border-gray-400 rounded-md">
      <div
        className="p-6 text-center bg-white rounded-md cursor-pointer "
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <p className="text-gray-600">
          Drag and drop files here, or click to select files.
        </p>
        <input
          type="file"
          onChange={handleFileChange}
          accept={accept}
          multiple
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="block mt-2 text-blue-600 underline cursor-pointer"
        >
          Select Files
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Uploaded Files:
          </h4>
          <ul className="mt-2 space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
              >
                <span className="text-gray-700">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
