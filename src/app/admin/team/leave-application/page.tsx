"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import { LeaveApplicationService } from "@admin/@services/apis/TeamService/LeaveApplication.service";
import LeaveApplicationTable from "@admin/components/pages/Team/LeaveApplication/LeaveApplicationTable";
import LeaveApplicationTab from "@admin/components/pages/Team/LeaveApplication/LeaveApplicationTab";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";

export const LeaveApplicationContext = createContext<any>({} as any);

const Page = (): JSX.Element => {
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [leaveApplicationData, setLeaveApplicationData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelectOption>({
    value: "all",
    label: "All User",
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedFilter = localStorage.getItem("applicationFilter");
      return savedFilter || "all";
    }
    return "all";
  });

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
    TaskService.getAssignEmploySuggestion().then((res: any) => {
      if (res?.success) {
        setUserOption([
          {
            label: "All Users",
            value: "all",
          },
          ...res.data.map((u: any) => ({
            label: u.name,
            value: u._id,
          })),
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (hasMounted) {
      getLeaveApplication();
    }
  }, [filter, selectedUser, currentPage, productPerPage, hasMounted]);

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "AccountCategoryPerPage",
      newProductPerPage.toString()
    );
    setCurrentPage(1);
  };

  const getLeaveApplication = () => {
    setTableLoading(true);
    LeaveApplicationService.getLeaveApplication({
      page: currentPage,
      limit: productPerPage,
      status: filter,
      user: selectedUser.value,
    })
      .then((res: any) => {
        if (res?.success) {
          setLeaveApplicationData(res?.data?.data);
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
      const res = await AdvanceSalaryService.deleteAdvanceSalary(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getLeaveApplication();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("Unexpected error occurred");
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      localStorage.setItem("applicationFilter", newFilter);
    }
  };

  useEffect(() => {
    localStorage.setItem("applicationFilter", filter);
  }, [filter]);

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
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Leave Application
            </h2>
            <Button
              className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
              onClick={() => setIsFilterOpen((prev) => !prev)}
            >
              <Icon
                name={isFilterOpen ? "close" : "filter_alt"}
                size={20}
              />
            </Button>
          </div>
          {isFilterOpen && (
            <div className="lg:mb-0 -mb-2">
              <AllFilter
                isFilterOpen={isFilterOpen}
                isWebsiteFilter={true}
                websiteOptions={userOption}
                selectedWebsite={selectedUser}
                setSelectedWebsite={setSelectedUser}
              />
            </div>
          )}
        </div>
        <div className="px-3">
          <LeaveApplicationTab
            filter={filter}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <LeaveApplicationContext.Provider
            value={{
              leaveApplicationData,
              tableLoading,
              handleRemove,
              isModalOpen,
              setIsModalOpen,
              getLeaveApplication,
            }}
          >
            <LeaveApplicationTable />
          </LeaveApplicationContext.Provider>

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
