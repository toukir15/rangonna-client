"use client";

import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { useEffect, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import Button from "@admin/components/core/Button/Button";
import ProductModal from "@admin/components/pages/Settings/Product/ProductModal";
import { CompanyService } from "@admin/@services/apis/SettingsService/CompanySettings/company.service";

const Page = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [companyData, setCompanyData] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchCompanySettings = async () => {
    setTableLoading(true);
    try {
      const res: any = await CompanyService.getCompany({
        page: 1,
        limit: 50,
      });
      if (res?.success) {
        setCompanyData(res.data);
      } else {
        ToastService.error(res?.message || "Failed to load product settings");
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  useTableRefreshRegister(fetchCompanySettings);

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="p-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold dark:text-gray-300">
            Update Product Setting
          </h2>
          <Button
            className="bg-blue-500 text-white"
            onClick={() => setIsModalOpen(true)}
            disabled={tableLoading}
          >
            Edit Settings
          </Button>
        </div>
      </NoScrollLayout>

      <div className="px-4 min-h-[85%]">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6">
          {tableLoading ? (
            <p className="text-gray-500">Loading product settings...</p>
          ) : (
            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
              <p>
                <span className="font-semibold">Brands selected:</span>{" "}
                {companyData?.brand_names?.length ?? 0}
              </p>
              <p>
                <span className="font-semibold">Categories selected:</span>{" "}
                {companyData?.categories?.length ?? 0}
              </p>
            </div>
          )}
        </div>
        <ProductModal
          items={companyData}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          onSuccess={fetchCompanySettings}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
