"use client";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";
import { orderListPrit } from "@admin/components/pages/Orders/PrintScreen/OrderListPrint";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { SingleOrder } from "@admin/@interfaces/orders/order.interface";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { formatDateRange } from "@admin/utils/hook.utils";
import OrderInvoice from "@admin/components/pages/Orders/PrintScreen/OrderInvoice";
import InvoicePrint from "@admin/components/pages/Orders/PrintScreen/InvoiceListPrint";
import OrderQuickViewModal from "@admin/components/pages/AllOrders/OrderQuickViewModal";
import { maxRange } from "@admin/utils/helper";
import Button from "@admin/components/core/Button/Button";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import PageSearch from "@admin/components/core/Search/PageSearch";
import WholesaleOrdersTable from "@admin/components/pages/WholesaleOrders/WholesaleOrdersTable";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import WholeSaleAdvanceModal from "@admin/components/pages/wholesale/WholeSaleAdvanceModal";
import WholeSaleCreatePaymentModal from "@admin/components/pages/wholesale/WholeSalePaymentModal/WholeSalePaymentModal";
import { noPermission } from "@admin/utils/constant";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";

const DEFAULT_DATE_RANGE = {
  ...maxRange(),
  label: "Max",
};

export const WholeSaleOrdersContext = createContext({} as any);

const Page: React.FC = () => {
  const isBulkUpdatingRef = React.useRef(true);
  const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("View");
  const { baseAPI, userInfo, canFetchPageData, permissionList } = useGlobalContext();
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const savedFilter = localStorage.getItem("wholeSaleOrderFilter");
      return savedFilter || "all";
    }
    return "all";
  });

  useEffect(() => {
    localStorage.setItem("wholeSaleOrderFilter", filter);
  }, [filter]);

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [rdLoading, setRdLoading] = useState<boolean>(true);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedRDOrders, setSelectedRDOrders] = useState<SingleOrder[]>([]);
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [wholeSaleData, setSingleWholeSaleData] = useState<any>();
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>();
  const [lastSixtyDaysOrders, setLastSixtyDaysOrders] = useState<any[]>();
  const [selectedOrder, setSelectedOrder] = useState<SelectOption>(
    {
      value: "all",
      label: "All Orders",
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
      setFilter(localStorage.getItem("wholeSaleOrderFilter") || "all");
      const savedOrdersPerPage = localStorage.getItem("ordersListPerPage");
      if (savedOrdersPerPage) {
        setOrdersPerPage(Number(savedOrdersPerPage));
      }
    }

  }, []);

  useEffect(() => {
    if (orderList.length > 0) {
      const allCurrentPageSelected = orderList.every((order) =>
        selectedOrders.includes(String(order?._id))
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = orderList.map((order) => String(order?._id));

    if (isCheck) {
      setSelectedOrders((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
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
      selectedOrders.includes(String(order?._id))
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
    wholesaleOrderService
      .getInvoicePrintList(selectedOrders)
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
      selectedOrders.includes(String(order?._id))
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
  const handleRDListPrint = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const printContent = orderListPrit(selectedRDOrders, formattedDate);
      printWindow.document.write(printContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
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
    // selectedWebsite.value,
    // range,
  ]);

  useEffect(() => {
    if (["packaging", "team-leader"].includes(userInfo?.role as string)) {
      fetchRDPrintList();
    }
  }, [userInfo]);

  const fetchOrdersList = async () => {
    setTableLoading(true);
    const formattedFrom = formatDateRange(DEFAULT_DATE_RANGE.startDate).trim();
    const formattedTo = formatDateRange(DEFAULT_DATE_RANGE.endDate).trim();

    wholesaleOrderService
      .getOrders({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
        status: filter,
        startDate: formattedFrom,
        endDate: formattedTo,
        dateFilter: "createdAt",
        fields:
          "_id,createdAt,label,customer.first_name,customer.last_name,customer.phone,note.text,due,is_print,line_items.image,order_created,note.text,order_id,payment.title,status,total,sysid,domain,customer_note.text,notes.text,line_items.title,line_items.quantity,line_items.total,order_created,paid,payment.transaction_id",
      })
      .then((res) => {
        if (res?.success) {
          setOrderList(res?.data?.data);
          setTotalOrders(res?.data?.meta?.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
        const page = err?.message?.toLowerCase() === noPermission ? true : false;
        
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const fetchRDPrintList = async () => {
    setRdLoading(true);
    const formattedFrom = formatDateRange(DEFAULT_DATE_RANGE.startDate).trim();
    const formattedTo = formatDateRange(DEFAULT_DATE_RANGE.endDate).trim();

    wholesaleOrderService
      .getOrders({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: 1000,
        status: "ready-for-box",
        domain: "https://wholesale.naviforce.com.bd",
        startDate: formattedFrom,
        endDate: formattedTo,
        dateFilter: "createdAt",
        fields:
          "_id,createdAt,customer.first_name,customer.last_name,customer.phone,note.text,due,is_print,line_items.image,order_created,note.text,order_id,payment.title,status,total,sysid,domain,customer_note.text,notes.text,line_items.title,line_items.quantity,line_items.total,order_created",
      })
      .then((res) => {
        if (res?.success) {
          setSelectedRDOrders(res.data.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setRdLoading(false);
      });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);

    setSelectedOrders([]);
    setCurrentPage(1);
    if (typeof window !== "undefined") {
      localStorage.setItem("wholeSaleOrderFilter", newFilter);
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
    setStatusSubmitting(true);
    isBulkUpdatingRef.current = true;

    try {
      for (const sysid of selectedOrders) {
        if (!isBulkUpdatingRef.current) {
          console.warn("Bulk update stopped due to filter/page change.");
          break;
        }

        try {
          const res = await wholesaleOrderService.statusUpdate([sysid], {
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

  const handleDelivery = async (sysId: string, newStatus?: string) => {
    try {
      const res: any = await wholesaleOrderService.wholeSaleUpdateDelivery(
        sysId,
        {
          status: newStatus,
        }
      );

      if (res?.success) {
        fetchOrdersList();
        ToastService.success(res?.message);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message || "Something went wrong");
    }
  };

  const handleShowPayments = (item: any) => {
    setModalMode("View");
    setModalOpen(true);
    setPaymentData(item);
  };

  const handleCreatePayment = (item: any) => {
    setModalMode("Add");
    setModalOpen(true);
    setPaymentData(item);
  };

  const fetchLastSixtyDay = async () => {

    OrdersService.getLastSixtyDay({
      domain: "https://wholesale.naviforce.com.bd"
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
      })
  };
  useEffect(() => {
    if (!canFetchPageData) return;
    fetchLastSixtyDay();
  }, [canFetchPageData, ]);

  return (
    <AuthLayout className={` ${selectedOrder.value === "all" ? "" : ""}`}>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 mb-3">
          <div className="md:flex lg:flex-wrap items-center md:justify-between md:pb-2">
            <div className="md:flex items-center md:space-x-4">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2">
                Wholesale Orders
              </h1>
              <div className="md:flex items-center gap-5 ">
                {permissionList.includes("print_rd_product") && (
                  <Button
                    className="!bg-green-200 !text-green-600 !py-1.5"
                    onClick={handleRDListPrint}
                    disabled={rdLoading}
                  >
                    Print R-D
                  </Button>
                )}
                <div className="lg:w-80 w-full md:my-0 my-2">
                  <PageSearch
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search Orders"
                    wrapperClass="w-full"
                  />
                </div>
              </div>
            </div>

          </div>

          {selectedOrder.value === "all" && (
            <OrdersTab
              filter={filter}
              isCount
              allStatuses={lastSixtyDaysOrders}
              handleFilterChange={handleFilterChange}
            />
          )}
        </div>
      </NoScrollLayout>

      <WholeSaleOrdersContext.Provider
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
          handleDelivery,
          setIsModalOpen,
          setSingleWholeSaleData,
          handleCreatePayment,
          handleShowPayments,
        }}
      >
        <div className="2xl:px-4 px-3 relative  w-full">
          <div className="md:min-h-[83%]">
            <WholesaleOrdersTable />
            <PaginationComponent
              ordersPerPage={ordersPerPage}
              handleOrdersPerPageChange={handleOrdersPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              setSelectedOrders={setSelectedOrders}
              totalData={totalOrders}
              isShowText={false}
            />
          </div>

          <OrderQuickViewModal
            isModalOpen={quickModalOpen}
            setIsModalOpen={setQuickModalOpen}
          />

          {isImageOpen && selectedImage && (
            <ImagePreviewModal
              selectedImage={selectedImage}
              closeModal={closeModal}
            />
          )}

          <WholeSaleAdvanceModal
            wholeSaleData={wholeSaleData}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            fetchOrdersList={fetchOrdersList}
          />
          <WholeSaleCreatePaymentModal
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            paymentData={paymentData}
            modalMode={modalMode}
            refreshData={fetchOrdersList}
            setModalMode={setModalMode}
          />
        </div>
      </WholeSaleOrdersContext.Provider>
    </AuthLayout>
  );
};

export default Page;
