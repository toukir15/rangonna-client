"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import BalanceSheetTable from "@admin/components/pages/BalanceSheet/BalanceSheetTable";
import BalanceSheetQuickModal from "@admin/components/pages/Account/BalanceSheet/BalanceSheetQuickModal";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Balance Lists" />
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Balance records</p>
            <p className="premium-table-toolbar-meta">
              {balanceData.length.toLocaleString()}{" "}
              {balanceData.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start" />
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={getAccountList}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
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
