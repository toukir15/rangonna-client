interface IButtonLoaderProps {
  size?: "sm" | "base" | "md" | "lg";
  color?: "primary" | "white" | "current";
  className?: string;
}

const ButtonLoader = ({
  size = "md",
  color = "current",
  className = "",
}: IButtonLoaderProps) => {
  const sizeClasses = {
    sm: "rongonaa-btn-loader--sm",
    base: "rongonaa-btn-loader--base",
    md: "rongonaa-btn-loader--md",
    lg: "rongonaa-btn-loader--lg",
  };

  const colorClasses = {
    primary: "rongonaa-btn-loader--primary",
    white: "rongonaa-btn-loader--white",
    current: "rongonaa-btn-loader--current",
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`rongonaa-btn-loader ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default ButtonLoader;
