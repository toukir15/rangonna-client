"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import BalanceSheetTable from "@admin/components/pages/BalanceSheet/BalanceSheetTable";
import BalanceSheetQuickModal from "@admin/components/pages/Account/BalanceSheet/BalanceSheetQuickModal";

export const BalanceListContext = createContext<any>({} as any);

const Page = (): JSX.Element => {
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(false);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickId, setQuickId] = useState<string>("");

  useEffect(() => {
    getAccountList();
  }, []);

  const getAccountList = () => {
    setTableLoading(true);
    AccountListService.getBalanceSheet()
      .then((res: any) => {
        if (res?.success) {
          setBalanceData(res?.data);
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

  const handleUpdateBalance = (accountId: string) => {
    setBalanceLoading(true);
    AccountListService.updateAccountBalance(accountId)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getAccountList();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setBalanceLoading(false);
      });
  };
  useTableRefreshRegister(getAccountList);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="sm:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="sm:flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              Balance Lists
            </h2>
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <BalanceListContext.Provider
            value={{
              balanceData,
              tableLoading,
              handleUpdateBalance,
              balanceLoading,
              setModalOpen,
              setQuickId
            }}
          >
            <BalanceSheetTable />
          </BalanceListContext.Provider>
        </div>
      </div>
      <BalanceSheetQuickModal
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        quickId={quickId}
      />
    </AuthLayout>
  );
};

export default Page;
