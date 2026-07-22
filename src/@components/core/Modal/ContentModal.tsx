import React, { ReactNode } from "react";
import { ArrowRight, Facebook, Globe } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  maxWidth?: string;
  className?: string;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
}

const ContentModal: React.FC<ModalProps> & {
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
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-[2px] duration-700"
          onClick={closeOnOverlayClick ? onClose : undefined}
        ></div>

        <div
          className={`relative inline-block bg-white  rounded-lg text-left overflow-hidden shadow-xl transform transition-all ${width} ${maxWidth} ${className} animate-slide-down`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {children}
        </div>
      </div>
    </>
  );
};

ContentModal.Header = ({ children, className = "" }) => (
  <div className={`px-6 pt-6 pb-4 border-b border-gray-200  ${className}`}>
    {children}
  </div>
);

ContentModal.Body = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

ContentModal.Footer = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-t border-gray-200  ${className}`}>
    {children}
  </div>
);

export default ContentModal;

export const ExampleModal = ({ isOpen, setIsOpen }: any) => {
  return (
    <ContentModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ContentModal.Header>
        <h2 className="text-lg font-semibold">Sign In</h2>
      </ContentModal.Header>

      <ContentModal.Body>
        <p className="mb-4">Welcome back! Please sign in to continue.</p>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-gray-500 text-sm">Or continue with</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <button className="flex items-center justify-center w-full border border-gray-200 rounded-lg py-2 mt-2 bg-white text-gray-700">
          <Globe className="w-5 h-5 mr-2 text-blue-500" /> Continue With Google
        </button>

        <button className="flex items-center justify-center w-full border border-gray-200 rounded-lg py-2 mt-3 bg-white text-gray-700">
          <Facebook className="w-5 h-5 mr-2 text-blue-600" /> Continue With
          Facebook
        </button>

        <button className="flex items-center justify-center w-full border border-gray-200 rounded-lg py-2 mt-3 bg-white text-gray-700">
          <ArrowRight className="w-5 h-5 mr-2 text-gray-500" /> Continue With
          Email
        </button>
      </ContentModal.Body>

      <ContentModal.Footer>
        <button
          className="w-full bg-primary-light0 text-white py-2 rounded-lg"
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </ContentModal.Footer>
    </ContentModal>
  );
};
