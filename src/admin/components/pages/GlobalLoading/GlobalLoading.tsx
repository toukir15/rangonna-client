const GlobalLoading = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" role="status">
      <span className="page-loader-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default GlobalLoading;
