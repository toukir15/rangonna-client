"use client";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import {
  IDelayDeliveryBooking,
  IDelayDeliveryResponse,
} from "@admin/@interfaces/orders/delayDelivery.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import PageSearch from "@admin/components/core/Search/PageSearch";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import DelayDeliveryNote from "@admin/components/pages/AllOrders/DelayDeliveryNote";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { getWebName, noData } from "@admin/utils";
import { noPermission } from "@admin/utils/constant";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { getStatusStyle } from "@admin/utils/system.utils";
import { ToastService } from "@admin/utils/toastr.service";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [incompleteOrder, setIncompleteOrder] = useState<IDelayDeliveryBooking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedPage = localStorage.getItem("delayDeliveryCurrentPage");
      return savedPage ? Number(savedPage) : 1;
    }
    return 1;
  });

  const [productPerPage, setProductPerPage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedPerPage = localStorage.getItem("InCompletePerPage");
      return savedPerPage ? Number(savedPerPage) : 10;
    }
    return 10;
  });

  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil((totalProduct || 0) / (productPerPage || 1));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [itemsId, setItemsId] = useState<string>();
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setPopupIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedWebsite = localStorage.getItem("selectedIncompleateWebsite");
    if (savedWebsite) {
      setSelectedWebsite(JSON.parse(savedWebsite));
    }
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      localStorage.setItem(
        "selectedIncompleateWebsite",
        JSON.stringify(selectedWebsite)
      );
    }
  }, [selectedWebsite]);

  useEffect(() => {
    localStorage.setItem("delayDeliveryCurrentPage", String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("InCompletePerPage", String(productPerPage));
  }, [productPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWebsite, debouncedSearchTerm, productPerPage]);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchDelayDelivery();
  }, [canFetchPageData, selectedWebsite, debouncedSearchTerm, productPerPage, currentPage]);

  const fetchDelayDelivery = async () => {
    setIsLoading(true);
    try {
      const res: IDelayDeliveryResponse = await OrdersService.getDelayDelivery({
        page: currentPage,
        limit: productPerPage,
        searchTerm: encodeURIComponent(debouncedSearchTerm),
        domain: selectedWebsite?.value,
      });

      if (res?.success) {
        setIncompleteOrder(res?.data?.data || []);
        setTotalProduct(res?.data?.meta?.total_record || 0);
      } else {
        ToastService.error(res?.message || "Failed to load incomplete orders.");
      }
    } catch (error: any) {

      ToastService.error(error.message);

    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item.web_name,
            value: item.web_url,
          }));
          setWebsiteOptions([
            { value: "all", label: "All Website" },
            ...options,
          ]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchWebList();
  }, [canFetchPageData]);

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:flex items-center mb-2 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="2xl:text-2xl font-poppins dark:text-gray-300 font-semibold text-nowrap">
              Delay Delivery
            </h2>
            <div >
              <Button
                className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
              </Button>
            </div>



          </div>
          <div className="md:w-80 sm:w-72 w-full sm:mt-0 mt-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search Orders"
              wrapperClass="w-full"
            />
          </div>
        </div>
        {
          isFilterOpen && <div >
            <AllFilter
              isFilterOpen={isFilterOpen}
              isWebsiteFilter={true}
              websiteOptions={websiteOptions}
              selectedWebsite={selectedWebsite}
              setSelectedWebsite={setSelectedWebsite}

            />
          </div>
        }
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 min-h-[83%] relative">
        <TableWrapper
          showCheckbox={true}
          isSwitchOn
          data={incompleteOrder}
          isLoading={isLoading}
          colValue={9}
          className="min-h-[700px]"
        >
          <Thead>
            <Tr className="bg-blue-100 dark:bg-gray-700 h-[50px] shadow-sm border-b border-gray-300 p-20">
              <Th className="min-w-20 text-blue-900 dark:text-gray-300">
                Order ID
              </Th>
              <Th className="min-w-32 text-blue-900 dark:text-gray-300">
                Customer Info
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Status
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Reason & Note
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Consignment ID
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Date
              </Th>
              <Th className="text-blue-900 dark:text-gray-300">View</Th>
              <Th className="text-blue-900 dark:text-gray-300">Action</Th>
            </Tr>
          </Thead>

          <Tbody className="bg-white dark:bg-gray-800 border">
            {incompleteOrder?.map((order: IDelayDeliveryBooking, index) => {
              return (
                <Tr
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  key={index}
                >
                  <Td>
                    <div className="flex flex-wrap text-base font-bold">
                      <span>{order?.order_sysid}</span>
                    </div>
                    <p className="pt-1">
                      {order?.createdAt ? formatTimeAgo(order.createdAt) : noData}
                    </p>
                  </Td>

                  <Td>
                    <div>
                      <p>{order?.customer_name}</p>
                      <p className="pt-1">{order?.customer_phone || noData}</p>
                      <p className="pt-1">{getWebName(order?.domain) || noData}</p>
                    </div>
                  </Td>

                  <Td>
                    <div>
                      <p
                        className={`${getStatusStyle(order?.order_status)} text-center w-32`}
                      >
                        {order?.order_status}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    <p>Note: {order?.last_note?.text}</p>
                    <p>Reason: {order?.reason}</p>
                  </Td>

                  <Td>
                    <div className="flex flex-wrap mt-1.5">
                      {order?.consignment_id}
                    </div>
                  </Td>

                  <Td>
                    <div>
                      <p>
                        {order?.updatedAt ? formatTimeAgo(order.updatedAt) : noData}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    <Link
                      href={`/orders/view/${order?._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer inline-block"
                    >
                      View
                    </Link>
                  </Td>

                  <Td>
                    <div className="relative max-w-40">
                      <Icon
                        name="more_horiz"
                        variant="outlined"
                        onClick={() => togglePopup(index)}
                        className="cursor-pointer"
                      />

                      {popupIndex === index && (
                        <div
                          ref={popupRef}
                          className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-2 z-20 min-w-40"
                        >
                          {permissionList.includes("order_edit") && (
                            <button
                              onClick={() => {
                                setItemsId(order?._id);
                                setModalOpen(true);
                                setPopupIndex(null);
                              }}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            >
                              Note
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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

        <DelayDeliveryNote
          itemsId={itemsId}
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
          fetchDelayDelivery={fetchDelayDelivery}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;