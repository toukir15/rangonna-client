// components/core/NoteModal/NoteModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
      <div
        className="relative w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-soft)]"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon
          aria-label="Close modal"
          name="close"
          className="absolute top-4 right-4 cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          variant="outlined"
          onClick={onClose}
        />
        <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">
          {title}
        </h2>

        <form onSubmit={onSubmit}>
          <textarea
            placeholder="Enter note"
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] p-3 text-[var(--text-primary)] outline-none focus:border-[var(--brand-border-medium)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
            required
          />
          <Button
            type="submit"
            className="mt-4 w-full !rounded-lg !bg-[var(--color-primary)] !px-4 !py-2.5 !text-white hover:!bg-[var(--color-primary-hover)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? <ButtonLoader /> : submitButtonText}
          </Button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default NoteModal;
