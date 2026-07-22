"use client";
import React, { JSX, useEffect } from "react";
import { CheckCircle2, AlertCircle, XCircle, X } from "lucide-react";
import Icon from "@/@components/core/Icon/Icon";

export type ModalType = "success" | "error" | "warning";

interface ModalProps {
  isOpen: boolean;
  type?: ModalType;
  title?: string;
  message?: any;
  autoCloseMs?: number;
  onClose: () => void;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

const palette: Record<
  ModalType,
  { wrap: string; badge: string; icon: JSX.Element }
> = {
  success: {
    wrap: "bg-green-50 border-green-300",
    badge: "text-green-700",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  error: {
    wrap: "bg-primary-light border-primary-border",
    badge: "text-primary-dark",
    icon: <XCircle className="w-5 h-5" />,
  },
  warning: {
    wrap: "bg-yellow-50 border-yellow-300",
    badge: "text-yellow-800",
    icon: <AlertCircle className="w-5 h-5" />,
  },
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  type = "success",
  title,
  message,
  autoCloseMs,
  onClose,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  useEffect(() => {
    if (!isOpen || !autoCloseMs) return;
    const t = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(t);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  const t = palette[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-live="assertive"
    >
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal backdrop"
      />

      <div
        className={`relative w-[92%] max-w-md rounded-2xl border p-5 shadow-xl ${t.wrap} transition-all duration-200 scale-100`}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1 rounded-full hover:bg-black/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 opacity-60" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 h-80">
          <div className="grow">
            <div className="flex items-center justify-center mt-18 me-2">
              <Icon
                name={
                  type === "error"
                    ? "error"
                    : type === "success"
                    ? "check_circle"
                    : ""
                }
                variant="outlined"
                size={90}
                className={`${
                  type === "error"
                    ? "text-danger"
                    : type === "success"
                    ? "text-green-500"
                    : ""
                }`}
              />
            </div>
            <div className="mt-6">
              {title && (
                <h3 className="text-lg font-bold  text-center mb-2 ">
                  {title}
                </h3>
              )}

              {message && (
                <p className="text-lg leading-6 opacity-90 text-center ">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {(primaryActionText || secondaryActionText) && (
          <div className="mt-4 flex justify-end gap-2">
            {secondaryActionText && (
              <button
                onClick={onSecondaryAction}
                className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-black/5"
              >
                {secondaryActionText}
              </button>
            )}
            {primaryActionText && (
              <button
                onClick={onPrimaryAction}
                className="px-3 py-1.5 text-sm rounded-lg text-white bg-black hover:opacity-90"
              >
                {primaryActionText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
