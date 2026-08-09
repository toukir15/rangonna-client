"use client";

import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import DashboardThemeSetting from "@admin/components/pages/Settings/DashboardTheme/DashboardThemeSetting";

const Page = () => {
  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:px-4 px-3 2xl:pt-4 sm:pt-3 pt-2">
          <h2 className="2xl:text-2xl lg:text-xl text-lg font-semibold text-app">
            Appearance
          </h2>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 py-4">
        <DashboardThemeSetting />
      </div>
    </AuthLayout>
  );
};

export default Page;
