"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import {
  DeleteIncompleteOrderResponse,
  GetIncompleteOrdersResponse,
  IncompleteOrder,
} from "@admin/@interfaces/incompleateOrder/incompleateOrder.interface";
import { IncompleteOrdersService } from "@admin/@services/apis/OrdersService/Incompleate.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import Icon from "@admin/components/core/Icon/Icon";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import IncompleteNote from "@admin/components/pages/Orders/InCompleateOrders/IncompompleateDrawer";
import IncompleateProgress from "@admin/components/pages/Orders/ViewOrder/IncompleateProgress";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { TableCheckbox } from "@admin/components/Table/TableCheckbox";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import PageHeader from "@admin/components/layout/PageHeader";
import { useGlobalContext } from "@admin/context/GlobalContext";
import AuthLayout from "@admin/layouts/AuthLayout";
import { getWebName, noData, trimString } from "@admin/utils";
import Image from "next/image";
import notFoundImage from "@admin/assets/images/Image-not-found.png";
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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [fraudStats, setFraudStats] = useState<FraudStats>({});
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const abortRef = useRef<AbortController | null>(null);
  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;

  const totalPages = Math.ceil((totalProduct || 0) / (productPerPage || 1));

  useEffect(() => {
    const savedPerPage = localStorage.getItem("InCompletePerPage");

    if (savedPerPage) {
      setProductPerPage(Number(savedPerPage));
    }
  }, []);

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
  }, [canFetchPageData, debouncedSearchTerm, productPerPage, currentPage]);

  const fetchInCompleat = async () => {
    setIsLoading(true);

    try {
      const res: GetIncompleteOrdersResponse =
        await IncompleteOrdersService.getIncompleteOrders({
          page: currentPage,
          limit: productPerPage,
          searchTerm: encodeURIComponent(debouncedSearchTerm),
          domain: "all",
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

  useTableRefreshRegister(fetchInCompleat);

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


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

      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Incomplete Orders" />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Incomplete records</p>
            <p className="premium-table-toolbar-meta">
              {totalProduct.toLocaleString()}{" "}
              {totalProduct === 1 ? "order" : "orders"}
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
                  placeholder="Search orders..."
                  aria-label="Search incomplete orders"
                />
              </label>
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchInCompleat}
                isLoading={isLoading}
                className="!h-9"
              />
            </div>
          </div>

          <TableWrapper
            showCheckbox={true}
            isSwitchOn
            data={incompleteOrder}
            isLoading={isLoading}
            colValue={8}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
          >
            <Thead>
              <Tr>
                <Th className="is-center">
                  <TableCheckbox checked={isCheck} onChange={handleSelectAll} />
                </Th>
                <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">ID</Th>
                <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">
                  Customer Info
                </Th>
                <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Products</Th>
                <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">Address</Th>
                <Th className="min-w-28">Ratio</Th>
                <Th className="2xl:min-w-32 lg:min-w-28 min-w-32">Note</Th>
                <Th className="is-right">Actions</Th>
              </Tr>
            </Thead>

            <Tbody>
              {incompleteOrder?.map((order, index) => {
                const rowId = String(order._id);
                const phone = sanitizePhone(order?.customer?.phone);
                const fraudData = phone ? fraudStats[phone] : undefined;
                const totalParcel = fraudData?.total || 0;
                const totalDelivery = fraudData?.delivered || 0;
                const latestNote =
                  Array.isArray(order?.notes) && order.notes.length > 0
                    ? order.notes[order.notes.length - 1]
                    : null;

                return (
                  <Tr key={rowId}>
                    <Td>
                      <TableCheckbox
                        checked={selectedOrders.includes(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleSelectOrder(rowId)}
                      />
                    </Td>

                    <Td>
                      <div className="table-user-info">
                        <div className="table-id-row">
                          <span className="table-id-chip">{index + 1}</span>
                        </div>
                        <p className="data-table-muted">
                          {getWebName(order?.domain) || noData}
                        </p>
                        <span className="table-date-cell">
                          <Icon
                            name="calendar_today"
                            size={13}
                            variant="outlined"
                          />
                          {order?.createdAt
                            ? formatTimeAgo(order.createdAt)
                            : noData}
                        </span>
                        {order?.updatedAt ? (
                          <span className="table-date-cell">
                            <Icon name="update" size={13} variant="outlined" />
                            {formatTimeAgo(order.updatedAt)}
                          </span>
                        ) : null}
                      </div>
                    </Td>

                    <Td>
                      <div className="table-contact-stack">
                        <span className="data-table-primary">
                          {trimString(order?.customer?.first_name, 50)}
                          {order?.customer?.last_name
                            ? ` ${order.customer.last_name}`
                            : ""}
                        </span>
                        {order?.customer?.phone ? (
                          <span className="table-contact-line">
                            <Icon name="call" size={14} variant="outlined" />
                            <a href={`tel:${order.customer.phone}`}>
                              {order.customer.phone}
                            </a>
                            <button
                              type="button"
                              className="table-copy-btn"
                              aria-label="Copy phone number"
                              title="Copy phone number"
                              onClick={() =>
                                copyToClipboard(order?.customer?.phone)
                              }
                            >
                              <Icon
                                name="content_copy"
                                size={13}
                                variant="outlined"
                              />
                            </button>
                          </span>
                        ) : (
                          <span className="data-table-muted">{noData}</span>
                        )}
                      </div>
                    </Td>

                    <Td>
                      <div className="table-product-thumbs">
                        {order?.line_items?.length ? (
                          order.line_items.slice(0, 3).map((item, itemIndex) => {
                            const src =
                              item?.product_id?.featured_image?.src ||
                              item?.image ||
                              notFoundImage;

                            return (
                              <span
                                key={itemIndex}
                                className="table-product-thumb"
                                title={`${item?.title || "Product"} × ${
                                  item?.quantity ?? 0
                                }`}
                              >
                                <Image
                                  src={src}
                                  quality={70}
                                  alt={item?.title || "Product Image"}
                                  width={120}
                                  height={108}
                                />
                              </span>
                            );
                          })
                        ) : (
                          <span className="data-table-muted">{noData}</span>
                        )}
                      </div>
                    </Td>

                    <Td>
                      <span className="data-table-muted">
                        {trimString(order?.customer?.address, 80) || noData}
                      </span>
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
                      <div className="data-table-muted">
                        {latestNote?.text
                          ? trimString(
                              `${latestNote.text}${
                                latestNote.user?.name
                                  ? ` — ${latestNote.user.name}`
                                  : ""
                              }`,
                              100,
                            )
                          : noData}
                      </div>
                    </Td>

                    <Td className="is-right">
                      {permissionList.includes("order_incomplete_edit") ||
                      permissionList.includes("order_incomplete_delete") ? (
                        <div className="relative max-w-40">
                          <button
                            type="button"
                            className="data-table-action-btn"
                            aria-expanded={popupIndex === index}
                            onClick={() => togglePopup(index)}
                          >
                            <Icon name="more_vert" variant="outlined" size={18} />
                          </button>

                          {popupIndex === index && (
                            <div
                              ref={popupRef}
                              className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                            >
                              {permissionList.includes(
                                "order_incomplete_edit",
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddNote(order);
                                    setPopupIndex(null);
                                  }}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                >
                                  Add Note
                                </button>
                              )}
                              {permissionList.includes(
                                "order_incomplete_delete",
                              ) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRemoveProduct(order?._id);
                                    setPopupIndex(null);
                                  }}
                                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                >
                                  Delete Order
                                </button>
                              )}
                            </div>
                          )}
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
            isShowText={true}
            onRefresh={fetchInCompleat}
            isLoading={isLoading}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>

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
