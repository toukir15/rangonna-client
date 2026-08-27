"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-explicit-any */
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { hasPermission } from "@admin/utils";
import { todayRange } from "@admin/utils/helper";
import { formatDateRange } from "@admin/utils/hook.utils";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { ICardData } from "@/app/admin/report/employee-report/page";
import DashBoardShowroomTable from "@admin/components/pages/DashBoard/DashBoardShowroomTable";
import { DashboardShowroomService } from "@admin/@services/apis/DashboardService/DashboardShowroom.service";
import ShowroomQuickViewModal from "@admin/components/pages/DashBoard/ShowroomQuickViewModal";
import DashBoardShowroomExpenseTable from "@admin/components/pages/DashBoard/DashBoardShowroomExpenseTable";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import DashboardExpenseModal from "@admin/components/pages/DashBoard/DashboardExpenseModal";
import DashboardQuickReportTable from "@admin/components/pages/DashBoard/DashboardQuickReportTable";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { noPermission } from "@admin/utils/constant";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

export const DashboardShowroomContext = createContext({} as any);

const DEFAULT_DATE_RANGE = {
  ...todayRange(),
  label: "Today",
};

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [returnListData, setReturnListData] = useState<any[]>([]);
  const [expenseListData, setExpenseListData] = useState<any[]>([]);
  const [expenseQuickData, setExpenseQuickData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [tableExLoading, setExTableLoading] = useState<boolean>(true);
  const [tableQuickLoading, setQuickTableLoading] = useState<boolean>(true);
  const [cardLoading, setCardLoading] = useState<boolean>(true);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isExModalOpen, setIsExModalOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [items, setItems] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const [range, setRange] = useState<any>(DEFAULT_DATE_RANGE);

  const [cardData, setCardData] = useState<any>();
  // Expense pagination state
  const [expenseOrdersPerPage, setExpenseOrdersPerPage] = useState<number>(20);
  const [expenseTotalOrders, setExpenseTotalOrders] = useState<number>(0);
  const [expenseCurrentPage, setExpenseCurrentPage] = useState<number>(1);
  const expenseTotalPages = Math.ceil(
    expenseTotalOrders / expenseOrdersPerPage
  );

  // Quick report pagination state
  const [quickOrdersPerPage, setQuickOrdersPerPage] = useState<number>(20);
  const [quickTotalOrders, setQuickTotalOrders] = useState<number>(0);
  const [quickCurrentPage, setQuickCurrentPage] = useState<number>(1);
  const quickTotalPages = Math.ceil(quickTotalOrders / quickOrdersPerPage);

  const formattedFrom = formatDateRange(range.startDate).trim();
  const formattedTo = formatDateRange(range.endDate).trim();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setQuickCurrentPage(1);
  };

  const fetchReturnList = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setTableLoading(true);

    DashboardShowroomService.getDashboardShowroomList({
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setReturnListData(res?.data || []);
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

  const fetchExpensesReportList = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setExTableLoading(true);

    DashboardShowroomService.getExpenseReport({
      startDate: formattedFrom,
      endDate: formattedTo,
      page: expenseCurrentPage,
      limit: expenseOrdersPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setExpenseListData(res?.data?.data || []);
          setExpenseTotalOrders(res?.data?.meta?.total_record || 0);        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setExTableLoading(false);
      });
  };

  const fetchListQuick = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setQuickTableLoading(true);

    DashboardShowroomService.getShowroomListQuick({
      searchTerm: debouncedSearchTerm,
      payment_method: "all",
      ...(!debouncedSearchTerm && {
        startDate: formattedFrom,
        endDate: formattedTo,
      }),
      page: quickCurrentPage,
      limit: quickOrdersPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setExpenseQuickData(res?.data?.data || []);
          setQuickTotalOrders(res?.data?.meta?.total_record || 0);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setQuickTableLoading(false);
      });
  };

  const fetchCartData = () => {
    setCardLoading(true);

    DashboardShowroomService.getCartList({
      startDate: formattedFrom,
      endDate: formattedTo,
    })
      .then((res: any) => {
        if (res?.success) {
          setCardData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setCardLoading(false);
      });
  };

  useEffect(() => {
    setExpenseCurrentPage(1);
    setQuickCurrentPage(1);
  }, [range]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchReturnList();
  }, [canFetchPageData, range]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchExpensesReportList();
  }, [canFetchPageData, range, expenseOrdersPerPage, expenseCurrentPage]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchListQuick();
  }, [canFetchPageData, debouncedSearchTerm, range, quickOrdersPerPage, quickCurrentPage]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchCartData();
  }, [canFetchPageData, range]);

  const cashItem = returnListData?.find(
    (item: any) => item.payment_method === "cash"
  );

  const cashAmount =
    (cashItem?.transaction_date_amount || 0) -
    (cardData?.showroom_expense_report?.amount || 0);

  const CardData: ICardData[] = [
    {
      label: `Total: ${cardData?.total?.count || 0}`,
      value: `${cardData?.total?.amount || 0}`,
      icon: "wallet",
      color:
        "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent",
    },
    {
      label: `Active: ${cardData?.active?.count || 0}`,
      value: `${cardData?.active?.amount || 0}`,
      icon: "radio_button_checked",
      color:
        "bg-gradient-to-r from-emerald-500 via-green-600 to-lime-600 bg-clip-text text-transparent",
    },
    {
      label: `Delivery: ${cardData?.delivery?.count || 0}`,
      value: `${cardData?.delivery?.amount || 0}`,
      icon: "local_mall",
      color:
        "bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-600 bg-clip-text text-transparent",
    },
    {
      label: `Discount: ${cardData?.total?.count || 0}`,
      value: `${cardData?.discount?.amount || 0}`,
      icon: "change_circle",
      color:
        "bg-gradient-to-r from-red-500 via-rose-600 to-fuchsia-700 bg-clip-text text-transparent",
    },
    {
      label: `Release: ${cardData?.release?.count || 0}`,
      value: `${cardData?.release?.amount || 0}`,
      icon: "indeterminate_check_box",
      color:
        "bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 bg-clip-text text-transparent",
    },

    {
      label: `Net Sales: ${(cardData?.active?.count || 0) + (cardData?.delivery?.count || 0)
        }`,
      value: `${(cardData?.delivery?.amount || 0) +
        (cardData?.active?.amount || 0) -
        (cardData?.discount?.amount || 0)
        }`,
      icon: "data_exploration",
      color:
        "bg-gradient-to-r from-emerald-500 via-green-600 to-lime-600 bg-clip-text text-transparent",
    },
    {
      label: `Servicing: ${cardData?.issue_payment?.count || 0}`,
      value: `${cardData?.issue_payment?.amount || 0}`,
      icon: "data_exploration",
      color:
        "bg-gradient-to-r from-emerald-500 via-green-600 to-lime-600 bg-clip-text text-transparent",
    },
    {
      label: `Cash Collection: ${0}`,
      value: `${cashItem?.transaction_date_amount || 0}`,
      icon: "data_exploration",
      color:
        "bg-gradient-to-r from-emerald-500 via-green-600 to-lime-600 bg-clip-text text-transparent",
    },
    {
      label: `Expense: ${cardData?.showroom_expense_report?.count || 0}`,
      value: `${cardData?.showroom_expense_report?.amount || 0}`,
      icon: "trending_down",
      color:
        "bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-600 bg-clip-text text-transparent",
    },
    {
      label: "Cash",
      value: `${cashAmount}`,
      icon: "real_estate_agent",
      color:
        "bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-600 bg-clip-text text-transparent",
    },
  ];

  const handleExpenseOrdersPerPageChange = (newOrdersPerPage: number) => {
    setExpenseOrdersPerPage(newOrdersPerPage);
    setExpenseCurrentPage(1);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "dashboardShowroomExpenseOrdersPerPage",
        newOrdersPerPage.toString()
      );
    }
  };

  const handleQuickOrdersPerPageChange = (newOrdersPerPage: number) => {
    setQuickOrdersPerPage(newOrdersPerPage);
    setQuickCurrentPage(1);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "dashboardShowroomQuickOrdersPerPage",
        newOrdersPerPage.toString()
      );
    }
  };

  const handleAddClick = () => {
    setItems(null);
    setModalMode("Add");
    setIsExModalOpen(true);
  };

  const handleEditClick = (data: any) => {
    setItems(data);
    setModalMode("Edit");
    setIsExModalOpen(true);
  };
  useTableRefreshRegister(fetchReturnList);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Sales Report"
          action={
            hasPermission(permissionList, "showroom_expense_report_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Expense
              </Button>
            ) : undefined
          }
        />
        <div className="mb-4">
          <AllFilter
            isCalendarFilter={true}
            range={range}
            setRange={setRange}
          />
        </div>
        {
          hasPermission(permissionList, "showroom_payment_history_view") && (
            <div className="pt-2 w-full mb-4">
              {cardLoading ? (
                <EmployeeReport />
              ) : (
                <div className="grid 2xl:grid-cols-5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
                  {CardData?.map((data: ICardData, index: number) => {
                    return <ShopCart data={data} key={index} />;
                  })}
                </div>
              )}
            </div>
          )
        }

        <DashboardShowroomContext.Provider
          value={{
            returnListData,
            tableLoading,
            setIsModalOpen,
            isModalOpen,
            fetchReturnList,
            setModalOpen,
            modalOpen,
            setItems,
            expenseListData,
            tableExLoading,
            modalMode,
            items,
            setIsExModalOpen,
            isExModalOpen,
            handleEditClick,
            fetchExpensesReportList,
            expenseQuickData,
            setSearchTerm,
            searchTerm,
            handleSearchChange,
            tableQuickLoading,
            expenseOrdersPerPage,
            expenseTotalOrders,
            expenseCurrentPage,
            setExpenseCurrentPage,
            expenseTotalPages,
            quickOrdersPerPage,
            quickTotalOrders,
            quickCurrentPage,
            setQuickCurrentPage,
            quickTotalPages,
          }}
        >
          {hasPermission(permissionList, "showroom_payment_history_view") && (
            <div className="data-table-card glass-card rounded-2xl orders-table-shell mb-4">
              <div className="premium-table-toolbar">
                <p className="premium-table-toolbar-title">Payment history</p>
                <p className="premium-table-toolbar-meta">
                  {returnListData.length.toLocaleString()}{" "}
                  {returnListData.length === 1 ? "record" : "records"}
                </p>
              </div>
              <div className="data-table-toolbar">
                <div className="data-table-toolbar-start" />
                <div className="data-table-toolbar-end">
                  <TableRefreshButton
                    onRefresh={fetchReturnList}
                    isLoading={tableLoading}
                    className="!h-9"
                  />
                </div>
              </div>
              <DashBoardShowroomTable />
            </div>
          )}

          {hasPermission(permissionList, "showroom_expense_report_view") &&
            expenseListData?.length > 0 && (
              <div className="data-table-card glass-card rounded-2xl orders-table-shell mb-4">
                <div className="premium-table-toolbar">
                  <p className="premium-table-toolbar-title">Expense reports</p>
                  <p className="premium-table-toolbar-meta">
                    {expenseTotalOrders.toLocaleString()}{" "}
                    {expenseTotalOrders === 1 ? "expense" : "expenses"}
                  </p>
                </div>
                <div className="data-table-toolbar">
                  <div className="data-table-toolbar-start" />
                  <div className="data-table-toolbar-end">
                    <TableRefreshButton
                      onRefresh={fetchExpensesReportList}
                      isLoading={tableExLoading}
                      className="!h-9"
                    />
                  </div>
                </div>
                <DashBoardShowroomExpenseTable />
                <PaginationComponent
                  ordersPerPage={expenseOrdersPerPage}
                  handleOrdersPerPageChange={handleExpenseOrdersPerPageChange}
                  currentPage={expenseCurrentPage}
                  setCurrentPage={setExpenseCurrentPage}
                  totalPages={expenseTotalPages}
                  totalData={expenseTotalOrders}
                  isShowText={true}
                  onRefresh={fetchExpensesReportList}
                  isLoading={tableExLoading}
                  showRefresh={false}
                  className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
                />
              </div>
            )}
          <DashboardExpenseModal />

          {hasPermission(
            permissionList,
            "showroom_payment_history_quick_view"
          ) &&
            expenseQuickData.length > 0 && (
              <div className="data-table-card glass-card rounded-2xl orders-table-shell">
                <div className="premium-table-toolbar">
                  <p className="premium-table-toolbar-title">Quick report</p>
                  <p className="premium-table-toolbar-meta">
                    {quickTotalOrders.toLocaleString()}{" "}
                    {quickTotalOrders === 1 ? "record" : "records"}
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
                      onRefresh={fetchListQuick}
                      isLoading={tableQuickLoading}
                      className="!h-9"
                    />
                  </div>
                </div>
                <DashboardQuickReportTable />
                <PaginationComponent
                  ordersPerPage={quickOrdersPerPage}
                  handleOrdersPerPageChange={handleQuickOrdersPerPageChange}
                  currentPage={quickCurrentPage}
                  setCurrentPage={setQuickCurrentPage}
                  totalPages={quickTotalPages}
                  totalData={quickTotalOrders}
                  isShowText={true}
                  showRefresh={false}
                  className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
                />
              </div>
            )}

          <ShowroomQuickViewModal
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            items={items}
            startDate={formattedFrom}
            endDate={formattedTo}
          />
        </DashboardShowroomContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
