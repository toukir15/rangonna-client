"use client";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import PageTable from "@admin/components/pages/Page/PageTable";
import { CampaignPageService } from "@admin/@services/apis/CampaignPage/CampaignPage.service";
import {
  IPageItem,
  PageContextType,
} from "@admin/@interfaces/page/page.interface";

export const PageContext = createContext<PageContextType>(
  {} as PageContextType,
);

const Page: React.FC = () => {
  const router = useRouter();
  const { permissionList } = useGlobalContext();

  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const [pageData, setPageData] = useState<IPageItem[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const handleAddClick = () => {
    router.push("/admin/pages/add-page");
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("campaignPagesPerPage", newProductPerPage.toString());
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getPages = () => {
    setTableLoading(true);

    CampaignPageService.getCampaignPages({
      searchTerm: debouncedSearchTerm?.trim() || undefined,
      page: currentPage,
      limit: productPerPage,
      sort: "-createdAt",
    })
      .then((res: any) => {
        if (res?.success) {
          const list = Array.isArray(res?.data)
            ? res.data
            : res?.data?.data || [];
          setPageData(list);
          setTotalProduct(
            Number(res?.meta?.total_record || res?.data?.meta?.total_record) ||
              0,
          );
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  useEffect(() => {
    const savedPerPage = localStorage.getItem("campaignPagesPerPage");
    if (savedPerPage) {
      setProductPerPage(Number(savedPerPage));
    }
  }, []);

  useEffect(() => {
    getPages();
  }, [debouncedSearchTerm, currentPage, productPerPage]);

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    if (!remove) return;

    setTableLoading(true);
    try {
      const res = await CampaignPageService.deleteCampaignPage(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getPages();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this page?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>

      <NoScrollLayout>
        <div className="md:flex gap-3 items-center 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center 4xl:gap-4 gap-2">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              Campaign Pages
            </h2>

            {permissionList.includes("campaign_page_create") && (
              <Button
                className="flex items-center bg-green-200 !text-green-600 !px-4 !py-1.5"
                onClick={handleAddClick}
              >
                <span className="ml-1 text-nowrap">Add Page</span>
              </Button>
            )}
          </div>

          <div className="4xl:w-72 md:w-64 w-full md:mt-0 mt-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              wrapperClass="w-full"
            />
          </div>
        </div>
      </NoScrollLayout>

      <PageContext.Provider
        value={{
          pageData,
          tableLoading,
          handleRemove,
          getPages,
        }}
      >
        <div className="min-h-[70vh] 2xl:px-4 px-3">
          <div className="xl:mt-3 mt-2">
            <PageTable />

            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalProduct}
            />
          </div>
        </div>
      </PageContext.Provider>
    </AuthLayout>
  );
};

export default Page;
