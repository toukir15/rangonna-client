import AdminBrandLogo from "@admin/components/core/Brand/AdminBrandLogo";

const GlobalLoading = () => {
  return (
    <div className="relative flex min-h-[92vh] items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <AdminBrandLogo size="md" variant="green" abbreviated />
      </div>
      <div className="h-24 w-24 animate-spin rounded-full border-b-2 border-t-2 border-gray-900 dark:border-white" />
    </div>
  );
};

export default GlobalLoading;
