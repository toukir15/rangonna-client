"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import ReturnListTable from "@admin/components/pages/ReturnLists/ReturnListTable";
import ReturnListModal from "@admin/components/pages/ReturnLists/ReturnListModal";
import { ReturnListService } from "@admin/@services/apis/ReturnList/ReturnList.service";
import ReturnTab from "@admin/components/pages/ReturnLists/ReturnTab";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useLocalStorageDateRange } from "@admin/utils";
import { last30DaysRange } from "@admin/utils/helper";
import { formatDateRange } from "@admin/utils/hook.utils";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { noPermission } from "@admin/utils/constant";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const ReturnListContext = createContext({} as any);

const DEFAULT_DATE_RANGE = {
  ...last30DaysRange(),
  label: "Last 30 Days",
};

type StatusItem = {
  name: string;
  status: string;
  count?: number;
};

const DEFAULT_RETURN_STATUSES: StatusItem[] = [
  { name: "All", status: "all", count: 0 },
  { name: "Partial", status: "partial-delivery", count: 0 },
  { name: "Return", status: "return", count: 0 },
  { name: "Exchange", status: "exchange", count: 0 },
  { name: "Issue", status: "issue", count: 0 },
  { name: "Close", status: "close", count: 0 },
];

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [returnListData, setReturnListData] = useState<any[]>([]);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [cardLoading, setCardLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isHydrated, setIsHydrated] = useState(false);  const [filter, setFilter] = useState<string>("all");
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [updateId, setUpdateId] = useState<string | null>(null);
  const [range, setRange] = useLocalStorageDateRange(
    "supplierReportDateRange",
    DEFAULT_DATE_RANGE
  );
  const [cardData, setCardData] = useState<any>();
  const [returnStatuses, setReturnStatuses] = useState<StatusItem[]>(
    DEFAULT_RETURN_STATUSES
  );

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    setCurrentPage(1);
    localStorage.setItem("ProductBrandPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchReturnList = async () => {
    if (!isHydrated) return;

    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setTableLoading(true);

    try {
      const res = await ReturnListService.getReturnList({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: productPerPage,
        status: filter,
        startDate: formattedFrom,
        endDate: formattedTo,
        domain: selectedWebsite?.value,
      });

      if (res?.success) {
        setReturnListData(res?.data?.data || []);
        setTotalExpenses(res?.data?.meta?.total_record || 0);      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);

    } finally {
      setTableLoading(false);
    }
  };

  const fetchCartData = async () => {
    if (!isHydrated) return;

    setCardLoading(true);
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    try {
      const res = await ReturnListService.getCartList({
        startDate: formattedFrom,
        endDate: formattedTo,
        domain: selectedWebsite?.value,
      });

      if (res?.success) {
        const data = res?.data;
        setCardData(data);

        const updatedStatuses: StatusItem[] = [
          { name: "All", status: "all", count: data?.total_count ?? 0 },
          {
            name: "Return",
            status: "return",
            count: data?.return_count ?? 0,
          },
          {
            name: "Exchange",
            status: "exchange",
            count: data?.exchange_count ?? 0,
          },
          { name: "Issue", status: "issue", count: data?.issue_count ?? 0 },
          {
            name: "Partial",
            status: "partial-delivery",
            count: data?.partial_count ?? 0,
          },
          { name: "Close", status: "close", count: data?.close_count ?? 0 },
        ];

        setReturnStatuses(updatedStatuses);
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
      setCardLoading(false);
    }
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("ProductBrandPerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }

    const savedFilter = localStorage.getItem("return_list_filter");
    if (savedFilter) {
      setFilter(savedFilter);
    }

    const savedWebsite = localStorage.getItem("selectedReturnWebsite");
    if (savedWebsite) {
      setSelectedWebsite(JSON.parse(savedWebsite));
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !canFetchPageData) return;
    fetchReturnList();
  }, [
    isHydrated,
    canFetchPageData,
    selectedWebsite,
    range,
    filter,
    debouncedSearchTerm,
    currentPage,
    productPerPage,
  ]);

  useEffect(() => {
    if (!isHydrated || !canFetchPageData) return;
    fetchCartData();
  }, [isHydrated, canFetchPageData, range, selectedWebsite]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    localStorage.setItem("return_list_filter", newFilter);
  };

  const handleStatusUpdate = (id: string) => {
    setUpdateId(id);
    setIsAlertOpen(true);
  };

  const cancelUpdate = () => {
    setIsAlertOpen(false);
    setUpdateId(null);
  };

  const StatusUpdate = async () => {
    if (!updateId) return;

    try {
      const res = await ReturnListService.updateStatus(updateId, {
        status: "close",
      });

      if (res?.success) {
        ToastService.success(res?.message);
        fetchReturnList();
        fetchCartData();
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
      setUpdateId(null);
    }
  };

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item.web_name,
            value: item.web_url,
          }));

          setWebsiteOptions([
            { value: "all", label: "All Website" },
            ...options,
          ]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchWebList();
  }, [canFetchPageData]);

  useEffect(() => {
    if (selectedWebsite) {
      localStorage.setItem(
        "selectedReturnWebsite",
        JSON.stringify(selectedWebsite)
      );
    }
  }, [selectedWebsite]);
  useTableRefreshRegister(fetchReturnList);


  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Update"
        cancelLabel="Cancel"
        onConfirm={StatusUpdate}
        onCancel={cancelUpdate}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold text-center">Update Status</h3>
        <h6 className="text-md my-4 text-center">
          Are you sure you want to update the status
        </h6>
      </Alert>

      <NoScrollLayout>
        <div className="md:flex flex-wrap items-center items-center gap-3 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 mb-2">
          <div className="flex flex-wrap items-center items-center gap-4 ">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              Return Lists
            </h2>
              <AllFilter
              isWebsiteFilter={true}
              websiteOptions={websiteOptions}
              selectedWebsite={selectedWebsite}
              setSelectedWebsite={setSelectedWebsite}
              isCalendarFilter={true}
              range={range}
              setRange={setRange}
            />
            <div>
              {permissionList.includes("order_return_create") && (
                <Button
                  className="flex items-center !bg-green-100 !text-green-500 !px-4 !py-1.5"
                  onClick={handleAddClick}
                >

                  <span className="ml-1">Add Return</span>
                </Button>
              )}
            </div>


          </div>
          <div className="md:w-80 w-full md:my-0 my-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              wrapperClass="w-full"
            />
          </div>
        </div>

        
        <div className="px-4 lg:mt-0">
          <ReturnTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            IsSearch={false}
            isCount={true}
            allStatuses={returnStatuses}
          />
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <ReturnListContext.Provider
            value={{
              returnListData,
              tableLoading: tableLoading || cardLoading,
              modalMode,
              setIsModalOpen,
              isModalOpen,
              fetchReturnList,
              handleStatusUpdate,
              cardData,
            }}
          >
            <ReturnListTable />
            <ReturnListModal />
          </ReturnListContext.Provider>

          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalExpenses}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
