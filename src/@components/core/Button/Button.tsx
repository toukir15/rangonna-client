"use client";
import { FC, JSX, ReactNode } from "react";
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
  const sizes: Record<string, string> = {
    sm: "py-2 px-4 text-sm",
    base: "py-2 px-4 text-base",
    md: "py-3 px-6 text-base",
    lg: "py-2 px-8 text-lg",
  };

  const rounds: Record<string, string> = {
    sm: "rounded-sm",
    base: "rounded-md",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const variants: Record<string, string> = {
    fill: "premium-cta custom-btn-shadow",
    outline:
      "bg-white border border-primary-500 text-primary-500 custom-btn-shadow",
    noBorder: "bg-transparent text-primary-500 custom-btn-shadow",
    shadowOutline:
      "bg-transparent text-primary-500 border-2 border-primary-lighter custom-btn-shadow hover:shadow-[inset_-2px_2px_30px_0px_rgba(0,0,0,0.08)]",
  };

  const baseStyles: string = "transition-all duration-300 ease-in-out";

  const sizeStyles: string = size
    ? sizes[size]
    : `${sizes["sm"]} md:${sizes["base"]}`;
  const roundStyles: string = rounds[round];
  const variantStyles: string = variants[variant];
  const disabledStyles: string = disabled
    ? "!bg-disable-500 !bg-opacity-60 !text-white !cursor-not-allowed"
    : "";

  return (
    <button
      className={`inline-block font-inter font-medium text-sm md:text-base  px-[24px] lg:text-base cursor-pointer ${baseStyles} ${sizeStyles} ${roundStyles} ${variantStyles} ${disabledStyles} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
