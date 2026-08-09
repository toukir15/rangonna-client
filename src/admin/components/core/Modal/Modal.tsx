import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: { title: string; description: string };
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, data, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "var(--overlay)" }}
    >
      <div className="relative w-11/12 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-soft)]">
        <button
          className="absolute top-4 right-4 text-app-muted transition-colors hover:text-app"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="mb-4">
          {/* Render passed data */}
          {data && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-app">{data.title}</h2>
              <p className="text-app-secondary">{data.description}</p>
            </div>
          )}
          {/* Render children */}
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root") as HTMLElement
  );
};

export default Modal;
