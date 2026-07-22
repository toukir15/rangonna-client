// components/core/NoteModal/NoteModal.tsx
import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  noteValue: string;
  onNoteChange: (value: string) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  noteValue,
  onNoteChange,
  isSubmitting = false,
  submitButtonText = "Submit",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:p-0 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <Icon
          aria-label="Close modal"
          name="close"
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          variant="outlined"
          onClick={onClose}
        />
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-400">{title}</h2>

        <form onSubmit={onSubmit}>
          <textarea
            placeholder="Enter note"
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:text-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-700"
            required
          />
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? <ButtonLoader /> : submitButtonText}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
