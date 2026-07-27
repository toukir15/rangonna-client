type AdminBrandLogoProps = {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark" | "green";
  className?: string;
  abbreviated?: boolean;
};

const sizeMap = {
  sm: "text-2xl md:text-[1.75rem] leading-none",
  md: "text-3xl md:text-4xl leading-none",
  lg: "text-4xl xl:text-5xl leading-none",
  xl: "text-3xl sm:text-4xl leading-none",
};

const variantMap = {
  light: "text-gray-900 dark:text-white",
  dark: "text-white",
  green: "text-green-600 dark:text-green-400",
};

export default function AdminBrandLogo({
  size = "md",
  variant = "light",
  className = "",
  abbreviated = false,
}: AdminBrandLogoProps) {
  return (
    <span
      className={`font-bold tracking-tight select-none ${sizeMap[size]} ${variantMap[variant]} ${className}`.trim()}
    >
      {abbreviated ? "R" : "Rangonaa"}
    </span>
  );
}
