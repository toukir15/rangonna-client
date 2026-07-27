"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import {
  DeleteIncompleteOrderResponse,
  GetIncompleteOrdersResponse,
  IncompleteOrder,
} from "@admin/@interfaces/incompleateOrder/incompleateOrder.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { IncompleteOrdersService } from "@admin/@services/apis/OrdersService/Incompleate.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import PageSearch from "@admin/components/core/Search/PageSearch";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import IncompleteNote from "@admin/components/pages/Orders/InCompleateOrders/IncompompleateDrawer";
import IncompleateProgress from "@admin/components/pages/Orders/ViewOrder/IncompleateProgress";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { getWebName, noData } from "@admin/utils";
import { noPermission } from "@admin/utils/constant";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useMemo, useRef, useState } from "react";

const sanitizePhone = (raw?: string) => {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 11) return digits.slice(-11);
  return null;
};

type FraudApiResponse = {
  summary?: {
    total_parcel?: number;
    total_delivery?: number;
    total_return?: number;
    avg_success_rate?: string;
  };
  detailed?: {
    courier?: string;
    delivered?: number;
    returned?: number;
    total?: number;
    ratio?: string;
  }[];
  is_cached?: boolean;
};

type FraudStats = Record<
  string,
  {
    total: number;
    delivered: number;
    avg_success_rate: string;
  }
>;

const Page: React.FC = () => {
  const { permissionList, canFetchPageData } = useGlobalContext();
  const [incompleteOrder, setIncompleteOrder] = useState<IncompleteOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [items, setItems] = useState<string>("");
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [fraudStats, setFraudStats] = useState<FraudStats>({});
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const abortRef = useRef<AbortController | null>(null);
  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;

  const totalPages = Math.ceil((totalProduct || 0) / (productPerPage || 1));

  useEffect(() => {
    const savedWebsite = localStorage.getItem("selectedIncompleateWebsite");
    const savedPerPage = localStorage.getItem("InCompletePerPage");

    if (savedWebsite) {
      setSelectedWebsite(JSON.parse(savedWebsite));
    }

    if (savedPerPage) {
      setProductPerPage(Number(savedPerPage));
    }
  }, []);

  useEffect(() => {
    if (selectedWebsite) {
      localStorage.setItem(
        "selectedIncompleateWebsite",
        JSON.stringify(selectedWebsite),
      );
    }
  }, [selectedWebsite]);

  const isCheck = useMemo(() => {
    if (!incompleteOrder?.length) return false;
    const idsOnPage = incompleteOrder.map((o) => String(o._id));
    return idsOnPage.every((id) => selectedOrders.includes(id));
  }, [incompleteOrder, selectedOrders]);

  const handleSelectAll = () => {
    if (!incompleteOrder?.length) return;

    const idsOnPage = incompleteOrder.map((o) => String(o._id));

    if (isCheck) {
      setSelectedOrders((prev) => prev.filter((id) => !idsOnPage.includes(id)));
    } else {
      setSelectedOrders((prev) => Array.from(new Set([...prev, ...idsOnPage])));
    }
  };

  const handleSelectOrder = (id?: string | number) => {
    if (!id) return;
    const sid = String(id);
    setSelectedOrders((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid],
    );
  };

  useEffect(() => {
    if (!canFetchPageData) return;
    fetchInCompleat();
  }, [canFetchPageData, selectedWebsite, debouncedSearchTerm, productPerPage, currentPage]);

  const fetchInCompleat = async () => {
    setIsLoading(true);

    try {
      const res: GetIncompleteOrdersResponse =
        await IncompleteOrdersService.getIncompleteOrders({
          page: currentPage,
          limit: productPerPage,
          searchTerm: encodeURIComponent(debouncedSearchTerm),
          domain: selectedWebsite?.value,
        });

      if (res?.success) {
        const data: IncompleteOrder[] = res?.data?.data || [];
        setIncompleteOrder(data);
        setTotalProduct(res?.data?.meta?.total_record || 0);
      } else {
        ToastService.error(res?.message || "Failed to load incomplete orders.");
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!baseApi) {
      setFraudStats({});
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const phones = Array.from(
      new Set(
        incompleteOrder
          .map((o) => sanitizePhone(o?.customer?.phone))
          .filter(Boolean) as string[],
      ),
    );

    if (!phones.length) {
      setFraudStats({});
      return;
    }

    const fetchFraudData = async () => {
      const next: FraudStats = {};

      for (const phone of phones) {
        try {
          const url = `${baseApi}/check?api=1381e7a82b62ae85aca763ec861bbdd7e7bd6d71&phone=${phone}`;

          const res = await fetch(url, {
            method: "GET",
            signal: controller.signal,
          });

          if (!res.ok) {
            next[phone] = {
              total: 0,
              delivered: 0,
              avg_success_rate: "0%",
            };
            continue;
          }

          const json: FraudApiResponse = await res.json();

          next[phone] = {
            total: Number(json?.summary?.total_parcel) || 0,
            delivered: Number(json?.summary?.total_delivery) || 0,
            avg_success_rate: json?.summary?.avg_success_rate || "0%",
          };
        } catch (error: unknown) {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          next[phone] = {
            total: 0,
            delivered: 0,
            avg_success_rate: "0%",
          };
        }
      }

      setFraudStats(next);
    };

    fetchFraudData();
    return () => {
      controller.abort();
    };
  }, [incompleteOrder, baseApi]);

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("InCompletePerPage", String(newProductPerPage));
    setCurrentPage(1);
  };

  const handleAddNote = (data: IncompleteOrder) => {
    setItems(String(data._id));
    setIsModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRemoveProduct = (id?: string) => {
    if (!id) return;
    setItemToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmRemoveWebsite = () => {
    if (!itemToDelete) return;

    setIsLoading(true);

    IncompleteOrdersService.IncompleteOrderDelete(itemToDelete)
      .then((res: DeleteIncompleteOrderResponse) => {
        if (res?.success) {
          ToastService.success(res?.message || "Order deleted.");
          setIsAlertOpen(false);
          setSelectedOrders((prev) => prev.filter((x) => x !== itemToDelete));
          fetchInCompleat();
        } else {
          ToastService.error(res?.message || "Delete failed.");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const cancelRemoveProduct = () => setIsAlertOpen(false);

  const copyToClipboard = async (text?: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      ToastService.success("Number copied to clipboard!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      }
    }
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

  useTableRefreshRegister(fetchInCompleat);


  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveWebsite}
        onCancel={cancelRemoveProduct}
        isLoading={isLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this order?
        </h6>
        <div className="flex flex-wrap items-center items-center justify-center my-8">
          <Icon
            name="cancel"
            variant="outlined"
            size={130}
            className="text-red-400"
          />
        </div>
      </Alert>

      <NoScrollLayout>
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:flex flex-wrap items-center items-center gap-3  mb-2">
          <div className="flex flex-wrap items-center items-center gap-3">
            <h2 className="2xl:text-2xl font-poppins dark:text-gray-300 font-semibold text-nowrap">
              Incomplete Orders
            </h2>
              <AllFilter
              isWebsiteFilter={true}
              websiteOptions={websiteOptions}
              selectedWebsite={selectedWebsite}
              setSelectedWebsite={setSelectedWebsite}
            />
          </div>
          <div className="md:w-80  w-full md:mt-0 mt-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search Orders"
              wrapperClass="w-full"
            />
          </div>
        </div>
        
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
              <Th>
                <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
              </Th>
              <Th className="min-w-20 text-blue-900 dark:text-gray-300">ID</Th>
              <Th className="min-w-32 text-blue-900 dark:text-gray-300">
                Customer Info
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Created / Updated
              </Th>
              <Th className="min-w-52 text-blue-900 dark:text-gray-300">
                Products
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Address
              </Th>
              <Th className="min-w-36 text-blue-900 dark:text-gray-300">
                Ratio
              </Th>
              <Th className="min-w-44 text-blue-900 dark:text-gray-300">
                Note
              </Th>
              <Th className="text-blue-900 dark:text-gray-300">Action</Th>
            </Tr>
          </Thead>

          <Tbody className="bg-white dark:bg-gray-800 border">
            {incompleteOrder?.map((order, index) => {
              const rowId = String(order._id);
              const phone = sanitizePhone(order?.customer?.phone);
              const fraudData = phone ? fraudStats[phone] : undefined;

              const totalParcel = fraudData?.total || 0;
              const totalDelivery = fraudData?.delivered || 0;

              return (
                <Tr
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  key={rowId}
                >
                  <Td>
                    <TableCheckbox
                      checked={selectedOrders.includes(rowId)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleSelectOrder(rowId)}
                    />
                  </Td>

                  <Td>
                    <div className="flex flex-wrap text-base font-bold">
                      <span>{index + 1}</span>
                    </div>
                  </Td>

                  <Td>
                    <div className="flex flex-wrap text-base">
                      <span>{order?.customer?.first_name || noData}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center items-center">
                      {order?.customer?.phone ? (
                        <>
                          <a href={`tel:${order.customer.phone}`}>
                            {order.customer.phone}
                          </a>
                          <Icon
                            onClick={() =>
                              copyToClipboard(order?.customer?.phone)
                            }
                            name="content_copy"
                            size={16}
                            className="ml-2 cursor-pointer"
                          />
                        </>
                      ) : (
                        <span className="text-gray-400">{noData}</span>
                      )}
                    </div>

                    <div>
                      <p>{getWebName(order?.domain) || noData}</p>
                    </div>
                  </Td>

                  <Td>
                    <p>
                      {order?.createdAt
                        ? formatTimeAgo(order.createdAt)
                        : noData}
                    </p>
                    <p>
                      {order?.updatedAt
                        ? formatTimeAgo(order.updatedAt)
                        : noData}
                    </p>
                  </Td>

                  <Td>
                    {order?.line_items?.length ? (
                      order.line_items.map((li, i) => (
                        <div key={i} className="mb-2">
                          <p className="font-semibold text-md">
                            {li?.title || noData}
                          </p>
                          <div className="flex flex-wrap items-center items-center mt-1">
                            <p>{li?.price ?? noData}</p>
                            <Icon
                              name="production_quantity_limits"
                              size={14}
                              className="ml-5"
                            />
                            <p className="font-semibold ml-1">
                              {li?.quantity ?? 0}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">{noData}</span>
                    )}
                  </Td>

                  <Td>
                    <div className="flex flex-wrap mt-1.5">
                      {order?.customer?.address || (
                        <span className="text-gray-400">{noData}</span>
                      )}
                    </div>
                  </Td>

                  <Td>
                    <div className="min-w-[130px]">
                      <IncompleateProgress
                        isOption={false}
                        totalParcel={totalParcel}
                        totalDelivery={totalDelivery}
                      />
                    </div>
                  </Td>

                  <Td>
                    {order?.notes?.length ? (
                      order.notes.map((n, i) => (
                        <div key={i}>
                          <p>
                            {n?.text} - {n?.user?.name}
                          </p>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400">{noData}</span>
                    )}
                  </Td>

                  <Td className="action-button p-3 relative group">
                    {permissionList.includes("order_incomplete_edit") ||
                    permissionList.includes("order_incomplete_delete") ? (
                      <div>
                        <Icon variant="outlined" name="more_horiz" />
                        <div className="dropdown absolute right-0 bg-white dark:bg-gray-700 dark:border-gray-500 shadow-lg p-2 rounded-lg z-10 hidden group-hover:block min-w-40">
                          {permissionList.includes("order_incomplete_edit") && (
                            <span
                              onClick={() => handleAddNote(order)}
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Add Note
                            </span>
                          )}

                          {permissionList.includes(
                            "order_incomplete_delete",
                          ) && (
                            <span
                              onClick={() => handleRemoveProduct(order?._id)}
                              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                              Delete Order
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
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

        <IncompleteNote
          itemsId={items}
          setIsModalOpen={setIsModalOpen}
          getReportCategory={fetchInCompleat}
          isModalOpen={isModalOpen}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
