"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { createContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
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
  useTableRefreshRegister(getPages);


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

      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Campaign Pages"
          action={
            permissionList.includes("campaign_page_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Page
              </Button>
            ) : undefined
          }
        />

        <PageContext.Provider
          value={{
            pageData,
            tableLoading,
            handleRemove,
            getPages,
          }}
        >
          <div className="data-table-card glass-card rounded-2xl orders-table-shell">
            <div className="premium-table-toolbar">
              <p className="premium-table-toolbar-title">Page records</p>
              <p className="premium-table-toolbar-meta">
                {totalProduct.toLocaleString()} items
              </p>
            </div>

            <div className="data-table-toolbar">
              <div className="data-table-toolbar-start">
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                  />
                </label>
              </div>
              <div className="data-table-toolbar-end">
                <TableRefreshButton
                  onRefresh={getPages}
                  isLoading={tableLoading}
                  className="!h-9"
                />
              </div>
            </div>

            <PageTable />

            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalProduct}
              showRefresh={false}
              isShowText={true}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          </div>
        </PageContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
