/* eslint-disable react/display-name */
import React, { ReactNode } from "react";
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  width?: string;
  className?: string;
  children: ReactNode;
}

const Drawer: React.FC<DrawerProps> & {
  Header: React.FC<{ children: ReactNode; className?: string }>;
  Body: React.FC<{ children: ReactNode; className?: string }>;
  Footer: React.FC<{ children: ReactNode; className?: string }>;
} = ({ isOpen, onClose, children, className = "" }) => {
  return (
    <>
      <div
        className={`fixed top-[60px] right-0 !h-[95%] md:w-[450px] w-[90%] bg-white dark:bg-gray-800 z-50 transform transition-transform border-none ${isOpen ? "translate-x-0" : "translate-x-full"
          } ${className} flex flex-col`}
      >
        {children}
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-[2px]"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

Drawer.Header = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={` ${className}`}>{children}</div>;

Drawer.Body = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`pe-5 overflow-y-auto flex-grow ${className}`}>
    {children}
  </div>
);

Drawer.Footer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`${className} pr-5 mt-auto`}>{children}</div>;

export default Drawer;
