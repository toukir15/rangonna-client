"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";

import { IAdvanceListResponse } from "@admin/@interfaces/salaryManager/advanceSalary/AdvanceSalary.interface";
import MyLeaveModal from "@admin/components/pages/Team/MyLeave/MyLeaveModal";
import MyLeaveTable from "@admin/components/pages/Team/MyLeave/MyLeaveTable";
import { MyLeaveService } from "@admin/@services/apis/TeamService/MyLeave.service";

export const MyLeaveContext = createContext<any>({} as any);

const Page = (): JSX.Element => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add">("Add");
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const savedPerPage = localStorage.getItem("AccountCategoryPerPage");
    if (savedPerPage) {
      const parsedValue = parseInt(savedPerPage, 10);
      if (!isNaN(parsedValue)) {
        setProductPerPage(parsedValue);
      }
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      getAdvanceList();
    }
  }, [currentPage, productPerPage, hasMounted]);

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "AccountCategoryPerPage",
      newProductPerPage.toString()
    );
    setCurrentPage(1);
  };

  const getAdvanceList = () => {
    setTableLoading(true);
    MyLeaveService.getMyLeave({
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: IAdvanceListResponse) => {
        if (res?.success) {
          setLeaveData(res?.data?.data);
          setTotalProduct(res?.data?.meta.total_record);
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

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              My Leave
            </h2>
          </div>
          <div>
            {permissionList.includes("leave_application_create") && (
              <Button
                className="flex items-center bg-blue-500 !px-4"
                onClick={handleAddClick}
              >
                <Icon name={"add"} />
                <span className="ml-1">Add Leave</span>
              </Button>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <MyLeaveContext.Provider
            value={{
              leaveData,
              tableLoading,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              getAdvanceList,
            }}
          >
            <MyLeaveModal />
            <MyLeaveTable />
          </MyLeaveContext.Provider>

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
