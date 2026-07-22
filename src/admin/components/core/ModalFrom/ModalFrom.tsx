/* eslint-disable react/display-name */
import React, { ReactNode } from "react";

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
    if (!isOpen) return null;

    return (
      <>
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div
            className="fixed inset-0 bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-[2px] duration-700"
            onClick={closeOnOverlayClick ? onClose : undefined}
          ></div>

          <div className="flex items-start justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className={`inline-block align-bottom bg-white dark:bg-gray-700 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-top ${width} ${maxWidth} ${className} animate-slide-down`}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              {children}
            </div>
          </div>
        </div>

        <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-60px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
      </>
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
    className={`px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700 ${className}`}
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
    className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}
  >
    {children}
  </div>
);

export default Modal;
