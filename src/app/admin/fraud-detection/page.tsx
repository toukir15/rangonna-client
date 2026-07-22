"use client";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { FraudDetectionService } from "@admin/@services/apis/FraudDetection/FraudDetection.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import FraudDetectionModal from "@admin/components/pages/FraudDetection/FraudDetectionModal";
import { useGlobalContext } from "@admin/context/GlobalContext";

export type SortField = "total_orders";

type SortDirection = "asc" | "desc";

export interface SortItem {
    field: SortField;
    direction: SortDirection;
}

const Page: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const [fraudDetectionData, setFraudDetectionData] = useState<any[]>([]);
    const [singleFraudDetectionData, setSingleFraudDetectionData] = useState<any[]>([]);
    const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
    const [tableLoading, setTableLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    const handleLogsPerPageChange = (newLogsPerPage: number) => {
        setOrdersPerPage(newLogsPerPage);
        localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchCustomerLists();
    }, [currentPage, ordersPerPage]);

    const fetchCustomerLists = async () => {
        setTableLoading(true);
        FraudDetectionService.getFraudDetectionLists({
            page: currentPage,
            limit: ordersPerPage,
        })
            .then((res: any) => {
                if (res?.success) {
                    setFraudDetectionData(res?.data?.data || []);
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

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        FraudDetectionService.approveFraudDetection(id, {
            is_approved: true
        })
            .then((res: any) => {
                if (res?.success) {
                    ToastService.success("Fraud detection approved successfully");
                    fetchCustomerLists();
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            })
            .finally(() => {
                setApprovingId(null);
            });
    };

    return (
        <AuthLayout>
            <NoScrollLayout>
                <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
                    <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
                        <div className="md:flex items-center md:space-x-4 w-full">
                            <div>
                                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                                    Fraud Detection
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </NoScrollLayout>

            <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full">
                <TableWrapper
                    showCheckbox={true}
                    data={fraudDetectionData}
                    noDataViewCondition={
                        fraudDetectionData?.length < 1 ? "No data available" : null
                    }
                    isSwitchOn={true}
                    className="min-h-[700px]"
                    isLoading={tableLoading}
                    colValue={5}
                >
                    <Thead>
                        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                            <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                                Date
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                                Source
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                                Log Message
                            </Th>
                            <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                                Name
                            </Th>
                            <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                                Quick View
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                                Action
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody className="dark:bg-gray-800 bg-white">
                        {fraudDetectionData?.map((fraudDetection: any, index: number) => {
                            const isApproving = approvingId === fraudDetection?._id;

                            return (
                                <Tr
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                    key={fraudDetection?._id || index}
                                >
                                    <Td>{formatTimeAgo(fraudDetection?.createdAt)}</Td>
                                    <Td>{fraudDetection?.source}</Td>
                                    <Td>{fraudDetection?.log_message}</Td>
                                    <Td>{fraudDetection?.user_name}</Td>
                                    <Td className="ps-10">
                                        <Icon
                                            name={"visibility"}
                                            variant="outlined"
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setModalOpen(true);
                                                setSingleFraudDetectionData(fraudDetection);
                                            }}
                                        />
                                    </Td>

                                    <Td>
                                        {permissionList.includes("fraud_detection_log_edit") &&
                                            fraudDetection?.is_approved === false && (
                                                <Button
                                                    className="!text-xs !bg-blue-600 !px-4 !py-1 min-w-[100px] flex items-center justify-center"
                                                    onClick={() => handleApprove(fraudDetection?._id)}
                                                    disabled={isApproving}
                                                >
                                                    {isApproving ? <ButtonLoader /> : "Approve"}
                                                </Button>
                                            )}
                                    </Td>
                                </Tr>
                            );
                        })}
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
                <FraudDetectionModal
                    isModalOpen={modalOpen}
                    setIsModalOpen={setModalOpen}
                    singleFraudDetectionData={singleFraudDetectionData}
                />
            </div>
        </AuthLayout>
    );
};

export default Page;