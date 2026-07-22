import React, { ReactNode, useEffect } from "react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  className?: string;
  overlayClassName?: string;
  side?: "left" | "right";
  children: ReactNode;
}

const Drawer: React.FC<DrawerProps> & {
  Header: React.FC<{ children: ReactNode; className?: string }>;
  Body: React.FC<{ children: ReactNode; className?: string }>;
  Footer: React.FC<{ children: ReactNode; className?: string }>;
} = ({ isOpen, onClose, children, className = "", width, side = "right", overlayClassName = "" }) => {
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className={[
          "fixed top-0 h-full z-50 bg-white border-none flex flex-col",
          side === "left" ? "left-0" : "right-0",
          "md:w-[360px] w-[75%]",
          "transform-gpu",
          className,
        ].join(" ")}
        style={{
          width: width,
          transform: isOpen
            ? "translateX(0)"
            : side === "left"
              ? "translateX(-100%)"
              : "translateX(100%)",
          transition: "transform 200ms ease-in-out",
        }}
      >
        {children}
      </div>

      <div
        className={["fixed inset-0 z-40 bg-black", overlayClassName].join(" ")}
        style={{
          opacity: isOpen ? 0.4 : 0,
          transition: "opacity 300ms ease-in-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />
    </>
  );
};

Drawer.Header = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

Drawer.Body = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`pe-2 overflow-y-auto flex-grow ${className}`}>
    {children}
  </div>
);

Drawer.Footer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`${className} pr-2 mt-auto md:pb-0 pb-14`}>{children}</div>
);

export default Drawer;
