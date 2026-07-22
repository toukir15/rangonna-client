"use client";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { maxRange } from "@admin/utils/helper";
import { ICardData } from "@/app/admin/report/employee-report/page";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import Button from "@admin/components/core/Button/Button";
import { DetailsReportService } from "@admin/@services/apis/ProductStock/DetailsReport/DetailsReport.service";
import { useParams } from "next/navigation";
import { formatDateRange, formatTimeAgo } from "@admin/utils/hook.utils";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
export interface CancelSource {
    name: string;
    value: number;
}
export interface CancelSummary {
    total_cancel: number;
    verified_count: number;
    sources: CancelSource[];
}

const DEFAULT_DATE_RANGE = {
    ...maxRange(),
    label: "Max",
};

type ReportType = "in" | "out" | null;

const Page: React.FC = () => {
    const params = useParams();
    const pId = params?.pId as string;
    const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
    const [myWarehouseCartData, setMyWarehouseCartData] = useState<any>(null);
    const [myWarehouse, setMyWarehouse] = useState<any>();
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [activeType, setActiveType] = useState<ReportType>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const totalPages = Math.ceil(totalOrders / ordersPerPage);

    const resetData = () => {
        setMyWarehouse([]);
        setMyWarehouseCartData(null);
    };

    const handleLogsPerPageChange = (newLogsPerPage: number) => {
        setOrdersPerPage(newLogsPerPage);
        localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
    };

    const fetchInReport = async () => {
        setTableLoading(true);

        try {
            const reportRes = await DetailsReportService.getMyWarehouseReportIn(pId, {
                startDate: formattedFrom,
                endDate: formattedTo,
            });

            if (reportRes?.success) {
                setMyWarehouse(reportRes?.data || []);
                setTotalOrders(reportRes?.data?.meta?.total_record);
            } else {
                setMyWarehouse([]);
                ToastService.error(reportRes?.message || "Failed to load In report");
            }

            const cartRes = await DetailsReportService.getMyWarehouseReportCartIn(pId, {
                startDate: formattedFrom,
                endDate: formattedTo,
            });


            if (cartRes?.success) {
                setMyWarehouseCartData(cartRes?.data || null);
            } else {
                setMyWarehouseCartData(null);
                ToastService.error(cartRes?.message || "Failed to load In summary");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Something went wrong");
            resetData();
        } finally {
            setTableLoading(false);
        }
    };

    const formattedFrom = formatDateRange(DEFAULT_DATE_RANGE.startDate).trim();
    const formattedTo = formatDateRange(DEFAULT_DATE_RANGE.endDate).trim();

    const fetchOutReport = async () => {
        setTableLoading(true);


        try {
            const reportRes = await DetailsReportService.getMyWarehouseReportOut(pId, {
                startDate: formattedFrom,
                endDate: formattedTo,
            });


            if (reportRes?.success) {
                setMyWarehouse(reportRes?.data || []);
                setTotalOrders(reportRes?.data?.meta?.total_record);
            } else {
                setMyWarehouse([]);
                ToastService.error(reportRes?.message || "Failed to load Out report");
            }

            const cartRes = await DetailsReportService.getMyWarehouseReportCartOut(pId, {
                startDate: formattedFrom,
                endDate: formattedTo,
            });


            if (cartRes?.success) {
                setMyWarehouseCartData(cartRes?.data || null);
            } else {
                setMyWarehouseCartData(null);
                ToastService.error(cartRes?.message || "Failed to load Out summary");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Something went wrong");
            resetData();
        } finally {
            setTableLoading(false);
        }
    };

    const handleInClick = async () => {
        setActiveType("in");
        await fetchInReport();
    };

    const handleOutClick = async () => {
        setActiveType("out");
        await fetchOutReport();
    };

    useEffect(() => {
        if (activeType === "in") {
            fetchInReport();
        } else if (activeType === "out") {
            fetchOutReport();
        }
    }, []);

    const CardData: ICardData[] = [
        {
            label: "Total Quantity",
            value: `${myWarehouseCartData?.total_quantity?.toLocaleString() || 0}`,
            icon: "south_west",
            color: "text-green-600",
        },
        ...(myWarehouseCartData?.source_summary?.map((item: any) => ({
            label: `${item.source}`,
            value: `${item.quantity?.toLocaleString() || 0}`,
            icon: "south_west",
            color: "text-blue-600",
        })) || []),

    ];


    return (
        <AuthLayout>
            <NoScrollLayout>
                <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
                    <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
                        <div className="md:flex items-center md:space-x-4 w-full">


                            <div className=" items-center w-full gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-center pb-3">{myWarehouse?.product_name}</p>
                                </div>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="sm:w-80 w-full sm:mt-0 mt-2 flex gap-3">
                                        <Button
                                            onClick={handleInClick}
                                            className={`w-full text-white ${activeType === "in"
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-green-500 hover:bg-green-600"
                                                }`}
                                        >
                                            In
                                        </Button>

                                        <Button
                                            onClick={handleOutClick}
                                            className={`w-full text-white ${activeType === "out"
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-red-500 hover:bg-red-600"
                                                }`}
                                        >
                                            Out
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="pt-4 w-full items-center justify-center flex">
                            {tableLoading ? (
                                <EmployeeReport />
                            ) : activeType ? (
                                <div className="flex items-center justify-center gap-6 mb-4 ">
                                    {CardData?.map((data: ICardData, index: number) => {
                                        return <ShopCart data={data} key={index} />;
                                    })}
                                </div>
                            ) : (
                                <div className="w-full min-h-[120px] flex items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                                    <p className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
                                        Please click <span className="font-semibold text-green-600">In</span> or{" "}
                                        <span className="font-semibold text-red-600">Out</span> to load report data.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </NoScrollLayout>

            <div className="2xl:px-4 px-3 relative md:min-h-[74%] w-full">
                <TableWrapper
                    showCheckbox={true}
                    data={myWarehouse?.data}
                    noDataViewCondition={
                        !activeType
                            ? "Please select In or Out"
                            : myWarehouse?.data?.length < 1
                                ? "No data available"
                                : null
                    }
                    isSwitchOn={true}
                    isLoading={tableLoading}
                    colValue={4}
                >
                    <Thead>
                        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200">
                                Date
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                                Reference
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                                Quantity
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-blue-900 dark:text-gray-200">
                                Source
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody className="dark:bg-gray-800 bg-white">
                        {myWarehouse?.data?.map((reportData: any, index: number) => {
                            return (
                                <Tr
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                    key={index}
                                >
                                    <Td>{formatTimeAgo(reportData?.createdAt) || "-"}</Td>
                                    <Td>{reportData?.reference || "-"}</Td>
                                    <Td>
                                        {activeType === "in"
                                            ? reportData?.quantity || 0
                                            : reportData?.quantity || 0}
                                    </Td>
                                    <Td>{reportData?.source || "-"}</Td>
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

            </div>

        </AuthLayout>
    );
};

export default Page;