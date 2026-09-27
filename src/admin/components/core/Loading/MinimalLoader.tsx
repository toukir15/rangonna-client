interface MinimalLoaderProps {
  label?: string;
}

export default function MinimalLoader({ label = "Loading" }: MinimalLoaderProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center bg-app-main">
      <div className="flex items-center gap-3 text-xs tracking-wide text-gray-500 dark:text-gray-400">
        <span className="page-loader-spin !h-4 !w-4" />
        <span>{label}</span>
      </div>
    </div>
  );
}
