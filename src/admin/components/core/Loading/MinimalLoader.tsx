interface MinimalLoaderProps {
  label?: string;
}

export default function MinimalLoader({ label = "Loading" }: MinimalLoaderProps) {
  return (
    <div className="flex min-h-[220px] items-center justify-center bg-app-main">
      <div className="flex items-center gap-3 text-xs tracking-wide text-gray-500 dark:text-gray-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#7f1d1d] dark:border-gray-700 dark:border-t-[#d4a5ad]" />
        <span>{label}</span>
      </div>
    </div>
  );
}
