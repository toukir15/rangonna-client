"use client";
import { FC, JSX, ReactNode } from "react";

// Defining ButtonProps interface
interface ButtonProps {
  children?: ReactNode | JSX.Element;
  size?: "sm" | "base" | "md" | "lg";
  round?: "sm" | "base" | "md" | "lg" | "full";
  variant?: "fill" | "outline" | "noBorder" | "shadowOutline";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

// Defining Button component
const Button: FC<ButtonProps> = ({
  children,
  size,
  round = "base",
  variant = "fill",
  type = "button",
  disabled = false,
  onClick,
  className,
}: ButtonProps) => {
  // Styles objects
  const sizes: Record<string, string> = {
    sm: "py-2 px-4 text-sm",
    base: "py-2 px-4 text-base",
    md: "py-3 px-6 text-base",
    lg: "py-2 px-8 text-lg",
  };

  const rounds: Record<string, string> = {
    sm: "rounded-lg",
    base: "rounded-xl",
    md: "rounded-xl",
    lg: "rounded-xl",
    full: "rounded-full",
  };

  const variants: Record<string, string> = {
    fill: "btn-cashflow-primary !px-[24px]",
    outline: "btn-cashflow-secondary !bg-[var(--bg-surface)]",
    noBorder: "bg-transparent text-[var(--accent)] shadow-none",
    shadowOutline:
      "btn-cashflow-secondary hover:shadow-[inset_-2px_2px_30px_0px_rgba(0,0,0,0.06)]",
  };

  // Base styles
  const baseStyles: string = "inline-flex items-center justify-center transition-all duration-200 ease-in-out";

  // Applying styles based on props
  const sizeStyles: string = size
    ? sizes[size]
    : `${sizes["sm"]} md:${sizes["base"]}`;
  const roundStyles: string = rounds[round];
  const variantStyles: string = variants[variant];
  const disabledStyles: string = disabled
    ? "opacity-60 cursor-not-allowed"
    : "";

  // Returning the button component
  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${roundStyles} ${variantStyles} ${disabledStyles} ${className ?? ""}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Exporting the Button component
export default Button;
