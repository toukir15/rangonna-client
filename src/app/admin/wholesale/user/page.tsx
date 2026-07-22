"use client";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { SelectOption } from "@admin/@interfaces/common.interface";

import {
  PathaoBooking,
  PathaoBookingsResponse,
} from "@admin/@interfaces/couriers/report.interface";
import PageSearch from "@admin/components/core/Search/PageSearch";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import WholeSaleTable from "@admin/components/pages/wholesale/WholeSaleTable";
import WholeSaleQuickView from "@admin/components/pages/wholesale/WholeSaleQuickView";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import WholeSaleCreatePaymentModal from "@admin/components/pages/wholesale/WholeSalePaymentModal/WholeSalePaymentModal";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
export const WholeSaleUserContext = createContext<any>({} as any);

const page: React.FC = () => {
  const [order, setOrder] = useState<string>();
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pathaoCurrentPage, setPathaoCurrentPage] = useState<number>(1);
  const [pathaoOrdersPerPage, setPathaoOrdersPerPage] = useState<number>(10);
  const [pathaoList, setPathaoList] = useState<PathaoBooking[]>([]);
  const [totalPathaoOrders, setTotalPathaoOrders] = useState<number>(0);
  const pathaoTotalPages = Math.ceil(totalPathaoOrders / pathaoOrdersPerPage);
  const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("View");
  const [paymentData, setPaymentData] = useState<any>();
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const [selectedTiers, setSelectedTiers] = useState<SelectOption>({
    value: "all",
    label: "All Tiers",
  });

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCheck, setIsCheck] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIsOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return "all";
    }
    return "all";
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const tierOption = [
    {
      value: "all",
      label: "All Tiers",
    },
    {
      value: "general",
      label: "General",
    },
    {
      value: "vip",
      label: "VIP",
    },
  ];

  const handlePathaoOrdersPerPageChange = (newOrdersPerPage: number) => {
    setPathaoOrdersPerPage(newOrdersPerPage);
    localStorage.setItem("pathaoListPerPage", newOrdersPerPage.toString());
  };

  useEffect(() => {
    fetchPathaoList();
  }, [
    pathaoOrdersPerPage,
    pathaoCurrentPage,
    filter,
    debouncedSearchTerm,
    selectedTiers,
  ]);

  const fetchPathaoList = async () => {
    setTableLoading(true);
    wholesaleOrderService
      .getWholesaleUser({
        active_status: filter,
        searchTerm: debouncedSearchTerm,
        page: pathaoCurrentPage,
        limit: pathaoOrdersPerPage,
        tier: selectedTiers?.value,
      })
      .then((res: PathaoBookingsResponse) => {
        if (res?.success) {
          setPathaoList(res?.data?.data);
          setTotalPathaoOrders(res?.data?.meta?.total_record);
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

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);

    setSelectedOrders([]);
    setPathaoCurrentPage(1);
  };

  const wholeSaleAllStatus = [
    { status: "all", name: "All Users" },
    { status: "pending", name: "Pending" },
    { status: "approved", name: "Approved" },
    { status: "rejected", name: "Rejected" },
  ];

  const handleStatus = (id: string, status: string) => {
    wholesaleOrderService
      .updateWholeSaleUser(id, {
        active_status: status,
      })
      .then((res: PathaoBookingsResponse) => {
        if (res?.success) {
          setPathaoList(res?.data?.data);
          setTotalPathaoOrders(res?.data?.meta?.total_record);
          fetchPathaoList();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleCreatePayment = (item: any) => {
    setModalMode("Add");
    setModalOpen(true);
    setPaymentData(item);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 ">
          <div className="md:flex  2xl:items-center items-end justify-between mb-2">
            <div className="md:flex items-center gap-3 w-full">
              <div className="flex items-center gap-3">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 text-nowrap">
                  Wholesale User
                </h1>
                <div>
                  <Button
                    className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                  >
                    <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
                  </Button>
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


          </div>
          {
            isFilterOpen && <div >
              <AllFilter
                isFilterOpen={isFilterOpen}
                isWebsiteFilter={true}
                websiteOptions={tierOption}
                selectedWebsite={selectedTiers}
                setSelectedWebsite={setSelectedTiers}
              />
            </div>
          }
        </div>

        <div className="px-3 mb-2">
          <OrdersTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            allStatuses={wholeSaleAllStatus}
            isCount
          />
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[83%] w-full ">
        <WholeSaleUserContext.Provider
          value={{
            pathaoList,
            tableLoading,
            isCheck,
            handleSelectAll,
            selectedOrders,
            handleSelectOrder,
            handleImageClick,
            setIsModalOpen,
            modalOpen,
            totalPathaoOrders,
            setOrder,
            fetchPathaoList,
            handleStatus,
            handleCreatePayment,
          }}
        >
          <WholeSaleTable />
          <WholeSaleQuickView
            isModalOpen={modalIsOpen}
            setIsModalOpen={setIsModalOpen}
            orderDetails={order}
            fetchPathaoList={fetchPathaoList}
          />
        </WholeSaleUserContext.Provider>

        <PaginationComponent
          ordersPerPage={pathaoOrdersPerPage}
          handleOrdersPerPageChange={handlePathaoOrdersPerPageChange}
          currentPage={pathaoCurrentPage}
          setCurrentPage={setPathaoCurrentPage}
          totalPages={pathaoTotalPages}
          totalData={totalPathaoOrders}
        />

        <WholeSaleCreatePaymentModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          paymentData={paymentData}
          modalMode={modalMode}
          refreshData={fetchPathaoList}
          setModalMode={setModalMode}
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
