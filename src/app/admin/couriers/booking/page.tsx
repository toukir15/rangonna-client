"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, useRef, createContext } from "react";
import React from "react";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { SelectOption } from "@admin/@interfaces/common.interface";
import BookingCouriersTable from "@admin/components/pages/BokingCouriers/BookingCouriersTable";
import PathaoCourierQuickView from "@admin/components/pages/Couriers/PathaoCourierQuickView";
import BookingCourierQuickView from "@admin/components/pages/Couriers/BookingCourierQuickView";
import {
  IBookingResponse,
  ICourierBookingContext,
  IPathaoBookingCount,
  IPathaoBookingCountResponse,
  PathaoBooking,
  PathaoBookingsResponse,
} from "@admin/@interfaces/couriers/booking.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";

export const CourierBookingContext = createContext<ICourierBookingContext>(
  {} as ICourierBookingContext,
);

const page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [orderId, setOrderId] = useState<string>();
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bookingCurrentPage, setBookingCurrentPage] = useState<number>(1);
  const [bookingOrdersPerPage, setBookingOrdersPerPage] = useState<number>(20);
  const [orderList, setOrderList] = useState<PathaoBooking[]>([]);
  const [totalBookingOrders, setTotalBookingOrders] = useState<number>(0);
  const bookingTotalPages = Math.ceil(
    totalBookingOrders / bookingOrdersPerPage,
  );
  const [selectedCourierType, setSelectedCourierType] = useState<SelectOption>({
    value: "all",
    label: "All Courier",
  });
  const courierTypeOptions: SelectOption[] = [
    { value: "all", label: "All Courier" },
    { value: "pathao", label: "Pathao" },
    { value: "steadfast", label: "SteadFast" },
  ];
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [isPaused, setPaused] = useState<boolean>(false);
  const isStopped = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenBooking, setModalOpenBooking] = useState(false);
  const [statusCount, setAllStatusCount] = useState<IPathaoBookingCount>();
  const [filter, setFilter] = useState<string>("all");

  const handleBookingOrdersPerPageChange = (newOrdersPerPage: number) => {
    setBookingOrdersPerPage(newOrdersPerPage);
    setBookingCurrentPage(1);
    localStorage.setItem("bookingListPerPage", newOrdersPerPage.toString());
  };

  useEffect(() => {
    localStorage.setItem("bookingCurrentPage", bookingCurrentPage.toString());
  }, [bookingCurrentPage]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchOrdersList();
  }, [
    canFetchPageData,
    debouncedSearchTerm,
    bookingOrdersPerPage,
    bookingCurrentPage,
    filter,
    selectedCourierType,
  ]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchStatusCount();
  }, [canFetchPageData, selectedCourierType]);

  const fetchOrdersList = async () => {
    setTableLoading(true);
    OrdersService.getBooking({
      bookingStatus: filter,
      searchTerm: debouncedSearchTerm.trim(),
      page: bookingCurrentPage,
      limit: bookingOrdersPerPage,
      domain: "all",
      courierType: selectedCourierType?.value,
    })
      .then((res: PathaoBookingsResponse) => {
        if (res?.success) {
          setOrderList(res?.data?.data);
          setTotalBookingOrders(res?.data?.meta?.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        const page =
          err?.message?.toLowerCase() === "you do not have permission";
        if (!page) {
          ToastService.error(err.message);
        }
      })
      .finally(() => {
        setTableLoading(false);
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

  const fetchStatusCount = async () => {
    OrdersService.getStatusCount({
      domain: "all",
      courierType: selectedCourierType?.value,
    })
      .then((res: IPathaoBookingCountResponse) => {
        if (res?.success) {
          setAllStatusCount(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleSelectAll = () => {
    if (isCheck) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(
        orderList?.map((order: PathaoBooking) => order?.order?._id),
      );
    }
    setIsCheck(!isCheck);
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handlePause = () => {
    setPaused(true);
    isPausedRef.current = true;
  };

  const handleResume = () => {
    setPaused(false);
    isPausedRef.current = false;
  };

  const handleRequestBooking = async () => {
    const selectedData = orderList.filter((order: PathaoBooking) =>
      selectedOrders.includes(order?.order?._id),
    );

    setProcessing(true);
    setPaused(false);

    for (const order of selectedData) {
      if (isStopped.current) break;
      while (isPausedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        continue;
      }

      CourierService.createBooking(order?.order?._id)
        .then((res: IBookingResponse) => {
          if (res?.success) {
            fetchOrdersList();
            fetchStatusCount();
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

      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    setProcessing(false);
  };

  const handleStart = () => {
    isStopped.current = false;
    isPausedRef.current = false;
    handleRequestBooking();
  };

  const handleStop = () => {
    isStopped.current = true;
    setProcessing(false);
    setPaused(false);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSearchTerm("");
    setSelectedOrders([]);
    setBookingCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setBookingCurrentPage(1);
  };

  const allStatuses = [
    {
      status: "all",
      name: "All",
      value: statusCount?.total,
    },
    {
      status: "pending",
      name: "Pending",
      value: statusCount?.pending,
    },
    {
      status: "complete",
      name: "Completed",
      value: statusCount?.complete,
    },
  ];

  useTableRefreshRegister(fetchOrdersList);

  const bookingActions = permissionList.includes("courier_booking_create") ? (
    <div className="flex flex-wrap items-center gap-2">
      {!isProcessing ? (
        <button
          type="button"
          className="btn-primary btn-primary-inline inline-flex items-center gap-2"
          onClick={handleStart}
          disabled={selectedOrders.length === 0}
        >
          <Icon name="not_started" variant="outlined" size={16} />
          Booking
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--color-danger,#dc2626)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          onClick={handleStop}
        >
          <Icon name="stop" variant="outlined" size={16} />
          Stop
        </button>
      )}

      {isProcessing && (
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 ${
            isPaused
              ? "bg-[var(--color-success,#16a34a)]"
              : "bg-[var(--color-warning,#ca8a04)]"
          }`}
          onClick={isPaused ? handleResume : handlePause}
        >
          <Icon
            name={isPaused ? "not_started" : "pause"}
            variant="outlined"
            size={16}
          />
          {isPaused ? "Resume" : "Pause"}
        </button>
      )}
    </div>
  ) : undefined;

  return (
    <AuthLayout>
      <CourierBookingContext.Provider
        value={{
          orderList,
          tableLoading,
          isCheck,
          handleSelectAll,
          selectedOrders,
          handleSelectOrder,
          handleImageClick,
          setModalOpen,
          modalOpen,
          setModalOpenBooking,
          setOrderId,
        }}
      >
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
          <PageHeader title="Courier Booking" action={bookingActions} />

          <div className="data-table-card glass-card rounded-2xl orders-table-shell">
            <div className="premium-table-toolbar">
              <p className="premium-table-toolbar-title">Booking records</p>
              <p className="premium-table-toolbar-meta">
                {totalBookingOrders.toLocaleString()}{" "}
                {totalBookingOrders === 1 ? "booking" : "bookings"}
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
                    placeholder="Search bookings..."
                    aria-label="Search bookings"
                  />
                </label>
                <AllFilter
                  isCourierTypeFilter={true}
                  courierTypeOptions={courierTypeOptions}
                  selectedCourierType={selectedCourierType}
                  setSelectedCourierType={(value) => {
                    setSelectedCourierType(value);
                    setBookingCurrentPage(1);
                  }}
                  setCurrentPage={setBookingCurrentPage}
                />
              </div>
              <div className="data-table-toolbar-end">
                <TableRefreshButton
                  onRefresh={fetchOrdersList}
                  isLoading={tableLoading}
                />
              </div>
            </div>

            <div className="px-4 pb-3">
              <OrdersTab
                filter={filter}
                isCount
                allStatuses={allStatuses}
                handleFilterChange={handleFilterChange}
              />
            </div>

            <BookingCouriersTable />

            <PaginationComponent
              ordersPerPage={bookingOrdersPerPage}
              handleOrdersPerPageChange={handleBookingOrdersPerPageChange}
              currentPage={bookingCurrentPage}
              setCurrentPage={setBookingCurrentPage}
              totalPages={bookingTotalPages}
              setSelectedOrders={(orders) =>
                setSelectedOrders(orders as string[])
              }
              totalData={totalBookingOrders}
              isShowText={true}
              onRefresh={fetchOrdersList}
              isLoading={tableLoading}
              showRefresh={false}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          </div>

          <PathaoCourierQuickView
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            orderId={orderId}
          />
          <BookingCourierQuickView
            isModalOpen={modalOpenBooking}
            setIsModalOpen={setModalOpenBooking}
          />

          {isImageOpen && selectedImage && (
            <ImagePreviewModal
              selectedImage={selectedImage}
              closeModal={closeModal}
            />
          )}
        </div>
      </CourierBookingContext.Provider>
    </AuthLayout>
  );
};

export default page;
