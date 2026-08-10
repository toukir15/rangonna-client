"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { useDebounce } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import PageSearch from "@admin/components/core/Search/PageSearch";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { ReportService } from "@admin/@services/apis/ProductStock/Report/Report.service";

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
  const [warehouseBrandData, setWarehouseBarndData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  const getProductReport = () => {
    setTableLoading(true);
    ReportService.fetchWarehouseBrandReport({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: ordersPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setWarehouseBarndData(res?.data.data);
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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    getProductReport();
  }, [debouncedSearchTerm, currentPage, ordersPerPage]);
  useTableRefreshRegister(getProductReport);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full mb-2">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between md:pb-2 pb-0">
            <div className="md:flex items-center md:space-x-4 w-full">
              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 text-nowrap">
                Warehouse Brand Report
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
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={warehouseBrandData}
          noDataViewCondition={
            warehouseBrandData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[650px]"
          isLoading={tableLoading}
          colValue={2}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200 text-nowrap">
                Brand
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200 text-nowrap">
                Current Stock
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {warehouseBrandData?.map((brandData: any, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>
                    <p className="text-nowrap pb-2 font-semibold">
                      {brandData?.brand}
                    </p>
                  </Td>

                  <Td>
                    <p className="text-nowrap pb-2 font-semibold">
                      {brandData?.remaining_stock - brandData?.transit_quantity}
                    </p>
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
