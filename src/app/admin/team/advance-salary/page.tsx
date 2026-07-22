"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AdvanceSalaryTable from "@admin/components/pages/SalaryManager/AdvanceSalary/AdvanceSalaryTable";
import AdvanceSalaryModal from "@admin/components/pages/SalaryManager/AdvanceSalary/AdvanceSalaryModal";
import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import {
  IAdvance,
  IAdvanceListResponse,
} from "@admin/@interfaces/salaryManager/advanceSalary/AdvanceSalary.interface";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";

export const AdvanceSalaryContext = createContext<any>({} as any);

const Page = (): JSX.Element => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [advanceData, setAdvanceData] = useState<IAdvance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelectOption>({
    value: "all",
    label: "All User",
  });
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

  const formatMonth = (date: Date | null): string | null => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  };

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
      getAdvanceList();
    }
  }, [selectedMonth, selectedUser, currentPage, productPerPage, hasMounted]);

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
    AdvanceSalaryService.getAdvanceSalary({
      page: currentPage,
      limit: productPerPage,
      employee: selectedUser.value,
      month: formatMonth(selectedMonth),
    })
      .then((res: IAdvanceListResponse) => {
        if (res?.success) {
          setAdvanceData(res?.data?.data);
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
        getAdvanceList();
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
        <div className="flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Advance
            </h2>
            <div className="flex items-center gap-3">
              <SelectComponent
                options={userOption}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="All Websites"
                className="md:w-64 w-full"
              />
              <div className="mt-2">
                <CustomDatePicker
                  selectedDate={selectedMonth}
                  onChange={(date) => {
                    setSelectedMonth(date);
                    setCurrentPage(1);
                  }}
                  // label="Month"
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="Select month"
                  wrapperClassName="w-64"
                />
              </div>
            </div>
          </div>
          <div>
            {permissionList.includes("team_advance_salary_create") && (
              <Button
                className="flex items-center bg-blue-500 !px-4"
                onClick={handleAddClick}
              >
                <Icon name={"add"} />
                <span className="ml-1">Add Advance</span>
              </Button>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <AdvanceSalaryContext.Provider
            value={{
              advanceData,
              tableLoading,
              handleRemove,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              getAdvanceList,
            }}
          >
            <AdvanceSalaryModal />
            <AdvanceSalaryTable />
          </AdvanceSalaryContext.Provider>

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
