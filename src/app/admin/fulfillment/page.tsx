"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, createContext } from "react";
import React from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { SingleOrder } from "@admin/@interfaces/orders/order.interface";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import PageSearch from "@admin/components/core/Search/PageSearch";
import FulfillmentTable from "@admin/components/pages/AllOrders/FulfilmentTable";
import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import FulfilmentAdvance from "@admin/components/pages/ReportIssue/FulfilmentAdvance";
import { noPermission } from "@admin/utils/constant";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";

export const fulfillmentContext = createContext({} as any);

const Page: React.FC = () => {
    const { canFetchPageData } = useGlobalContext();
    const isBulkUpdatingRef = React.useRef(true);
    const [tableLoading, setTableLoading] = useState<boolean>(true);
    const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);    const [currentPage, setCurrentPage] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const savedPage = localStorage.getItem("fulfillmentCurrentPage");
            return savedPage ? Number(savedPage) : 1;
        }
        return 1;
    });

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
    const [selectedStatus, setSelectedStatus] = useState<any | null>({
        value: "all",
        label: "All Status",
    });

    const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("Add");
    const [advanceData, setAdvanceData] = useState<any>();
    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
    const [sysId, setSysId] = useState<string>("");
    const [payLoadingId, setPayLoadingId] = useState<string | null>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        isBulkUpdatingRef.current = false;
    }, [currentPage]);

    const handleOrdersPerPageChange = (newOrdersPerPage: number) => {
        setOrdersPerPage(newOrdersPerPage);
        setCurrentPage(1);

        if (typeof window !== "undefined") {
            localStorage.setItem("ordersListPerPage", newOrdersPerPage.toString());
        }
    };

    const statusOption = [
        { value: "all", label: "All Status" },
        { value: "due", label: "Due" },
        { value: "partial", label: "Partial" },
    ];

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("fulfillmentCurrentPage", currentPage.toString());
        }
    }, [currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, selectedStatus, ordersPerPage]);

    useEffect(() => {
    if (!canFetchPageData) return;
    fetchOrdersList();
  }, [canFetchPageData, debouncedSearchTerm, ordersPerPage, currentPage, selectedStatus]);

    const fetchOrdersList = async () => {
        setTableLoading(true);

        OrdersService.getFulfillmentOrders({
            searchTerm: debouncedSearchTerm,
            page: currentPage,
            limit: ordersPerPage,
            filterStatus: selectedStatus.value,
        })
            .then((res) => {
                if (res?.success) {
                    setOrderList(res?.data?.data || []);
                    setTotalOrders(res?.data?.meta?.total_record || 0);
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

    const fetchAdvanceOrder = async (orderIdParam?: string) => {
        const targetId = orderIdParam || sysId;

        if (!targetId) {
            setAdvanceData([]);
            return [];
        }

        try {
            const res: any = await AdvanceSalaryService.getAdvanceOrderId(targetId);

            if (res?.success) {
                setAdvanceData(res.data);
                return res.data || [];
            } else {
                ToastService.error(res?.message);
                setAdvanceData([]);
                return [];
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Failed to fetch advance data");
            setAdvanceData([]);
            return [];
        }
    };

    const handleAddAdvance = async (orderId: string) => {
        if (!orderId) return;

        setPayLoadingId(orderId);
        setSysId(orderId);

        try {
            const list = await fetchAdvanceOrder(orderId);

            if (list?.length > 0) {
                setModalMode("View");
            } else {
                setModalMode("Add");
            }

            setAdvanceModalOpen(true);
        } finally {
            setPayLoadingId(null);
        }
    };

    const handleAddNewPayment = () => {
        setModalMode("Add");
        setAdvanceModalOpen(true);
    };

    const handleEditPayment = () => {
        setModalMode("Edit");
        setAdvanceModalOpen(true);
    };
  useTableRefreshRegister(fetchOrdersList);


    return (
        <AuthLayout>
            <NoScrollLayout>
                <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 mb-3">
                    <div className="md:flex lg:flex-wrap items-center   gap-3">
                        <div className="flex flex-wrap items-center items-center gap-3 ">
                            <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 ">
                                Order Fulfillment
                            </h1>
              <AllFilter
                                isStatusFilter={true}
                                statusOption={statusOption}
                                selectedStatus={selectedStatus}
                                setSelectedStatus={setSelectedStatus}
                            />
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
                    
                </div>

            </NoScrollLayout>

            <fulfillmentContext.Provider
                value={{
                    orderList,
                    tableLoading,
                    selectedOrders,
                    selectedAction,
                    setSelectedAction,
                    handleImageClick,
                    selectedStatus,
                    handleAddAdvance,
                    setSysId,
                    payLoadingId,
                }}
            >
                <div className="2xl:px-4 px-3 relative w-full">
                    <div className="md:min-h-[83%]">
                        <FulfillmentTable />
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

                    {isImageOpen && selectedImage && (
                        <ImagePreviewModal
                            selectedImage={selectedImage}
                            closeModal={closeModal}
                        />
                    )}
                </div>

                <FulfilmentAdvance
                    isModalOpen={advanceModalOpen}
                    setIsModalOpen={setAdvanceModalOpen}
                    modalMode={modalMode}
                    orderId={sysId}
                    advanceData={advanceData}
                    fetchAdvanceOrder={fetchAdvanceOrder}
                    fetchOrderSumary={fetchOrdersList}
                    handleAddNewPayment={handleAddNewPayment}
                    handleEditPayment={handleEditPayment}
                />
            </fulfillmentContext.Provider>
        </AuthLayout>
    );
};

export default Page;