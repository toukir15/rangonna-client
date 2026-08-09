"use client";

import { toast, type Id as ToastId, type ToastOptions } from "react-toastify";
import AppToastContent, {
  type ToastVariant,
} from "@admin/components/core/ToastComponent/AppToastContent";

export type ToastPayload = {
  title?: string;
  message: string;
};

type ToastInput = string | ToastPayload;

const DEFAULT_TITLES: Record<ToastVariant, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
  default: "Notice",
};

const baseOptions: ToastOptions = {
  icon: false,
  closeButton: false,
  className: "app-toast",
};

const normalize = (
  input: ToastInput,
  variant: ToastVariant,
): { title: string; message: string } => {
  if (typeof input === "string") {
    const message = input.trim() || DEFAULT_TITLES[variant];
    return { title: DEFAULT_TITLES[variant], message };
  }

  const message = (input.message || "").trim() || DEFAULT_TITLES[variant];
  const title = (input.title || "").trim() || DEFAULT_TITLES[variant];
  return { title, message };
};

const show = (variant: ToastVariant, input: ToastInput): ToastId => {
  const { title, message } = normalize(input, variant);

  return toast(
    ({ closeToast }) => (
      <AppToastContent
        variant={variant}
        title={title}
        message={message}
        closeToast={closeToast}
      />
    ),
    {
      ...baseOptions,
      type: variant === "default" ? "default" : variant,
    },
  );
};

export const ToastService = {
  success: (input: ToastInput): ToastId => show("success", input),
  error: (input: ToastInput): ToastId => show("error", input),
  info: (input: ToastInput): ToastId => show("info", input),
  warning: (input: ToastInput): ToastId => show("warning", input),
  default: (input: ToastInput): ToastId => show("default", input),
};
