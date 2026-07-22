"use client";
import React, { FC } from "react";

type Variants = "outlined" | "filled" | "round" | "sharp" | "two-tone";

interface IconProps {
  name: string | any;
  variant?: Variants;
  size?: number | string;
  onClick?: () => void;
  className?: string;
  id?: string;
  role?: string;
  style?: React.CSSProperties;
}

const Icon: FC<IconProps> = ({
  name,
  variant = "filled",
  size,
  className,
  id,
  role,
  onClick,
  style,
}) => (
  <span
    id={id}
    className={`${
      variant === "filled" ? "material-icons" : `material-icons-${variant}`
    } ${className} select-none`}
    role={role}
    style={{
      fontSize: size,
      ...style,
    }}
    onClick={onClick}
  >
    {name}
  </span>
);

export default Icon;
