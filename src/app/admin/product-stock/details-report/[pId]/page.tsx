"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
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
  useTableRefreshRegister(fetchInReport);


    return (
        <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Details Report" />
        
        <div className="mb-4">
          {tableLoading ? (
                                <EmployeeReport />
                            ) : activeType ? (
                                <div className="flex items-center justify-center gap-6 mb-4">
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

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Details records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
                <p className="text-2xl font-bold text-center pb-3">{myWarehouse?.product_name}</p>
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
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchInReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
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
                        <Tr>
                            <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">
                                Date
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                                Reference
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                                Quantity
                            </Th>
                            <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                                Source
                            </Th>
                        </Tr>
                    </Thead>

                    <Tbody>
                        {myWarehouse?.data?.map((reportData: any, index: number) => {
                            return (
                                <Tr key={index}
                                >
                                    <Td><span className="data-table-primary">{formatTimeAgo(reportData?.createdAt) || "-"}</span></Td>
                                    <Td><span className="data-table-primary">{reportData?.reference || "-"}</span></Td>
                                    <Td><span className="table-amount">{activeType === "in"
                                            ? reportData?.quantity || 0
                                            : reportData?.quantity || 0}</span></Td>
                                    <Td><span className="data-table-muted">{reportData?.source || "-"}</span></Td>
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
            isShowText={true}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
        
      </div>
    </AuthLayout>
    );
};

export default Page;