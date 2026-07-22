"use client";

import AuthLayout from "@admin/layouts/AuthLayout";
import NoPermissionView from "@admin/components/pages/NoPermission/NoPermissionView";

const NoPermissionPage = () => {
  return (
    <AuthLayout>
      <NoPermissionView />
    </AuthLayout>
  );
};

export default NoPermissionPage;
