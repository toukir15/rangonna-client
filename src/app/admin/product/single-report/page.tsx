"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useRef, useState } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import { productReportService } from "@admin/@services/apis/ProductReport/ProductReport.service";
import Image from "next/image";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import {
  IProductSalesResponse,
  ISingleProductReportData,
  ISingleProductReportItem,
} from "@admin/@interfaces/productReport/singleProductReport";
import {
  IProductSuggestion,
  IProductSuggestionResponse,
} from "@admin/@interfaces/common.interface";

type SearchEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLInputElement>;

const Page: React.FC = () => {
  const [singleProduct, setSingleProduct] = useState<
    ISingleProductReportItem[]
  >([]);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<
    IProductSuggestion[]
  >([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        if (filteredProducts.length > 0) {
          setFilteredProducts([]);
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filteredProducts]);

  const getWareHouseReport = (productId: string) => {
    setTableLoading(true);
    productReportService
      .getSingleReport({ searchTerm: productId })
      .then((res: IProductSalesResponse) => {
        if (res?.success) {
          setSingleProduct(res.data.data);
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

  const handleSearchSubmit = (e: SearchEvent) => {
    e.preventDefault();
    if (productSearch.length >= 2) {
      fetchProductSearch(productSearch);
    }
  };

  const fetchProductSearch = async (searchValue: string) => {
    productService
      .getProductSuggestion({
        searchTerm: searchValue,
      })
      .then((res: IProductSuggestionResponse) => {
        if (res?.success) {
          setFilteredProducts(res.data);
          setShowSuggestions(true);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);
    if (searchValue.length >= 2) {
      fetchProductSearch(searchValue);
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  useTableRefreshRegister(getWareHouseReport);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full justify-between">
              <div className="flex items-center gap-4">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  Single Product Report :
                </h1>

                <h1 className="lg:text-xl text-lg font-semibold dark:text-gray-300 text-blue-600 md:mb-0 mb-2 flex text-nowrap">
                  {singleProduct[0]?.product_title}
                </h1>
              </div>
              <div className="mb-3 md:w-[500px] w-full">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={productSearch}
                    onChange={handleSearchChange}
                    className="p-2 px-4 pr-10 w-full border dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                    placeholder="Search for a product"
                    onFocus={() =>
                      productSearch.length >= 2 && setShowSuggestions(true)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchSubmit(e)
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-3 text-gray-400"
                    onClick={handleSearchSubmit}
                  >
                    <Icon name="search" variant="outlined" />
                  </button>

                  {showSuggestions && productSearch.length >= 2 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute left-0 w-full dark:bg-gray-700 bg-white border border-gray-300 mt-1 rounded-md z-10 max-h-96 overflow-y-auto"
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(
                          (product: IProductSuggestion, index: number) => {
                            return (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between gap-4 items-center"
                                onClick={() => {
                                  getWareHouseReport(product?._id);
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <Image
                                    src={
                                      product?.featured_image
                                        ? product?.featured_image?.src
                                        : NodataImage
                                    }
                                    width={50}
                                    height={50}
                                    className="rounded-md"
                                    alt="Product Image"
                                  />
                                  <span>{product?.title}</span>
                                </div>
                                <span className="font-semibold text-nowrap">
                                  BDT {product?.pricing?.sale_price}
                                </span>
                              </div>
                            );
                          }
                        )
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full">
        <TableWrapper
          showCheckbox={true}
          data={singleProduct}
          noDataViewCondition={
            singleProduct?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={7}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 dark:text-gray-200">
                Date
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Total Order
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                In Transit
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Delivery
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-200">
                Cancelled
              </Th>

              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                Returned
              </Th>
              <Th className="2xl:min-w-32 lg:min-w-28 min-w-32 dark:text-gray-200">
                Refunded
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {singleProduct[0]?.report_data.map(
              (sales: ISingleProductReportData, index: number) => {
                return (
                  <Tr
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td>{sales?.date}</Td>
                    <Td>{sales?.total_order}</Td>
                    <Td>{sales?.in_transit}</Td>
                    <Td>
                      {sales?.delivery}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((sales?.delivery || 0) / (sales?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {sales?.canceled}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((sales?.canceled || 0) / (sales?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {sales?.return}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((sales?.return || 0) / (sales?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                    <Td>
                      {sales?.refunded}
                      <span className="ml-2 text-xs text-gray-500">
                        (
                        {(
                          ((sales?.refunded || 0) / (sales?.total_order || 1)) *
                          100
                        ).toFixed(1)}
                        %)
                      </span>
                    </Td>
                  </Tr>
                );
              }
            )}
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
