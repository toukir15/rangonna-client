"use client";
import {
  IWebsiteOption,
  IWebsiteResponse,
  SelectOption,
} from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import {
  formatDateRange,
  formatTimeAgo,
  useDebounce,
} from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useRef, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import { getStatusStyle, ReportIssueStatusStyle } from "@admin/utils/system.utils";
import Image from "next/image";
import ReportIssueTab from "@admin/components/pages/Orders/Components/ReportIssueTab";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { maxRange } from "@admin/utils/helper";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import { ReportIssueListPrint } from "@admin/components/pages/Orders/PrintScreen/ReportIssueListPrint";
import Alert from "@admin/components/core/Aleart/Aleart";
import {
  IDeleteReportIssueResponse,
  IOption,
  IReportIssue,
  IReportIssueCategoriesResponse,
  IReportIssueLineItem,
} from "@admin/@interfaces/reportIssue/reportIssue.interface";
import { IReportIssueCategory } from "@admin/@interfaces/setting/reportIssueCategory/reporIssueCategory.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import GlobalLoading from "@admin/components/pages/GlobalLoading/GlobalLoading";
import PageSearch from "@admin/components/core/Search/PageSearch";
import Link from "next/link";
import ManualReportIssueModal from "@admin/components/pages/ReportIssue/ManualReportIssueModal";
import { dueColor, noPermission, paidColor } from "@admin/utils/constant";
import Button from "@admin/components/core/Button/Button";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const LS_KEYS = {
  FILTER: "reportIssueFilter",
  WEBSITE: "reportIssueWebsite",
  TITLE: "reportIssueTitle",
  PER_PAGE: "ordersLogsPerPage",
} as const;

const DEFAULT_DATE_RANGE = {
  ...maxRange(),
  label: "Max",
};

type StatusItem = {
  name: string;
  status: string;
  count?: number;
};

const DEFAULT_STATUSES: StatusItem[] = [
  { name: "All", status: "all", count: 0 },
  { name: "Pending", status: "pending", count: 0 },
  { name: "Received", status: "received-product", count: 0 },
  { name: "Assign", status: "assign", count: 0 },
  { name: "Servicing", status: "product-sent-to-supplier", count: 0 },
  { name: "R-Supplier", status: "received-from-supplier", count: 0 },
  { name: "Checking", status: "checking", count: 0 },
  { name: "Solved", status: "solved", count: 0 },
  { name: "Delivery", status: "delivery", count: 0 },
  { name: "R-D", status: "ready-for-box", count: 0 },
  { name: "Close", status: "close", count: 0 },
];

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();

  const [filter, setFilter] = useState<string>("all");
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const [selectedIssueTitle, setSelectedIssueTitle] = useState<SelectOption>({
    label: "All",
    value: "all",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaid, setSelectedPaid] = useState<SelectOption>({
    value: "all",
    label: "Payment",
  });

  const [range, setRange] = useState(DEFAULT_DATE_RANGE);

  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [cardLoading, setCardLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const [reportIssueData, setReportIssueData] = useState<IReportIssue[]>([]);
  const [reportCategories, setReportCategories] = useState<IOption[]>([]);
  const [reportIssueStatuses, setReportIssueStatuses] =
    useState<StatusItem[]>(DEFAULT_STATUSES);

  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean>(false);

  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedFilter = localStorage.getItem(LS_KEYS.FILTER);
    if (savedFilter) setFilter(savedFilter);

    const savedPerPage = localStorage.getItem(LS_KEYS.PER_PAGE);
    if (savedPerPage && !Number.isNaN(Number(savedPerPage))) {
      setOrdersPerPage(Number(savedPerPage));
    }

    const savedWebsite = localStorage.getItem(LS_KEYS.WEBSITE);
    if (savedWebsite) {
      try {
        const w = JSON.parse(savedWebsite) as SelectOption;
        if (w?.value && w?.label) setSelectedWebsite(w);
      } catch {}
    }

    const savedTitle = localStorage.getItem(LS_KEYS.TITLE);
    if (savedTitle) {
      try {
        const t = JSON.parse(savedTitle) as SelectOption;
        if (t?.value && t?.label) setSelectedIssueTitle(t);
      } catch {}
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.FILTER, filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.PER_PAGE, String(ordersPerPage));
  }, [ordersPerPage]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.WEBSITE, JSON.stringify(selectedWebsite));
  }, [selectedWebsite]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.TITLE, JSON.stringify(selectedIssueTitle));
  }, [selectedIssueTitle]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    setCurrentPage(1);
  };

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchWebList();
  }, [canFetchPageData]);

  useEffect(() => {
    if (!modalOpen) return;
    if (reportCategories?.length) return;
    getReportCategory();
  }, [modalOpen]);

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: IWebsiteResponse) => ({
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

  const getReportCategory = () => {
    ReportIssueCategoryService.getReportIssueCategory()
      .then((res: IReportIssueCategoriesResponse) => {
        if (res?.success) {
          const formattedData = res.data.data.map(
            (item: IReportIssueCategory) => ({
              label: item.issue_title
                .toLowerCase()
                .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              value: item.issue_title,
            }),
          );
          setReportCategories([
            { value: "all", label: "All" },
            ...formattedData,
          ]);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err.message || "An error occurred while fetching report categories",
        );
      });
  };

  const fetchReportIssue = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setTableLoading(true);

    ReportIssueCategoryService.getReportIssue({
      searchTerm: debouncedSearchTerm,
      status: filter,
      page: currentPage,
      limit: ordersPerPage,
      startDate: !searchTerm ? formattedFrom : undefined,
      endDate: !searchTerm ? formattedTo : undefined,
      issue_title: selectedIssueTitle?.value,
      web_url: selectedWebsite.value,
      payment_status: selectedPaid?.value,
    })
      .then((res: any) => {
        if (res?.success) {
          setReportIssueData(res?.data?.data || []);
          setTotalOrders(res?.data?.meta?.total_record || 0);
          setIsFilterOpen(false);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
        const page =
          err?.message?.toLowerCase() === noPermission ? true : false;
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const getReportIssueCard = () => {
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    setCardLoading(true);

    ReportIssueCategoryService.getReportIssueCard({
      startDate: !searchTerm ? formattedFrom : undefined,
      endDate: !searchTerm ? formattedTo : undefined,
      issue_title: selectedIssueTitle?.value,
      web_url: selectedWebsite.value,
    })
      .then((res: any) => {
        if (res?.success) {
          const apiData = res?.data || [];

          const updatedStatuses = DEFAULT_STATUSES.map((statusItem) => {
            const matched = apiData.find(
              (apiItem: { status: string; count: number }) =>
                apiItem.status === statusItem.status,
            );

            return {
              ...statusItem,
              count: matched?.count ?? 0,
            };
          });

          setReportIssueStatuses(updatedStatuses);
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
    if (!isInitialized || !canFetchPageData) return;
    fetchReportIssue();
    getReportIssueCard();
  }, [
    canFetchPageData,
    filter,
    debouncedSearchTerm,
    currentPage,
    ordersPerPage,
    selectedIssueTitle?.value,
    range,
    selectedWebsite,
    isInitialized,
    selectedPaid,
  ]);

  const handleSelectAll = () => {
    const currentPageIds = reportIssueData.map((order) => String(order?._id));
    if (isCheck) {
      setSelectedOrders((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedOrders((prev) => {
        const newSelection = new Set(prev);
        currentPageIds.forEach((id) => newSelection.add(id));
        return Array.from(newSelection);
      });
    }
  };

  const handleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    if (reportIssueData.length === 0) {
      setIsCheck(false);
      return;
    }
    const currentPageIds = reportIssueData.map((order) => String(order?._id));
    const allSelected = currentPageIds.every((id) =>
      selectedOrders.includes(id),
    );
    setIsCheck(allSelected);
  }, [reportIssueData, selectedOrders]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const handleListPrintSelected = () => {
    const selectedOrdersData = reportIssueData.filter((order) =>
      selectedOrders.includes(String(order?._id)),
    );

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const printContent = ReportIssueListPrint(
        selectedOrdersData,
        formattedDate,
      );
      printWindow.document.write(printContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } else {
      alert("Please allow pop-ups for this site to enable printing.");
    }
  };

  const handleRemoveProduct = (index: string) => {
    setItemToDelete(index);
    setIsAlertOpen(true);
  };

  const confirmRemoveWebsite = () => {
    if (!itemToDelete) return;

    setTableLoading(true);
    ReportIssueCategoryService.reportIssueDelete(itemToDelete)
      .then((res: IDeleteReportIssueResponse) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsAlertOpen(false);
          fetchReportIssue();
          getReportIssueCard();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
        setIsAlertOpen(false);
      });
  };

  const statusPaidOption = [
    { value: "all", label: "Payment" },
    { value: "paid", label: "Paid" },
    { value: "partial", label: "Partial" },
    { value: "Due", label: "due" },
  ];

  if (!isInitialized) {
    return <GlobalLoading />;
  }

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveWebsite}
        onCancel={() => setIsAlertOpen(false)}
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
            size={110}
            className="text-red-400"
          />
        </div>
      </Alert>

      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full mb-2">
          <div className="md:flex  items-center w-full gap-3 lg:mb-0 mb-2">
            <div className="flex items-center gap-3 lg:mb-0 mb-2 ">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 text-nowrap">
                Report Issue
              </h1>
              {permissionList.includes("report_issue_create") && (
                <button
                  className="text-nowrap bg-red-200 text-red-600 rounded-lg px-2 py-1 hover:bg-red-200 transition-all text-sm"
                  onClick={() => setModalOpen(true)}
                >
                  Create Issue
                </button>
              )}
              <div>
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
            </div>
            <div className="md:w-80 w-full">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Issue Orders"
                wrapperClass="w-full"
              />
            </div>
          </div>
          {isFilterOpen && (
            <div>
              <AllFilter
                isFilterOpen={isFilterOpen}
                isWebsiteFilter={true}
                websiteOptions={websiteOptions}
                selectedWebsite={selectedWebsite}
                setSelectedWebsite={setSelectedWebsite}
                isStatusFilter={true}
                statusOption={statusPaidOption}
                selectedStatus={selectedPaid}
                setSelectedStatus={setSelectedPaid}
                isCategoryFilter={true}
                reportCategories={reportCategories}
                selectedIssueTitle={selectedIssueTitle}
                setSelectedIssueTitle={setSelectedIssueTitle}
                setCurrentPage={setCurrentPage}
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
          )}

          <ReportIssueTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            IsSearch={false}
            isCount={true}
            allStatuses={reportIssueStatuses}
          />
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={reportIssueData}
          noDataViewCondition={
            reportIssueData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[650px]"
          isLoading={tableLoading || cardLoading}
          colValue={11}
          isSelect={selectedOrders.length > 0}
          handleListPrintSelected={handleListPrintSelected}
          orderListPrintBtn={true}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th>
                <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                View
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                Order ID
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Product
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Issue Title
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Description
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                Last Note
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 ps-10">
                Order Status
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 ps-14">
                Status
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Amount
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Action
              </Th>
            </Tr>
          </Thead>

          <Tbody className="dark:bg-gray-800 bg-white">
            {reportIssueData?.map((reportIssue: any, index: number) => (
              <Tr
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                key={index}
              >
                <Td>
                  <TableCheckbox
                    checked={selectedOrders.includes(reportIssue._id)}
                    onChange={() => handleSelectOrder(reportIssue._id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Td>
                <Td>
                  <div>
                    <Link
                      className="bg-blue-600 w-20 text-center text-white py-1 rounded-lg px-6 cursor-pointer"
                      href={`/report-issue/view/${reportIssue?._id}`}
                      onClick={() => {
                        localStorage.setItem(
                          "viewReportIssueOrderStatus",
                          filter,
                        );
                      }}
                    >
                      View
                    </Link>
                  </div>
                </Td>

                <Td>
                  <p className="font-bold">{reportIssue?.order_sysid}</p>
                  <p>{reportIssue?.phone}</p>
                  <p>{formatDateRange(reportIssue?.createdAt)}</p>
                </Td>

                <Td>
                  {reportIssue?.report_issue_line_items?.map(
                    (data: IReportIssueLineItem, i: number) => (
                      <div key={i}>
                        <Image
                          src={data?.image}
                          width={60}
                          height={60}
                          alt=""
                          className="rounded-lg cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageClick(data?.image);
                          }}
                        />
                      </div>
                    ),
                  )}
                </Td>

                <Td>
                  <p>{reportIssue?.issue_title}</p>
                  <p className="pt-1">{reportIssue?.issue_sub_title}</p>
                </Td>

                <Td>
                  <p> {formatTimeAgo(reportIssue?.updatedAt)}</p>
                  <p className="pt-1">{reportIssue?.description}</p>
                </Td>

                <Td>
                  <p>{reportIssue?.last_note?.text}</p>
                </Td>

                <Td>
                  <div
                    className={`w-40 text-center ${getStatusStyle(
                      reportIssue?.order?.status,
                    )}`}
                  >
                    {reportIssue?.order?.status === "ready-for-box"
                      ? "R-D"
                      : reportIssue?.order?.status === "waiting-payment"
                        ? "To be Paid"
                        : reportIssue?.order?.status}
                  </div>
                </Td>

                <Td>
                  <div
                    className={`w-40 text-center ${ReportIssueStatusStyle(
                      reportIssue?.status,
                    )}`}
                  >
                    {reportIssue?.status === "product-sent-to-supplier"
                      ? "S-SUP"
                      : reportIssue?.status === "received-from-supplier"
                        ? "R-SUP"
                        : reportIssue?.status}
                  </div>
                </Td>

                <Td>
                  <p>Total: {reportIssue?.payment?.amount}</p>
                  <p className="py-1">
                    Paid:{" "}
                    <span className={paidColor}>
                      {reportIssue?.payment?.paid}
                    </span>
                  </p>
                  <p>
                    Due:{" "}
                    <span className={dueColor}>
                      {reportIssue?.payment?.due}
                    </span>
                  </p>
                </Td>

                <Td>
                  {permissionList.includes("report_issue_delete") && (
                    <div className="relative max-w-40">
                      <Icon
                        name={"more_horiz"}
                        variant="outlined"
                        onClick={() => togglePopup(index)}
                        className="cursor-pointer"
                      />
                      {popupIndex === index && (
                        <div
                          ref={popupRef}
                          className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-2 z-20 min-w-40"
                        >
                          <button
                            onClick={() =>
                              handleRemoveProduct(reportIssue?._id)
                            }
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrapper>

        <PaginationComponent
          ordersPerPage={ordersPerPage}
          handleOrdersPerPageChange={handleLogsPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          totalData={totalOrders}
        />

        {isImageOpen && selectedImage && (
          <ImagePreviewModal
            selectedImage={selectedImage}
            closeModal={closeModal}
          />
        )}

        <ManualReportIssueModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          getReportIssue={fetchReportIssue}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
