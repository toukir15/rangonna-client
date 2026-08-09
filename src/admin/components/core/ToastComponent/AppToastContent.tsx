"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "default";

export interface AppToastProps {
  title: string;
  message: string;
  variant?: ToastVariant;
  closeToast?: () => void;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: Info,
};

const AppToastContent = ({
  title,
  message,
  variant = "default",
  closeToast,
}: AppToastProps) => {
  const Icon = icons[variant];

  return (
    <div className={`app-toast-content app-toast-${variant}`}>
      <div className="app-toast-accent" aria-hidden />
      <div className="app-toast-icon-wrap">
        <Icon size={18} className="app-toast-icon" strokeWidth={2.25} />
      </div>
      <div className="app-toast-text">
        <p className="app-toast-title">{title}</p>
        <p className="app-toast-message">{message}</p>
      </div>
      <button
        type="button"
        className="app-toast-close"
        onClick={closeToast}
        aria-label="Dismiss notification"
      >
        <X size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
};

export default AppToastContent;
