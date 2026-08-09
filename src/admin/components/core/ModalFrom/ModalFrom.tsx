/* eslint-disable react/display-name */
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  width?: string;
  maxWidth?: string;
  className?: string;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<{ children: ReactNode; className?: string }>;
  Body: React.FC<{ children: ReactNode; className?: string }>;
  Footer: React.FC<{ children: ReactNode; className?: string }>;
} = ({
  isOpen,
  onClose,
  children,
  width = "w-full md:w-3/4 lg:w-2/3 xl:w-1/2",
  maxWidth = "max-w-4xl",
  className = "",
  closeOnOverlayClick = true,
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

  const portalTarget =
    document.getElementById("modal-root") ?? document.body;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className={`relative z-[101] w-full ${width} ${maxWidth} ${className} rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-left shadow-[var(--shadow-soft)] animate-slide-down overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.25s ease-out forwards;
        }
      `}</style>
    </div>,
    portalTarget,
  );
};

Modal.Header = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`px-6 pt-6 pb-4 border-b border-[var(--border)] ${className}`}
  >
    {children}
  </div>
);

Modal.Body = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`px-6 py-4 ${className}`}>{children}</div>;

Modal.Footer = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`px-6 py-4 border-t border-[var(--border)] ${className}`}
  >
    {children}
  </div>
);

export default Modal;
