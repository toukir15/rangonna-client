"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import SalaryReportTable from "@admin/components/pages/SalaryManager/SalaryReport/SalaryReportTable";
import SalaryReportModal from "@admin/components/pages/SalaryManager/SalaryReport/SalaryReportModal";
import {
  ISalary,
  ISalaryContext,
  ISalaryListResponse,
} from "@admin/@interfaces/salaryManager/salaryReport/SalaryReport.interface";
import { SalaryReportService } from "@admin/@services/apis/SalaryManager/SalaryReport/SalaryReport.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { IWebsiteOption } from "@admin/@interfaces/common.interface";
import { ExpenseSource } from "@admin/components/pages/Utilities/paymentData";

export const SalaryReportContext = createContext<ISalaryContext>(
  {} as ISalaryContext
);

const Page = (): JSX.Element => {
  const { permissionList, paymentMethodOptions } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [salaryData, setSalaryData] = useState<ISalary[]>([]);
  const [items, setItems] = useState<ISalary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>();
  const [selectedMethod, setSelectedMethod] = useState<any>();
  const [accountOptions, setAccountOptions] = useState<IWebsiteOption[]>([]);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const savedPerPage = localStorage.getItem("SalaryReportPerPage");
    if (savedPerPage) {
      const parsedValue = parseInt(savedPerPage, 10);
      if (!isNaN(parsedValue)) {
        setProductPerPage(parsedValue);
      }
    }
  }, []);

  const getAccountList = () => {
    AccountListService.getAccountSuggestion()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item?.account_name
              .toLowerCase()
              .replace(/\b\w/g, (char: string) => char.toUpperCase()),
            value: item._id,
          }));
          setAccountOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    getAccountList();
  }, []);

  useEffect(() => {
    if (hasMounted) {
      getSalaryReport();
    }
  }, [currentPage, productPerPage, hasMounted]);

  const handleEditClick = () => {
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("SalaryReportPerPage", newProductPerPage.toString());
    setCurrentPage(1);
  };

  const getSalaryReport = () => {
    setTableLoading(true);
    SalaryReportService.getSalaryReport({
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: ISalaryListResponse) => {
        if (res?.success) {
          setSalaryData(res?.data?.data);
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

  const handleStatusUpdate = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelUpdate = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const StatusUpdate = async () => {
    setTableLoading(true);
    if (!remove) return;

    SalaryReportService.updateSalaryStatus(remove, {
      account: selectedAccount?.value,
      payment_method: selectedMethod?.value,
      source: ExpenseSource.SALARY_PAYMENT,
    })
      .then((res: ISalaryListResponse) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getSalaryReport();
          setSelectedMethod(null);
          setSelectedAccount(null);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsAlertOpen(false);
        setRemove(null);
        setTableLoading(false);
      });
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsDeleteAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsDeleteAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = () => {
    if (!remove) return;
    setRemoveLoading(true);
    SalaryReportService.deleteSalaryReport(remove)
      .then((res: any) => {
        if (res?.success) {
          getSalaryReport();
          ToastService.success(res?.message);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setRemoveLoading(false);
        setIsDeleteAlertOpen(false);
        setRemove(null);
      });
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isDeleteAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={removeLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this Product?
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
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Pay Salary"
        cancelLabel="Cancel"
        onConfirm={StatusUpdate}
        onCancel={cancelUpdate}
        isLoading={tableLoading}
        disabled={!selectedAccount?.value || !selectedMethod?.value}
      >
        <h3 className="text-2xl font-bold text-center">
          Confirm Salary Payment
        </h3>

        <h6 className="text-md my-4 text-center">
          Are you sure you want to proceed with paying the salary to{" "}
          <span className="font-semibold">{items?.employee?.name}</span>?
        </h6>

        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-400">
            Payment Method
          </label>
          <SelectComponent
            options={paymentMethodOptions}
            value={selectedMethod}
            onChange={setSelectedMethod}
            placeholder="Select Payment Method"
            className=" w-full"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-400">
            Account
          </label>
          <SelectComponent
            options={accountOptions}
            value={selectedAccount}
            onChange={setSelectedAccount}
            placeholder="Select Account"
            className=" w-full"
          />
        </div>

        <div className="flex items-center justify-center my-8">
          <Icon
            name="attach_money"
            variant="outlined"
            size={100}
            className="text-green-500"
          />
        </div>
      </Alert>

      <NoScrollLayout>
        <div className="flex items-center justify-between 2xl:px-4 px-3 2xl:pt-2 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-3">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Salary
            </h2>
            {permissionList.includes("team_salary_create") && (
              <Button
                className="!bg-green-200 !text-green-600 !py-1.5 !px-4 text-nowrap"
                onClick={handleAddClick}
              >
                Add Salary
              </Button>
            )}
          </div>

        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="">
          <SalaryReportContext.Provider
            value={{
              salaryData,
              tableLoading,
              handleEditClick,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              items,
              getSalaryReport,
              setItems,
              handleStatusUpdate,
              handleRemove,
            }}
          >
            <SalaryReportModal />
            <SalaryReportTable />
          </SalaryReportContext.Provider>

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
