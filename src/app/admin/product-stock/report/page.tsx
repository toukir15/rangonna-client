"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import {
  ProductReport,
  ProductReportResponse,
} from "@admin/@interfaces/report/productReport.interface";
import PageSearch from "@admin/components/core/Search/PageSearch";
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
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full mb-2">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between md:pb-2 pb-0">
            <div className="md:flex items-center md:space-x-4 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 text-nowrap">
                Stock Report
              </h1>

              <div className="sm:flex items-center w-full justify-between">
                <div className="sm:w-80 w-full sm:mt-0 mt-2">
                  <PageSearch
                    value={searchTerm}
                    onChange={handleSearchChange}
                    wrapperClass="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="">
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
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={reportIssueData}
          noDataViewCondition={
            reportIssueData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[650px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200 text-nowrap">
                Image
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200 text-nowrap">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200 text-nowrap">
                Box Stock
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200  text-nowrap">
                Active Order
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200 text-nowrap">
                Current Stock
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Transit Order
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Total Received
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Release Order
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Quick View
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {reportIssueData?.map((report: any, index: number) => {
              return (
                <Tr
                  className=" hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
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
                  <Td>
                    <div>
                      <p className="text-nowrap pb-2 font-semibold">
                        {report?.product_title}
                      </p>
                    </div>
                  </Td>
                  <Td>
                    <div>
                      {report?.remaining_stock - report?.transit_quantity}
                    </div>
                  </Td>
                  <Td>
                    <div>
                      <p>{report?.active_orders_quantity}</p>
                    </div>
                  </Td>

                  <Td>
                    <div>{report?.remaining_stock}</div>
                  </Td>

                  <Td>
                    {report?.transit_quantity +
                      report?.wholesale_transit_quantity}
                  </Td>
                  <Td>
                    {report?.purchased_quantity +
                      report?.wholesale_returned_quantity +
                      report?.partial_released_quantity +
                      report?.stock_transfer_received_quantity -
                      report?.stock_transfer_released_quantity}
                  </Td>
                  <Td>
                    {report?.released_quantity -
                      report?.partial_released_quantity +
                      report?.wholesale_released_quantity +
                      report?.stock_transfer_received_quantity -
                      report?.stock_transfer_released_quantity}
                  </Td>

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
        />
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
