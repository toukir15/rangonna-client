"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { formatDateTime } from "@admin/utils/hook.utils";

import {
  IExpense,
  IExpenseResponse,
} from "@admin/@interfaces/account/all-expenses/all-expenses";
import PageSearch from "@admin/components/core/Search/PageSearch";
import LandingTable from "@admin/components/pages/Landing/LandingTable";
import { useRouter } from "next/navigation";
import { LandingService } from "@admin/@services/apis/Landing/Landing.service";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

export const LandingContext = createContext({} as any);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [landingData, setLandingData] = useState<any[]>([]);
  const [items, setItems] = useState<IExpense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const savedPerPage = localStorage.getItem("allExposePerPage");
    if (savedPerPage) {
      const parsedValue = parseInt(savedPerPage, 10);
      if (!isNaN(parsedValue)) {
        setProductPerPage(parsedValue);
      }
    }
  }, []);

  const handleEditClick = (data: IExpense) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("allExposePerPage", newProductPerPage.toString());
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchLanding = () => {
    setTableLoading(true);
    LandingService.getLanding({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: IExpenseResponse) => {
        if (res?.success) {
          setLandingData(res?.data.data);
          setTotalProduct(res?.data.meta.total_record);
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
    if (hasMounted) {
      fetchLanding();
    }
  }, [debouncedSearchTerm, currentPage, productPerPage, hasMounted]);

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;
    try {
      const res = await LandingService.deleteLanding(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchLanding();
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
          Are you sure you want to remove this group?
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
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 md:flex items-center gap-3">
          <div className="flex items-center gap-3">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              All Landing Product
            </h2>
            {hasPermission(permissionList, "landing_page_create") && (
              <Button
                className="flex items-center !bg-green-200 !text-green-600 !py-1.5 !px-4"
                onClick={() => router.push("/admin/landing-page/add")}
              >
                Add Product
              </Button>
            )}
          </div>
          <div className="md:w-80 w-full md:my-0 my-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              wrapperClass="w-full"
            />
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <LandingContext.Provider
            value={{
              landingData,
              tableLoading,
              formatDateTime,
              handleEditClick,
              handleRemove,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              items,
              fetchLanding,
            }}
          >
            <LandingTable />
          </LandingContext.Provider>

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
    </AuthLayout>
  );
};

export default Page;
