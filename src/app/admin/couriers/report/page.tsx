"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { SelectOption } from "@admin/@interfaces/common.interface";
import PathaoCourierQuickView from "@admin/components/pages/Couriers/PathaoCourierQuickView";
import PathaoTable from "@admin/components/pages/BokingCouriers/PathaoTable";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";
import {
  ICourierPathaoContext,
  PathaoBooking,
  PathaoBookingsResponse,
} from "@admin/@interfaces/couriers/report.interface";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import Icon from "@admin/components/core/Icon/Icon";

export const CourierPathaoContext = createContext<ICourierPathaoContext>(
  {} as ICourierPathaoContext,
);

type StatusItem = {
  status: string;
  name: string;
  value?: number;
};

const DEFAULT_PATHAO_STATUSES: StatusItem[] = [
  { status: "all", name: "All", value: 0 },
  { status: "error", name: "Error", value: 0 },
  { status: "in-transit", name: "Transit", value: 0 },
  { status: "assigned-for-delivery", name: "Assigned", value: 0 },
  { status: "on-hold", name: "Hold", value: 0 },
  { status: "paid-return", name: "Paid Return", value: 0 },
  { status: "delivered", name: "Delivered", value: 0 },
  { status: "returned", name: "Returned", value: 0 },
  { status: "created", name: "Pending", value: 0 },
  { status: "picked", name: "Pickup", value: 0 },
  { status: "partial-delivery", name: "Partial Delivery", value: 0 },
  { status: "delivery-failed", name: "Delivery Failed", value: 0 },
  { status: "exchanged", name: "Exchanged", value: 0 },
];

const page: React.FC = () => {
  const [orderId, setOrderId] = useState<string>();
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [cardLoading, setCardLoading] = useState<boolean>(false);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pathaoCurrentPage, setPathaoCurrentPage] = useState<number>(1);
  const [pathaoOrdersPerPage, setPathaoOrdersPerPage] = useState<number>(10);
  const [pathaoList, setPathaoList] = useState<PathaoBooking[]>([]);
  const [totalPathaoOrders, setTotalPathaoOrders] = useState<number>(0);
  const pathaoTotalPages = Math.ceil(totalPathaoOrders / pathaoOrdersPerPage);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<SelectOption>({
    value: "all",
    label: "Order Status",
  });
  const [selectedError, setSelectedError] = useState<SelectOption>({
    value: "all",
    label: "Is Issue",
  });
  const [selectedPaid, setSelectedPaid] = useState<SelectOption>({
    value: "all",
    label: "Payment",
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [courierStatuses, setCourierStatuses] = useState<StatusItem[]>(
    DEFAULT_PATHAO_STATUSES,
  );

  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPathaoCurrentPage(1);
  };

  const errorOption = [
    { value: "all", label: "Is Issue" },
    { value: "false", label: "Done" },
    { value: "true", label: "Error" },
  ];

  const statusPaidOption = [
    { value: "all", label: "Payment" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
  ];

  const orderStatusOptions = [
    { value: "all", label: "Order Status" },
    { value: "pending", label: "Pending" },
    { value: "waiting-payment", label: "To Be Paid" },
    { value: "approved", label: "Approved" },
    { value: "printed", label: "Printed" },
    { value: "ready-for-box", label: "Ready For Box" },
    { value: "in-transit", label: "In Transit" },
    { value: "return", label: "Return" },
    { value: "follow-up", label: "Follow Up" },
    { value: "delivery", label: "Delivery" },
    { value: "cancel", label: "Cancelled" },
    { value: "exchange", label: "Exchange" },
    { value: "unpaid", label: "Unpaid" },
  ];

  const handlePathaoOrdersPerPageChange = (newOrdersPerPage: number) => {
    setPathaoOrdersPerPage(newOrdersPerPage);
    setPathaoCurrentPage(1);
    localStorage.setItem("pathaoListPerPage", newOrdersPerPage.toString());
  };

  useEffect(() => {
    fetchPathaoList();
    fetchCourierCardView();
  }, [
    selectedOrderStatus,
    pathaoOrdersPerPage,
    pathaoCurrentPage,
    filter,
    debouncedSearchTerm,
    selectedPaid,
    selectedError,
  ]);

  const fetchPathaoList = async () => {
    setTableLoading(true);
    OrdersService.getCourierReport({
      delivery_status: filter,
      searchTerm: debouncedSearchTerm,
      page: pathaoCurrentPage,
      limit: pathaoOrdersPerPage,
      domain: "all",
      payment_status: selectedPaid?.value,
      is_error: selectedError?.value,
      order_status: selectedOrderStatus?.value,
    })
      .then((res: PathaoBookingsResponse) => {
        if (res?.success) {
          setPathaoList(res?.data?.data || []);
          setTotalPathaoOrders(res?.data?.meta?.total_record || 0);
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

  const fetchCourierCardView = async () => {
    setCardLoading(true);
    OrdersService.getCourierCardViewReport({
      delivery_status: "all",
      domain: "all",
      payment_status: selectedPaid?.value,
      is_error: selectedError?.value,
      order_status: selectedOrderStatus?.value,
    })
      .then((res: any) => {
        if (res?.success) {
          const apiData = res?.data || [];

          const updatedStatuses = DEFAULT_PATHAO_STATUSES.map((statusItem) => {
            const matched = apiData.find(
              (item: { status: string; count: number }) =>
                item.status === statusItem.status,
            );

            return {
              ...statusItem,
              value: matched?.count ?? 0,
            };
          });

          setCourierStatuses(updatedStatuses);
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

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const handleSelectAll = () => {
    if (isCheck) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(
        pathaoList?.map((order: PathaoBooking) =>
          order?.order_sysid?.toString(),
        ) || [],
      );
    }
    setIsCheck(!isCheck);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSelectedOrders([]);
    setPathaoCurrentPage(1);
  };

  useTableRefreshRegister(fetchPathaoList);

  return (
    <AuthLayout>
      <CourierPathaoContext.Provider
        value={{
          pathaoList,
          tableLoading: tableLoading || cardLoading,
          isCheck,
          handleSelectAll,
          selectedOrders,
          handleSelectOrder,
          handleImageClick,
          setModalOpen,
          modalOpen,
          totalPathaoOrders,
          setOrderId,
          fetchPathaoList,
        }}
      >
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
          <PageHeader title="Courier Report" />

          <div className="data-table-card glass-card rounded-2xl orders-table-shell">
            <div className="premium-table-toolbar">
              <p className="premium-table-toolbar-title">Courier records</p>
              <p className="premium-table-toolbar-meta">
                {totalPathaoOrders.toLocaleString()}{" "}
                {totalPathaoOrders === 1 ? "record" : "records"}
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
                    placeholder="Search courier reports..."
                    aria-label="Search courier reports"
                  />
                </label>
                <AllFilter
                  isStatusFilter={true}
                  statusOption={statusPaidOption}
                  selectedStatus={selectedPaid}
                  setSelectedStatus={setSelectedPaid}
                  isErrorFilter={true}
                  errorOption={errorOption}
                  selectedError={selectedError}
                  setSelectedError={setSelectedError}
                  isOrderStatusFilter={true}
                  orderStatusOptions={orderStatusOptions}
                  selectedOrderStatus={selectedOrderStatus}
                  setSelectedOrderStatus={setSelectedOrderStatus}
                />
              </div>
              <div className="data-table-toolbar-end">
                <TableRefreshButton
                  onRefresh={fetchPathaoList}
                  isLoading={tableLoading || cardLoading}
                  className="!h-9"
                />
              </div>
            </div>

            <div className="px-4 pb-3">
              <OrdersTab
                filter={filter}
                isCount
                allStatuses={courierStatuses}
                handleFilterChange={handleFilterChange}
              />
            </div>

            <PathaoTable />

            <PaginationComponent
              ordersPerPage={pathaoOrdersPerPage}
              handleOrdersPerPageChange={handlePathaoOrdersPerPageChange}
              currentPage={pathaoCurrentPage}
              setCurrentPage={setPathaoCurrentPage}
              totalPages={pathaoTotalPages}
              setSelectedOrders={(orders) =>
                setSelectedOrders(orders as string[])
              }
              totalData={totalPathaoOrders}
              isShowText={true}
              onRefresh={fetchPathaoList}
              isLoading={tableLoading || cardLoading}
              showRefresh={false}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          </div>

          <PathaoCourierQuickView
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            orderId={orderId}
          />

          {isImageOpen && selectedImage && (
            <ImagePreviewModal
              selectedImage={selectedImage}
              closeModal={closeModal}
            />
          )}
        </div>
      </CourierPathaoContext.Provider>
    </AuthLayout>
  );
};

export default page;
