"use client";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import PageSearch from "@admin/components/core/Search/PageSearch";
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
  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Stock Logs
                </h1>
              </div>
              <div className="md:w-80 w-full md:mt-0 mt-1">
                <PageSearch
                  value={searchTerm}
                  onChange={handleSearchChange}
                  wrapperClass="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={stockLogs}
          noDataViewCondition={
            stockLogs?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                Product
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                Image
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Action
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Direction
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Stock Location
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Quantity
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Previous Stock
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                New Stock
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Create
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Update
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {stockLogs?.map((LogsData: IStockFlowItem, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{LogsData?.product_title}</Td>
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
                  <Td>{LogsData?.action}</Td>
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
                  <Td>{LogsData?.stock_location}</Td>
                  <Td>{LogsData?.quantity}</Td>
                  <Td>{LogsData?.previous_stock}</Td>
                  <Td>{LogsData?.new_stock}</Td>
                  <Td>{formatTimeAgo(LogsData?.createdAt)}</Td>
                  <Td>{formatTimeAgo(LogsData?.updatedAt)}</Td>
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
