"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import {
  IWebsiteOption,
  IWebsiteResponse,
  SelectOption,
} from "@admin/@interfaces/common.interface";
import PathaoCourierQuickView from "@admin/components/pages/Couriers/PathaoCourierQuickView";
import PathaoTable from "@admin/components/pages/BokingCouriers/PathaoTable";
import CourierOrderTab from "@admin/components/pages/Orders/Components/CourierOrderTab";
import {
  ICourierPathaoContext,
  PathaoBooking,
  PathaoBookingsResponse,
} from "@admin/@interfaces/couriers/report.interface";
import PageSearch from "@admin/components/core/Search/PageSearch";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const CourierPathaoContext = createContext<ICourierPathaoContext>(
  {} as ICourierPathaoContext
);

type StatusItem = {
  status: string;
  name: string;
  count?: number;
};

const DEFAULT_PATHAO_STATUSES: StatusItem[] = [
  { status: "all", name: "All", count: 0 },
  { status: "error", name: "Error", count: 0 },
  { status: "in-transit", name: "Transit", count: 0 },
  { status: "assigned-for-delivery", name: "Assigned", count: 0 },
  { status: "on-hold", name: "Hold", count: 0 },
  { status: "paid-return", name: "Paid Return", count: 0 },
  { status: "delivered", name: "Delivered", count: 0 },
  { status: "returned", name: "Returned", count: 0 },
  { status: "created", name: "Pending", count: 0 },
  { status: "picked", name: "Pickup", count: 0 },
  { status: "partial-delivery", name: "Partial Delivery", count: 0 },
  { status: "delivery-failed", name: "Delivery Failed", count: 0 },
  { status: "exchanged", name: "Exchanged", count: 0 },
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
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
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
    DEFAULT_PATHAO_STATUSES
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
    selectedWebsite,
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
      domain: selectedWebsite?.value,
      payment_status: selectedPaid?.value,
      is_error: selectedError?.value,
      order_status: selectedOrderStatus?.value,
    })
      .then((res: PathaoBookingsResponse) => {
        if (res?.success) {
          setPathaoList(res?.data?.data || []);
          setTotalPathaoOrders(res?.data?.meta?.total_record || 0);        } else {
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
      domain: selectedWebsite?.value,
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
                item.status === statusItem.status
            );

            return {
              ...statusItem,
              count: matched?.count ?? 0,
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
          order?.order_sysid?.toString()
        ) || []
      );
    }
    setIsCheck(!isCheck);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
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

  useEffect(() => {
    fetchWebList();
  }, []);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSelectedOrders([]);
    setPathaoCurrentPage(1);
  };
  useTableRefreshRegister(fetchPathaoList);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 ">
          <div className="md:flex flex-wrap items-center items-center  w-full gap-3">
            <div className="flex flex-wrap items-center items-center  gap-3">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800  text-nowrap">
                Courier Report
              </h1>
              <AllFilter
                isWebsiteFilter={true}
                websiteOptions={websiteOptions}
                selectedWebsite={selectedWebsite}
                setSelectedWebsite={setSelectedWebsite}
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
            <div className="md:w-80 w-full md:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
        </div>

        <div className="px-3 mb-2">
          
          <CourierOrderTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            allStatuses={courierStatuses}
            isCount={true}
          />
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[83%] w-full ">
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
          <PathaoTable />
          <PathaoCourierQuickView
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            orderId={orderId}
          />
        </CourierPathaoContext.Provider>

        <PaginationComponent
          ordersPerPage={pathaoOrdersPerPage}
          handleOrdersPerPageChange={handlePathaoOrdersPerPageChange}
          currentPage={pathaoCurrentPage}
          setCurrentPage={setPathaoCurrentPage}
          totalPages={pathaoTotalPages}
          totalData={totalPathaoOrders}
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
