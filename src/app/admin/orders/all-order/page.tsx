"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";
import { orderListPrit } from "@admin/components/pages/Orders/PrintScreen/OrderListPrint";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { SingleOrder } from "@admin/@interfaces/orders/order.interface";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { formatDateRange } from "@admin/utils/hook.utils";
import OrderInvoice from "@admin/components/pages/Orders/PrintScreen/OrderInvoice";
import InvoicePrint from "@admin/components/pages/Orders/PrintScreen/InvoiceListPrint";
import AllOrderTable from "@admin/components/pages/AllOrders/AllOrderTable";
import OrderQuickViewModal from "@admin/components/pages/AllOrders/OrderQuickViewModal";
import { maxRange } from "@admin/utils/helper";
import AssignOrderTable from "@admin/components/pages/AllOrders/AssignOrderTable";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Alert from "@admin/components/core/Aleart/Aleart";
import Icon from "@admin/components/core/Icon/Icon";
import { noPermission } from "@admin/utils/constant";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import RDPrintCourierModal, {
  RDCourierType,
} from "@admin/components/pages/AllOrders/RDPrintCourierModal";

const DEFAULT_DATE_RANGE = {
  ...maxRange(),
  label: "Max",
};

const ORDER_LIST_FIELDS =
  "_id,createdAt,label,customer.first_name,customer.last_name,customer.phone,note.text,due,is_print,line_items.image,line_items.stock_status,order_id,payment.title,status,total,sysid,domain,customer_note.text,notes.text,line_items.title,line_items.quantity,line_items.total,order_created";

const ALL_SOURCE_OPTIONS = [
  { value: "all", label: "All Source" },
  { value: "showroom", label: "Showroom" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "Whatsapp" },
  { value: "incomplete", label: "Incomplete" },
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone" },
];

export const AllOrderListContext = createContext({} as any);

const Page: React.FC = () => {
  const isBulkUpdatingRef = React.useRef(true);

  const { baseAPI, userInfo, canFetchPageData, permissionList } =
    useGlobalContext();
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedFilter = localStorage.getItem("orderFilter");
      return savedFilter || "all";
    }
    return "all";
  });

  useEffect(() => {
    localStorage.setItem("orderFilter", filter);
  }, [filter]);

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [rdLoading, setRdLoading] = useState<boolean>(false);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [lastSixtyDaysOrders, setLastSixtyDaysOrders] = useState<any[]>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusSubmitting, setStatusSubmitting] = useState<boolean>(false);
  const [orderList, setOrderList] = useState<SingleOrder[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [selectedAction, setSelectedAction] = useState<any>({
    value: "",
    label: "",
  });
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any | null>({
    value: "all",
    label: "All Source",
  });
  const [isRdPrintModalOpen, setIsRdPrintModalOpen] = useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<SelectOption>({
    value: "all",
    label: "All Orders",
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (userInfo?.role === "call-center") {
      setSelectedOrder({ value: "all", label: "All Orders" });
    } else {
      setSelectedOrder({ value: "all", label: "All Orders" });
    }
  }, [userInfo?.role]);

  useEffect(() => {
    isBulkUpdatingRef.current = false;
  }, [filter, currentPage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFilter(localStorage.getItem("orderFilter") || "all");
      const savedOrdersPerPage = localStorage.getItem("ordersListPerPage");
      if (savedOrdersPerPage) {
        setOrdersPerPage(Number(savedOrdersPerPage));
      }
    }
  }, []);

  useEffect(() => {
    if (orderList.length > 0) {
      const allCurrentPageSelected = orderList.every((order) =>
        selectedOrders.includes(String(order?._id)),
      );
      setIsCheck(allCurrentPageSelected);
    } else {
      setIsCheck(false);
    }
  }, [orderList, selectedOrders]);

  const handleOrdersPerPageChange = (newOrdersPerPage: number) => {
    setOrdersPerPage(newOrdersPerPage);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      localStorage.setItem("ordersListPerPage", newOrdersPerPage.toString());
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("currentPage", currentPage.toString());
    }
  }, [currentPage]);

  const handleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = orderList.map((order) => String(order?._id));

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

  // Label print (uses selected orders data)
  const handleOrderPrintSelected = () => {
    const selectedOrdersData = orderList.filter((order) =>
      selectedOrders.includes(String(order?._id)),
    );

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(InvoicePrint({ selectedOrdersData, baseAPI }));
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    } else {
      console.error("Failed to open print window.");
    }
  };

  const handleOrderInvoicePrint = () => {
    OrdersService.getInvoicePrintList(selectedOrders)
      .then((res) => {
        if (res?.success) {
          const printOrderData = res.data;
          const printWindow = window.open("", "PrintWindow");
          if (printWindow) {
            printWindow.document.write(OrderInvoice({ printOrderData }));
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
            }, 1000);
          } else {
            console.error("Failed to open print window.");
          }
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  // List print (table format)
  const handleListPrintSelected = () => {
    const selectedOrdersData = orderList.filter((order) =>
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
      const printContent = orderListPrit(selectedOrdersData, formattedDate);
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

  const fetchRDPrintList = async (
    courierType: RDCourierType,
  ): Promise<SingleOrder[]> => {
    setRdLoading(true);
    const formattedFrom = formatDateRange(DEFAULT_DATE_RANGE.startDate).trim();
    const formattedTo = formatDateRange(DEFAULT_DATE_RANGE.endDate).trim();

    try {
      const res = await OrdersService.getOrders({
        page: 1,
        limit: 2000,
        status: "ready-for-box",
        domain: "all",
        startDate: formattedFrom,
        endDate: formattedTo,
        dateFilter: "createdAt",
        source: selectedSource.value,
        searchTerm: debouncedSearchTerm.trim(),
        courier_type: courierType,
        fields: ORDER_LIST_FIELDS,
      });

      if (res?.success) {
        return res.data.data;
      }

      ToastService.error(res?.message);
      return [];
    } catch (err: any) {
      ToastService.error(err.message);
      return [];
    } finally {
      setRdLoading(false);
    }
  };

  const handleRDListPrint = async (courierType: RDCourierType) => {
    const orders = await fetchRDPrintList(courierType);
    if (!orders?.length) {
      ToastService.error("No R-D orders found");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const printContent = orderListPrit(orders, formattedDate);

      printWindow.document.write(printContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
      setIsRdPrintModalOpen(false);
    } else {
      console.error("Failed to open print window.");
      alert("Please allow pop-ups for this site to enable printing.");
    }
  };

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchOrdersList();
  }, [
    canFetchPageData,
    filter,
    debouncedSearchTerm,
    ordersPerPage,
    currentPage,
    selectedSource?.value,
  ]);

  const fetchOrdersList = async () => {
    setTableLoading(true);
    const formattedFrom = formatDateRange(DEFAULT_DATE_RANGE.startDate).trim();
    const formattedTo = formatDateRange(DEFAULT_DATE_RANGE.endDate).trim();

    try {
      const res = await OrdersService.getOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: filter,
        domain: "all",
        startDate: formattedFrom,
        endDate: formattedTo,
        dateFilter: "createdAt",
        source: selectedSource.value,
        searchTerm: debouncedSearchTerm.trim(),
        fields: ORDER_LIST_FIELDS,
      });

      if (res?.success) {
        setOrderList(res?.data?.data);
        setTotalOrders(res?.data?.meta?.total_record);      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to load orders");
    } finally {
      setTableLoading(false);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);

    setSelectedOrders([]);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      localStorage.setItem("orderFilter", newFilter);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const handleBalkUpdate = async () => {
    isBulkUpdatingRef.current = true;

    if (selectedAction === "printed") {
      setIsAlertOpen(true);
      return;
    }
    setStatusSubmitting(true);

    try {
      for (const sysid of selectedOrders) {
        if (!isBulkUpdatingRef.current) {
          console.warn("Bulk update stopped due to filter/page change.");
          break;
        }

        try {
          const res = await OrdersService.statusUpdate([sysid], {
            status: selectedAction,
          });

          if (res?.success) {
            fetchOrdersList();
          } else {
            ToastService.error(res?.message);
          }
        } catch (err: any) {
          ToastService.error(err.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } finally {
      setStatusSubmitting(false);
      isBulkUpdatingRef.current = false;
    }
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
  };

  const confirmRemove = async () => {
    setStatusSubmitting(true);
    setIsAlertOpen(false);
    try {
      for (const sysid of selectedOrders) {
        if (!isBulkUpdatingRef.current) {
          console.warn("Bulk update stopped due to filter/page change.");
          break;
        }

        try {
          const res = await OrdersService.statusUpdate([sysid], {
            status: selectedAction,
          });

          if (res?.success) {
            fetchOrdersList();
          } else {
            ToastService.error(res?.message);
          }
        } catch (error: any) {
          ToastService.error(error.message);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } finally {
      setStatusSubmitting(false);
      isBulkUpdatingRef.current = false;
    }
  };

  const fetchLastSixtyDay = async () => {
    OrdersService.getLastSixtyDay({
      domain: "all",
    })
      .then((res) => {
        if (res?.success) {
          setLastSixtyDaysOrders(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };
  useEffect(() => {
    if (!canFetchPageData) return;
    fetchLastSixtyDay();
  }, [canFetchPageData]);
  useTableRefreshRegister(fetchOrdersList);


  return (
    <AuthLayout className={` ${selectedOrder.value === "all" ? "" : ""}`}>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Change As Printed"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={statusSubmitting}
      >
        <h3 className="text-2xl font-bold">Change Bulk Status on Printed</h3>
        <h6 className="text-md my-4">
          Are you sure you want to change this bulk status?
        </h6>
        <div className="flex flex-wrap items-center justify-center my-8">
          <Icon
            name="change_circle"
            variant="outlined"
            size={100}
            className="text-yellow-400"
          />
        </div>
      </Alert>

      <AllOrderListContext.Provider
        value={{
          orderList,
          tableLoading,
          selectedOrders,
          handleListPrintSelected,
          handleOrderPrintSelected,
          selectedAction,
          setSelectedAction,
          handleOrderInvoicePrint,
          statusSubmitting,
          isCheck,
          handleBalkUpdate,
          handleSelectAll,
          handleSelectOrder,
          handleImageClick,
          setModalOpen,
          filter,
        }}
      >
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
          <PageHeader
            title="All Orders"
            action={
              permissionList.includes("print_rd_list") ? (
                <button
                  type="button"
                  className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                  onClick={() => setIsRdPrintModalOpen(true)}
                >
                  <Icon name="print" variant="outlined" size={16} />
                  Print R-D
                </button>
              ) : undefined
            }
          />

          {selectedOrder.value === "all" ? (
            <div className="data-table-card glass-card rounded-2xl orders-table-shell">
              <div className="premium-table-toolbar">
                <p className="premium-table-toolbar-title">Order records</p>
                <p className="premium-table-toolbar-meta">
                  {totalOrders.toLocaleString()}{" "}
                  {totalOrders === 1 ? "order" : "orders"}
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
                      placeholder="Search orders..."
                      aria-label="Search orders"
                    />
                  </label>
                  <AllFilter
                    isSourceFilter={true}
                    allSourceOptions={ALL_SOURCE_OPTIONS}
                    selectedSource={selectedSource}
                    setSelectedSource={setSelectedSource}
                  />
                </div>
                <div className="data-table-toolbar-end">
                  <TableRefreshButton
                    onRefresh={fetchOrdersList}
                    isLoading={tableLoading}
                    className="!h-9"
                  />
                </div>
              </div>

              <div className="px-4 pb-3">
                <OrdersTab
                  filter={filter}
                  isCount
                  allStatuses={lastSixtyDaysOrders}
                  handleFilterChange={handleFilterChange}
                />
              </div>

              <AllOrderTable />

              <PaginationComponent
                ordersPerPage={ordersPerPage}
                handleOrdersPerPageChange={handleOrdersPerPageChange}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                setSelectedOrders={(orders) =>
                  setSelectedOrders(orders as string[])
                }
                totalData={totalOrders}
                isShowText={true}
                onRefresh={fetchOrdersList}
                isLoading={tableLoading}
                showRefresh={false}
                className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
              />
            </div>
          ) : (
            <div className="md:min-h-[73%]">
              <AssignOrderTable />
            </div>
          )}

          <OrderQuickViewModal
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
          />

          {isImageOpen && selectedImage && (
            <ImagePreviewModal
              selectedImage={selectedImage}
              closeModal={closeModal}
            />
          )}

          <RDPrintCourierModal
            isOpen={isRdPrintModalOpen}
            onClose={() => setIsRdPrintModalOpen(false)}
            onConfirm={handleRDListPrint}
            isLoading={rdLoading}
          />
        </div>
      </AllOrderListContext.Provider>
    </AuthLayout>
  );
};

export default Page;
