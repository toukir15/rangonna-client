"use client";
import React, { useEffect, useMemo, useState } from "react";

type ToastVariant = "create" | "delete" | "update" | "warning";

type ToastProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  duration?: number;
  variant?: ToastVariant;
  className?: string;
};

export function Toast({
  open,
  onClose,
  title,
  message,
  duration = 5000,
  variant = "create",
  className = "",
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  const ariaHidden = useMemo(() => (!open ? true : undefined), [open]);

  const theme = useMemo(() => {
    switch (variant) {
      case "create":
        return {
          ring: "ring-emerald-200",
          bg: "bg-emerald-50",
          title: "text-emerald-900",
          text: "text-emerald-700",
          iconWrap: "bg-emerald-100",
          icon: <CreateIcon />,
        };
      case "delete":
        return {
          ring: "ring-rose-200",
          bg: "bg-rose-50",
          title: "text-rose-900",
          text: "text-rose-700",
          iconWrap: "bg-rose-100",
          icon: <DeleteIcon />,
        };
      case "update":
        return {
          ring: "ring-sky-200",
          bg: "bg-sky-50",
          title: "text-sky-900",
          text: "text-sky-700",
          iconWrap: "bg-sky-100",
          icon: <UpdateIcon />,
        };
      case "warning":
      default:
        return {
          ring: "ring-amber-200",
          bg: "bg-amber-50",
          title: "text-amber-900",
          text: "text-amber-700",
          iconWrap: "bg-amber-100",
          icon: <WarningIcon />,
        };
    }
  }, [variant]);

  return (
    <div
      aria-hidden={ariaHidden as any}
      className="pointer-events-none fixed inset-0 z-40 flex justify-end items-start p-3 md:p-6"
    >
      <div
        className={[
          "transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
          "pointer-events-auto max-w-sm w-full",
        ].join(" ")}
      >
        <div
          className={[
            "flex gap-3 rounded-2xl border ring-1 shadow-lg backdrop-blur p-3 md:p-4",
            theme.bg,
            theme.ring,
            className,
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div
            className={[
              "shrink-0 mt-0.5 h-10 w-10 grid place-items-center rounded-xl",
              theme.iconWrap,
            ].join(" ")}
          >
            {theme.icon}
          </div>

          <div className="flex-1 min-w-0">
            <p className={["font-semibold", theme.title].join(" ")}>{title}</p>
            {message ? (
              <div className={["text-sm mt-0.5", theme.text].join(" ")}>
                {message}
              </div>
            ) : null}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1 hover:bg-black/5 active:scale-95 transition"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw {
          0% {
            stroke-dashoffset: 24;
            opacity: 0.6;
          }
          60% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .draw-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: draw 700ms ease-out forwards;
        }

        @keyframes bounce-in {
          0% {
            transform: translateY(-20%) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(6%) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        .bounce-in {
          animation: bounce-in 400ms cubic-bezier(0.17, 0.67, 0.36, 1.26) both;
        }

        @keyframes spin-once {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .spin-once {
          animation: spin-once 600ms ease-out 1;
        }

        @keyframes wiggle {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-7deg);
          }
          75% {
            transform: rotate(6deg);
          }
        }
        .wiggle {
          animation: wiggle 600ms ease-in-out 2;
        }
      `}</style>
    </div>
  );
}

function CreateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-700">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        opacity=".2"
      />
      <path
        d="M7 12l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw-path"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-rose-700 bounce-in">
      <path
        d="M9 3h6m-9 3h12M9 7v11m6-11v11M5 6l1.5 14A2 2 0 0 0 8.5 22h7a2 2 0 0 0 2-1.8L19 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 3a2 2 0 0 0-4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function UpdateIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-sky-700">
      <path
        d="M21 12a9 9 0 1 1-2.64-6.36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 3v6h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="spin-once"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-amber-700 wiggle">
      <path
        d="M12 3l9 16H3l9-16z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" />
      <path
        d="M12 8v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DemoToasts() {
  const [toast, setToast] = useState<null | ToastVariant>(null);
  const open = toast !== null;

  const show = (v: ToastVariant) => {
    setToast(v);
  };

  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
        <button
          onClick={() => show("create")}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
        >
          Create
        </button>
        <button
          onClick={() => show("update")}
          className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold"
        >
          Update
        </button>
        <button
          onClick={() => show("delete")}
          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold"
        >
          Delete
        </button>
        <button
          onClick={() => show("warning")}
          className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold"
        >
          Warning
        </button>
      </div>

      <Toast
        open={open}
        onClose={() => setToast(null)}
        variant={toast ?? "create"}
        title={
          toast === "create"
            ? "Created successfully"
            : toast === "update"
            ? "Updated successfully"
            : toast === "delete"
            ? "Deleted successfully"
            : "Warning"
        }
        message={
          toast === "warning"
            ? "Please double-check your inputs."
            : "Your action was processed."
        }
      />
    </div>
  );
}
