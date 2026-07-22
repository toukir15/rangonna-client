"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { StockTransferService } from "@admin/@services/apis/ProductStock/Transfer/Transfer.service";
import Link from "next/link";

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [purchasesData, setPurchasesData] = useState<any>();
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  const handleAddClick = () => {
    router.push("/admin/product-stock/transfer/create-transfer");
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("productListPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchStockTransfer = () => {
    setTableLoading(true);
    StockTransferService.getStockTransfer({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setPurchasesData(res?.data.data);
          setTotalProduct(res.data.meta.total_record);
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

  useEffect(() => {
    fetchStockTransfer();
  }, [debouncedSearchTerm, currentPage, productPerPage]);

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="sm:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="sm:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
                Stock Transfer
              </h2>
              {permissionList.includes("stock_transfer_create") && (
                <Button
                  className="flex items-center !bg-green-200 !px-4 !py-1.5 !text-green-600"
                  onClick={handleAddClick}
                >
                  Add Transfer
                </Button>
              )}
            </div>
            <div className="md:w-80 sm:w-72 w-full md:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <TableWrapper
            isSwitchOn={true}
            className="min-h-[650px]"
            data={purchasesData}
            isLoading={tableLoading}
            noDataViewCondition={
              purchasesData?.length < 1 ? "No data available" : null
            }
            colValue={12}
          >
            <Thead>
              <Tr className="dark:bg-gray-700  bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-28 min-w-28">
                  <p>Date</p>
                </Th>

                <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
                  Quantity
                </Th>

                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-28 min-w-28">
                  Sender
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-24 lg:min-w-24 min-w-28">
                  Receiver
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-14 lg:min-w-20 min-w-20">
                  Is Received
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-24 lg:min-w-24 min-w-20">
                  Note
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-24 lg:min-w-24 min-w-20">
                  View
                </Th>

                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-20 min-w-32">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
              {purchasesData?.map((item: any, index: number) => {
                const totalQuantity = item?.line_items?.reduce(
                  (sum: any, i: any) => sum + (i?.quantity || 0),
                  0,
                );
                return (
                  <Tr className="h-14" key={index}>
                    <Td>
                      <p>{formatTimeAgo(item?.updatedAt)}</p>
                      <p>{formatTimeAgo(item?.createdAt)}</p>
                    </Td>
                    <Td>
                      <p className="font-bold text-red-600">{totalQuantity}</p>
                    </Td>
                    <Td className="text-base font-bold">
                      <p>{item?.sender?.name}</p>
                      <p className="">{item?.sender_warehouse?.title}</p>
                    </Td>

                    <Td>
                      <p>{item?.receiver?.name}</p>
                      <p>{item?.receiver_warehouse?.title}</p>
                    </Td>
                    <Td>
                      <span
                        className={`px-2 py-1 rounded-md text-sm font-medium ${
                          item?.is_received
                            ? "text-green-600 bg-green-100"
                            : "text-yellow-600 bg-yellow-100"
                        }`}
                      >
                        {item?.is_received ? "Received" : "Pending"}
                      </span>
                    </Td>
                    <Td>{item?.note}</Td>
                    <Td>
                      <Link
                        href={`/product-stock/transfer/view/${item?._id}`}
                        className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer"
                      >
                        View
                      </Link>
                    </Td>
                    <Td className="">
                      {permissionList.includes("stock_transfer_edit") &&
                        !item?.is_received && (
                          <div className="relative">
                            <Icon
                              name={"more_horiz"}
                              variant="outlined"
                              onClick={() => togglePopup(index)}
                              className="cursor-pointer"
                            />
                            {popupIndex === index && (
                              <div
                                ref={popupRef}
                                className="absolute top-8 -right-2 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-44"
                              >
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg "
                                  onClick={() =>
                                    router.push(
                                      `/product-stock/transfer/edit-transfer/${item?._id}`,
                                    )
                                  }
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableWrapper>

          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalProduct}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
