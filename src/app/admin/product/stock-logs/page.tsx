"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { StockLogsService } from "@admin/@services/apis/ProductService/StockLogs/StockLog.service";
import {
  IStockFlowItem,
  IStockFlowResponse,
} from "@admin/@interfaces/product/stockLogs/stockLogs.interface";
import Image from "next/image";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";

const Page: React.FC = () => {
  const [stockLogs, setStockLogs] = useState<IStockFlowItem[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchUserLogs();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);

  const fetchUserLogs = async () => {
    setTableLoading(true);
    StockLogsService.getStockLogs({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
    })
      .then((res: IStockFlowResponse) => {
        if (res?.success) {
          setStockLogs(res.data.data);
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
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };
  useTableRefreshRegister(fetchUserLogs);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Stock Logs" />
        
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Stock Logs records</p>
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
                onRefresh={fetchUserLogs}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
          showCheckbox={true}
          data={stockLogs}
          noDataViewCondition={
            stockLogs?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">
                Product
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40">
                Image
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Action
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Direction
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Stock Location
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Quantity
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Previous Stock
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                New Stock
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Create
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                Update
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {stockLogs?.map((LogsData: IStockFlowItem, index: number) => {
              return (
                <Tr key={index}
                >
                  <Td><span className="data-table-primary">{LogsData?.product_title}</span></Td>
                  <Td>
                    {" "}
                    {
                      <Image
                        src={LogsData?.product?.featured_image?.src}
                        width={60}
                        height={60}
                        alt=""
                        className="rounded-lg cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(
                            LogsData?.product?.featured_image?.src
                          );
                        }}
                      />
                    }
                  </Td>
                  <Td><span className="data-table-primary">{LogsData?.action}</span></Td>
                  <Td>
                    <div
                      className={`text-center rounded-lg py-1 uppercase font-bold ${
                        LogsData?.direction === "in"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {LogsData?.direction}
                    </div>
                  </Td>
                  <Td><span className="table-amount">{LogsData?.stock_location}</span></Td>
                  <Td><span className="table-amount">{LogsData?.quantity}</span></Td>
                  <Td><span className="table-amount">{LogsData?.previous_stock}</span></Td>
                  <Td><span className="table-amount">{LogsData?.new_stock}</span></Td>
                  <Td><span className="table-amount">{formatTimeAgo(LogsData?.createdAt)}</span></Td>
                  <Td><span className="data-table-muted">{formatTimeAgo(LogsData?.updatedAt)}</span></Td>
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

export default Page;
