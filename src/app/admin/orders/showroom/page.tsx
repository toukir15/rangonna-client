"use client";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
import OrderQuickViewModal from "@admin/components/pages/AllOrders/OrderQuickViewModal";
import { todayRange } from "@admin/utils/helper";
import AssignOrderTable from "@admin/components/pages/AllOrders/AssignOrderTable";
import Button from "@admin/components/core/Button/Button";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import PageSearch from "@admin/components/core/Search/PageSearch";
import Alert from "@admin/components/core/Aleart/Aleart";
import Icon from "@admin/components/core/Icon/Icon";
import ShowroomTable from "@admin/components/pages/AllOrders/Showroom/ShowroomTable";
import { noPermission } from "@admin/utils/constant";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

const DEFAULT_DATE_RANGE = {
  ...todayRange(),
  label: "Today",
};

export const ShowroomOrderListContext = createContext({} as any);

const Page: React.FC = () => {
  const isBulkUpdatingRef = React.useRef(true);

  const { baseAPI, userInfo, canFetchPageData, permissionList } = useGlobalContext();
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

  const [range, setRange] = useState<any>(DEFAULT_DATE_RANGE);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
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
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<SelectOption>(
    {
      value: "all",
      label: "All Orders",
    }
  );
  const [selectedStatus, setSelectedStatus] = useState<SelectOption>(
    {
      value: "all",
      label: "Payment Status",
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
    canFetchPageData,selectedStatus, filter, debouncedSearchTerm, ordersPerPage, currentPage, range]);

  useEffect(() => {
    if (["packaging", "team-leader"].includes(userInfo?.role as string)) {
      fetchRDPrintList();
    }
  }, [range, userInfo]);



  const fetchOrdersList = async () => {
    setTableLoading(true);

    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    const payload = {
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
      status: filter,
      startDate: debouncedSearchTerm ? "" : formattedFrom,
      endDate: debouncedSearchTerm ? "" : formattedTo,
      dateFilter: "createdAt",
      payment_status: selectedStatus?.value,
      fields:
        "_id,createdAt,label,customer.first_name,customer.last_name,customer.phone,note.text,due,is_print,line_items.image,order_created,note.text,order_id,payment.title,payment.payment_status,status,total,sysid,domain,customer_note.text,notes.text,line_items.title,line_items.quantity,line_items.total,order_created",
    };

    const apiCall = debouncedSearchTerm
      ? OrdersService.getOrders(payload)
      : OrdersService.getShowroomOrders(payload);

    apiCall
      .then((res: any) => {
        if (res?.success) {
          setOrderList(res?.data?.data);
          setTotalOrders(res?.data?.meta?.total_record);
          setIsFilterOpen(false)
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
  const fetchRDPrintList = async () => {
    setRdLoading(true);
    const formattedFrom = formatDateRange(range.startDate).trim();
    const formattedTo = formatDateRange(range.endDate).trim();

    OrdersService.getShowroomOrders({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: 1000,
      status: "ready-for-box",
      domain: "https://bikreta.com.bd",
      startDate: formattedFrom,
      endDate: formattedTo,
      dateFilter: "createdAt",
      source: "showroom",
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
        const page = err?.message?.toLowerCase() === noPermission ? true : false;
        
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


  const statusOption = [
    {
      label: "All",
      value: "all",
    },
    {
      label: "Due",
      value: "due",
    },
    {
      label: "Partial",
      value: "partial",
    },
    {
      label: "Paid",
      value: "paid",
    },

  ];
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
        <div className="flex items-center justify-center my-8">
          <Icon
            name="change_circle"
            variant="outlined"
            size={100}
            className="text-yellow-400"
          />
        </div>
      </Alert>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 ">
          <div className="md:flex  gap-3">
            <div className="flex items-center gap-3">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 ">
                Sales
              </h1>
              {permissionList.includes("print_rd_product") && (
                <Button
                  className="!bg-green-200 !text-green-600  !py-1.5"
                  onClick={handleRDListPrint}
                  disabled={rdLoading}
                >
                  Print R-D
                </Button>
              )}
              <div >
                <Button
                  className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                >
                  <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
                </Button>
              </div>
            </div>
            <div className="lg:w-80 w-full md:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search Orders"
                wrapperClass="w-full"
              />
            </div>

          </div>

          {
            isFilterOpen && <div >
              <AllFilter
                isFilterOpen={isFilterOpen}
                isStatusFilter={true}
                statusOption={statusOption}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                isCalendarFilter={true}
                range={range}
                setRange={setRange}
              />
            </div>
          }

          {selectedOrder.value === "all" && (
            <OrdersTab
              filter={filter}
              handleFilterChange={handleFilterChange}
            />
          )}
        </div>
      </NoScrollLayout>

      <ShowroomOrderListContext.Provider
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
        <div className="2xl:px-4 px-3 relative  w-full">
          {selectedOrder.value === "all" ? (
            <div className="md:min-h-[83%]">
              <ShowroomTable />
              <PaginationComponent
                ordersPerPage={ordersPerPage}
                handleOrdersPerPageChange={handleOrdersPerPageChange}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                setSelectedOrders={setSelectedOrders}
                totalData={totalOrders}
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
        </div>
      </ShowroomOrderListContext.Provider>
    </AuthLayout>
  );
};

export default Page;
