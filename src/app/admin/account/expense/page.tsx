"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, {
  useState,
  useEffect,
  createContext,
  useMemo,
  useCallback,
} from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { formatDateRange, formatDateTime } from "@admin/utils/hook.utils";
import AllExpensesModal from "@admin/components/pages/AllExpenses/AllExpensesModal";
import { AllExpensesService } from "@admin/@services/apis/Account/AllExpenses/AllExpenses.service";
import {
  IExpense,
  IExpenseResponse,
} from "@admin/@interfaces/account/all-expenses/all-expenses";
import AllExpensesTable from "@admin/components/pages/AllExpenses/AllExpensesTable";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import PageSearch from "@admin/components/core/Search/PageSearch";
import { IWebsiteOption } from "@admin/@interfaces/common.interface";
import { ExpensesService } from "@admin/@services/apis/ExpensesCategory/Expense.service";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const AllExpensesContext = createContext({} as any);

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [expensesData, setAllExpensesData] = useState<IExpense[]>([]);
  const [items, setItems] = useState<IExpense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);  const [range, setRange] = useLocalStorageDateRange(
    "allExpenseDateRange",
    DEFAULT_DATE_RANGE
  );

  // ---------- Options ----------
  const [expenseOption, setExpenseOptions] = useState<IWebsiteOption[]>([]);
  const [accountOptions, setAccountOptions] = useState<IWebsiteOption[]>([]);

  // ✅ Store only primitive selected values (stable)
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [selectedSubTitle, setSelectedSubTitle] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  // ✅ Sub title options source (fetch without sub filter so it doesn’t shrink)
  const [expenseSubOption, setSubExpenseOptions] = useState<IWebsiteOption[]>(
    []
  );
  const [subOptionLoading, setSubOptionLoading] = useState<boolean>(false);

  // Bind selected option objects from options array (prevents react-select clear)
  const selectedExpenses = useMemo(() => {
    if (!selectedExpenseId) return null;
    return expenseOption.find((x) => x.value === selectedExpenseId) || null;
  }, [selectedExpenseId, expenseOption]);

  const selectedSubExpenses = useMemo(() => {
    if (!selectedSubTitle) return null;
    return expenseSubOption.find((x) => x.value === selectedSubTitle) || null;
  }, [selectedSubTitle, expenseSubOption]);

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return accountOptions.find((x) => x.value === selectedAccountId) || null;
  }, [selectedAccountId, accountOptions]);

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

  // ---------- Fetch Expense Categories ----------
  const getExpensesCategory = useCallback(() => {
    ExpensesService.getExpenses({ page: 1, limit: 100 })
      .then((res: any) => {
        if (res?.success) {
          const options = res.data.data.map((item: any) => ({
            label: item.title,
            value: item._id,
          }));
          setExpenseOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message));
  }, []);

  useEffect(() => {
    getExpensesCategory();
  }, [getExpensesCategory]);

  // ---------- Fetch Account List ----------
  const getAccountList = useCallback(() => {
    AccountListService.getAccountList()
      .then((res: any) => {
        if (res?.success) {
          const options = res.data.data.map((item: any) => ({
            label: item?.account_name?.toUpperCase?.() || item?.account_name,
            value: item._id,
          }));
          setAccountOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message));
  }, []);

  useEffect(() => {
    getAccountList();
  }, [getAccountList]);

  // ---------- Restore from localStorage ----------
  useEffect(() => {
    const savedAcc = localStorage.getItem("selectedAccountValue");
    if (savedAcc) setSelectedAccountId(savedAcc);
  }, []);

  // ---------- Persist to localStorage ----------
  useEffect(() => {
    if (selectedAccountId)
      localStorage.setItem("selectedAccountValue", selectedAccountId);
    else localStorage.removeItem("selectedAccountValue");
  }, [selectedExpenseId, selectedSubTitle, selectedAccountId]);

  // ---------- Fetch Sub Titles (without sub filter) ----------
  const getSubTitles = useCallback(async () => {
    if (!selectedExpenseId) {
      setSubExpenseOptions([]);
      setSelectedSubTitle(null);
      return;
    }

    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setSubOptionLoading(true);
    try {
      // ✅ Notice: expense_sub_title পাঠানো হচ্ছে না
      const res: IExpenseResponse = await AllExpensesService.getAllExpenses({
        searchTerm: debouncedSearchTerm,
        page: 1,
        limit: 1000,
        startDate: formattedFrom,
        endDate: formattedTo,
        account: selectedAccountId || undefined,
        expense_category: selectedExpenseId,
      } as any);

      if (res?.success) {
        const subs = (res?.data?.data || [])
          .map((x: any) => (x?.expense_sub_title || "").trim())
          .filter(Boolean);

        const uniqueSubs = Array.from(new Set(subs));

        const options: IWebsiteOption[] = uniqueSubs.map((t) => ({
          label: t,
          value: t,
        }));

        setSubExpenseOptions(options);
        if (
          selectedSubTitle &&
          !options.some((o) => o.value === selectedSubTitle)
        ) {
          setSelectedSubTitle(null);
        }
      } else {
        ToastService.error((res as any)?.message);
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to load sub titles");
    } finally {
      setSubOptionLoading(false);
    }
  }, [
    selectedExpenseId,
    range.startDate,
    range.endDate,
    debouncedSearchTerm,
    selectedAccountId,
    selectedSubTitle,
  ]);

  // ✅ যখন category / date range / account / search বদলাবে, sub titles refresh হবে
  useEffect(() => {
    if (!hasMounted) return;
    getSubTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasMounted,
    selectedExpenseId,
    range.startDate,
    range.endDate,
    debouncedSearchTerm,
    selectedAccountId,
  ]);

  // ---------- Main Table Fetch ----------
  const getAllExpenses = useCallback(() => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setTableLoading(true);

    AllExpensesService.getAllExpenses({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
      startDate: formattedFrom,
      endDate: formattedTo,
      account: selectedAccountId || undefined,
      expense_category: selectedExpenseId || undefined,
      expense_sub_title: selectedSubTitle || undefined,
    } as any)
      .then((res: IExpenseResponse) => {
        if (res?.success) {
          setAllExpensesData(res?.data.data);
          setTotalProduct(res?.data.meta.total_record);
        } else {
          ToastService.error((res as any)?.message);
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message))
      .finally(() => setTableLoading(false));
  }, [
    range.startDate,
    range.endDate,
    debouncedSearchTerm,
    currentPage,
    productPerPage,
    selectedAccountId,
    selectedExpenseId,
    selectedSubTitle,
  ]);

  useEffect(() => {
    if (hasMounted) getAllExpenses();
  }, [hasMounted, getAllExpenses]);

  // ---------- UI Handlers ----------
  const handleEditClick = (data: any) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("allExposePerPage", newProductPerPage.toString());
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
      const res = await AllExpensesService.deleteAllExpenses(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getAllExpenses();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  useTableRefreshRegister(getAllExpenses);

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
        <div className="flex flex-wrap items-center items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>

      <NoScrollLayout>
        <div className=" 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="md:flex flex-wrap items-center items-center gap-3">
            <div className="flex flex-wrap items-center items-center gap-4">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
                Expenses
              </h2>
              <AllFilter
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
                isAccountFilter={true}
                accountOptions={accountOptions}
                selectedAccount={selectedAccount}
                setSelectedAccountId={setSelectedAccountId}
                setCurrentPage={setCurrentPage}
                isExpenseFilter={true}
                expenseOption={expenseOption}
                selectedExpenses={selectedExpenses}
                setSelectedExpenseId={setSelectedExpenseId}
                setSelectedSubTitle={setSelectedSubTitle}
                isExpenseSubFilter={true}
                expenseSubOption={expenseSubOption}
                selectedSubExpenses={selectedSubExpenses}
                subOptionLoading={subOptionLoading}
                selectedExpenseId={selectedExpenseId}
              />
              <div className=" ">
                {hasPermission(permissionList, "account_expense_create") && (
                  <Button
                    className="flex items-center !bg-green-200 !text-green-600 !px-4 !py-1.5"
                    onClick={handleAddClick}
                  >
                    <span className="ml-1 text-nowrap">Add Expenses</span>
                  </Button>
                )}
              </div>



            </div>
            <div className="md:w-80 w-full md:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
          
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <AllExpensesContext.Provider
          value={{
            expensesData,
            tableLoading,
            formatDateTime,
            handleEditClick,
            handleRemove,
            isModalOpen,
            setIsModalOpen,
            modalMode,
            items,
            getAllExpenses,
          }}
        >
          <AllExpensesTable />
          <AllExpensesModal />
        </AllExpensesContext.Provider>

        <PaginationComponent
          ordersPerPage={productPerPage}
          handleOrdersPerPageChange={handleProductPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalData={totalProduct}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
