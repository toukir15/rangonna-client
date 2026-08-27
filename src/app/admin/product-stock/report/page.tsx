"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import {
  ProductReport,
  ProductReportResponse,
} from "@admin/@interfaces/report/productReport.interface";
import Button from "@admin/components/core/Button/Button";
import Link from "next/link";
import Image from "next/image";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import EmployeeReport from "@admin/components/Skeleton/Report/EmployeeReport";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import ShopCart from "@admin/components/pages/ShopCart/ShopCart";
import { ICardData } from "@/app/admin/report/employee-report/page";

const Page: React.FC = () => {
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [reportIssueData, setReportIssueData] = useState<ProductReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const getProductReport = () => {
    setTableLoading(true);
    productService
      .fetchProductStockReport({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: ordersPerPage,
      })
      .then((res: ProductReportResponse) => {
        if (res?.success) {
          setReportIssueData(res?.data.data);
          setTotalOrders(res?.data?.meta?.total_record);
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    getProductReport();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);

  const getProductStockSummary = () => {
    setIsLoading(true);
    WarehouseService.getReportSummary()
      .then((res: any) => {
        if (res?.success) {
          setSummaryData(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getProductStockSummary();
  }, []);

  const CardData: any[] = [
    {
      label: "Box Stock",
      value: `${summaryData?.remaining_stock - summaryData?.transit_quantity || 0}`,
      icon: "inventory_2", // boxes / packages
      color: "text-green-500",
    },
    {
      label: "Active Order",
      value: `${summaryData?.active_orders_quantity?.toLocaleString() || 0}`,
      icon: "pending_actions", // order processing
      color: "text-orange-500",
    },

    {
      label: "Current Stock",
      value: `${summaryData?.remaining_stock || 0}`,
      icon: "warehouse", // warehouse stock
      color: "text-yellow-500",
    },
    {
      label: "Transit Order",
      value: `${summaryData?.transit_quantity + summaryData?.wholesale_transit_quantity || 0}`,
      icon: "local_shipping", // delivery truck
      color: "text-blue-500",
    },
    {
      label: "Total Received",
      value: `${summaryData?.purchased_quantity + summaryData?.wholesale_returned_quantity + summaryData?.partial_released_quantity + summaryData?.stock_transfer_received_quantity || 0}`,
      icon: "download_done", // received items
      color: "text-green-500",
    },
    {
      label: "Release Order",
      value: `${summaryData?.released_quantity - summaryData?.partial_released_quantity + summaryData?.stock_transfer_released_quantity + summaryData?.wholesale_released_quantity || 0}`,
      icon: "outbound", // outgoing items
      color: "text-red-500",
    },
  ];
  useTableRefreshRegister(getProductReport);


  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Stock Report" />
        
        <div className="mb-4">
          {isLoading ? (
              <EmployeeReport />
            ) : (
              <div className="grid lg:grid-cols-6 md:grid-cols-2 grid-cols-1 md:gap-4 gap-3 w-full">
                {CardData?.map((data: ICardData, index: number) => {
                  return <ShopCart data={data} key={index} />;
                })}
              </div>
            )}
        </div>

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Stock records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()} records
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
                    placeholder="Search records..."
                    aria-label="Search records"
                  />
                </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={getProductReport}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={reportIssueData}
          noDataViewCondition={
            reportIssueData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-nowrap">
                Image
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-nowrap">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-nowrap">
                Box Stock
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-nowrap">
                Active Order
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 text-nowrap">
                Current Stock
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                Transit Order
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                Total Received
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                Release Order
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                Quick View
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {reportIssueData?.map((report: any, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td>
                    <div>
                      {report?.image && (
                        <Image
                          src={report.image}
                          alt={report.product_title || "product"}
                          width={50}
                          height={50}
                          className="rounded-md object-cover cursor-pointer"
                          onClick={() => handleImageClick(report.image)}
                        />
                      )}
                    </div>
                  </Td>
                  <Td><span className="data-table-primary">{report?.product_title}</span></Td>
                  <Td><span className="table-amount">{report?.remaining_stock - report?.transit_quantity}</span></Td>
                  <Td><span className="table-amount">{report?.active_orders_quantity}</span></Td>

                  <Td><span className="table-amount">{report?.remaining_stock}</span></Td>

                  <Td><span className="table-amount">{report?.transit_quantity +
                      report?.wholesale_transit_quantity}</span></Td>
                  <Td><span className="table-amount">{report?.purchased_quantity +
                      report?.wholesale_returned_quantity +
                      report?.partial_released_quantity +
                      report?.stock_transfer_received_quantity -
                      report?.stock_transfer_released_quantity}</span></Td>
                  <Td><span className="table-amount">{report?.released_quantity -
                      report?.partial_released_quantity +
                      report?.wholesale_released_quantity +
                      report?.stock_transfer_received_quantity -
                      report?.stock_transfer_released_quantity}</span></Td>

                  <Td className="ps-10">
                    <Link
                      href={`/admin/product-stock/details-report/${report?.product}`}
                    >
                      <Button className="bg-blue-500 !text-sm !py-1 !px-4">
                        Report
                      </Button>
                    </Link>
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
            isShowText={true}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
        {isModalOpen && selectedImage && (
          <ImagePreviewModal
            selectedImage={selectedImage}
            closeModal={closeModal}
          />
        )}
      </div>
    </AuthLayout>
  );
};

export default Page;
