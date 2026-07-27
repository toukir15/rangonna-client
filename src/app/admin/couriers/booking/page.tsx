"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, useRef, createContext } from "react";
import React from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Button from "@admin/components/core/Button/Button";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import {
  IWebsiteOption,
  IWebsiteResponse,
  SelectOption,
} from "@admin/@interfaces/common.interface";
import BookingCouriersTable from "@admin/components/pages/BokingCouriers/BookingCouriersTable";
import PathaoCourierQuickView from "@admin/components/pages/Couriers/PathaoCourierQuickView";
import { debounce } from "@admin/utils";
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
import CourierOrderTab from "@admin/components/pages/Orders/Components/CourierOrderTab";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const CourierBookingContext = createContext<ICourierBookingContext>(
  {} as ICourierBookingContext,
);

const page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [orderId, setOrderId] = useState<string>();
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bookingCurrentPage, setBookingCurrentPage] = useState<number>(1);
  const [bookingOrdersPerPage, setBookingOrdersPerPage] = useState<number>(20);
  const [orderList, setOrderList] = useState<PathaoBooking[]>([]);
  const [totalBookingOrders, setTotalBookingOrders] = useState<number>(0);
  const bookingTotalPages = Math.ceil(
    totalBookingOrders / bookingOrdersPerPage,
  );
  const { canFetchPageData } = useGlobalContext();
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const [selectedCourierType, setSelectedCourierType] = useState<SelectOption>({
    value: "all",
    label: "All Courier",
  });
  const courierTypeOptions: SelectOption[] = [
    { value: "all", label: "All Courier" },
    { value: "pathao", label: "Pathao" },
    { value: "steadfast", label: "SteadFast" },
  ];  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [isPaused, setPaused] = useState<boolean>(false);
  const isStopped = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenBooking, setModalOpenBooking] = useState(false);
  const [statusCount, setAllStatusCount] = useState<IPathaoBookingCount>();
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return "all";
    }
    return "all";
  });

  const handleBookingOrdersPerPageChange = (newOrdersPerPage: number) => {
    setBookingOrdersPerPage(newOrdersPerPage);
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
    searchQuery,
    bookingOrdersPerPage,
    bookingCurrentPage,
    selectedWebsite,
    filter,
    selectedCourierType,
  ]);
  useEffect(() => {
    if (!canFetchPageData) return;
    fetchStatusCount();
  }, [canFetchPageData, selectedWebsite, selectedCourierType]);

  const fetchOrdersList = async () => {
    setTableLoading(true);
    OrdersService.getBooking({
      bookingStatus: filter,
      searchTerm: searchQuery,
      page: bookingCurrentPage,
      limit: bookingOrdersPerPage,
      domain: selectedWebsite?.value,
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
          err?.message?.toLowerCase() === "you do not have permission"
            ? true
            : false;
        if (!page) {
          ToastService.error(err.message);
        }

        // ToastService.error(err.message);
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

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchWebList();
  }, [canFetchPageData]);

  const fetchStatusCount = async () => {
    setTableLoading(true);
    OrdersService.getStatusCount({
      domain: selectedWebsite?.value,
      courierType: selectedCourierType?.value,
    })
      .then((res: IPathaoBookingCountResponse) => {
        if (res?.success) {
          setAllStatusCount(res.data);        } else {
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

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSearchQuery("");
    setSelectedOrders([]);
    setBookingCurrentPage(1);
  };

  const debouncedSearch = debounce((query: string) => {
    handleSearch(query);
  }, 1000);

  const handleSearch = (query: string) => {
    setTableLoading(true);
    setSearchQuery(query);
    setTimeout(() => {
      setTableLoading(false);
    }, 500);
  };

  const allStatuses = [
    {
      status: "all",
      name: "All",
      count: statusCount?.total,
    },
    {
      status: "pending",
      name: "Pending",
      count: statusCount?.pending,
    },
    {
      status: "complete",
      name: "Completed",
      count: statusCount?.complete,
    },
  ];
  useTableRefreshRegister(fetchOrdersList);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex flex-wrap items-center items-center justify-between w-full">
              <div className="flex flex-wrap items-center items-center gap-3">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 ">
                  Courier Booking
                </h1>
              <AllFilter
                isWebsiteFilter={true}
                websiteOptions={websiteOptions}
                selectedWebsite={selectedWebsite}
                setSelectedWebsite={setSelectedWebsite}
                isCourierTypeFilter={true}
                courierTypeOptions={courierTypeOptions}
                selectedCourierType={selectedCourierType}
                setSelectedCourierType={(value) => {
                  setSelectedCourierType(value);
                  setBookingCurrentPage(1);
                }}
                setCurrentPage={setBookingCurrentPage}
              />

                {permissionList.includes("courier_booking_create") && (
                  <div className="flex flex-wrap items-center items-center justify-end space-x-5 ">
                    {!isProcessing ? (
                      <Button
                        className="bg-blue-600 flex items-center !px-4"
                        onClick={handleStart}
                        disabled={selectedOrders.length === 0}
                      >
                        <Icon name={"not_started"} className="me-2" />
                        Booking
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStop}
                        className="bg-red-600 flex items-center !px-4"
                      >
                        <Icon name={"stop"} className="me-2" /> Stop
                      </Button>
                    )}

                    {isProcessing && (
                      <Button
                        onClick={isPaused ? handleResume : handlePause}
                        className={`${
                          isPaused ? " bg-green-600" : "bg-yellow-600"
                        } flex items-center !px-4`}
                      >
                        <Icon
                          name={isPaused ? "not_started" : "pause"}
                          className="me-2"
                        />
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-3">
          
          <CourierOrderTab
            filter={filter}
            searchQuery={searchQuery}
            handleFilterChange={handleFilterChange}
            debouncedSearch={debouncedSearch}
            allStatuses={allStatuses}
            isCount
            IsSearch
          />
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[83%] w-full ">
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
          <BookingCouriersTable />
          <PathaoCourierQuickView
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            orderId={orderId}
          />
          <BookingCourierQuickView
            isModalOpen={modalOpenBooking}
            setIsModalOpen={setModalOpenBooking}
          />
        </CourierBookingContext.Provider>

        <PaginationComponent
          ordersPerPage={bookingOrdersPerPage}
          handleOrdersPerPageChange={handleBookingOrdersPerPageChange}
          currentPage={bookingCurrentPage}
          setCurrentPage={setBookingCurrentPage}
          totalPages={bookingTotalPages}
          totalData={totalBookingOrders}
        />

        {isImageOpen && selectedImage && (
          <ImagePreviewModal
            selectedImage={selectedImage}
            closeModal={closeModal}
          />
        )}
      </div>
    </AuthLayout>
  );
};

export default page;
