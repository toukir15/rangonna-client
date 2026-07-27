"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { RefundListContext } from "@/app/admin/orders/refund/page";
import Icon from "@admin/components/core/Icon/Icon";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { RefundListService } from "@admin/@services/apis/RefundList/RefundList.service";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import Image from "next/image";
import Button from "@admin/components/core/Button/Button";
import Link from "next/link";
import { reasonOptions } from "../Utilities/paymentData";

type RefundUser = {
  _id?: string;
  name?: string;
  email?: string;
};

type RefundOrder = {
  _id?: string;
  sysid?: string;
  status?: string;
  createdAt?: string;
  line_items?: {
    title?: string;
    quantity?: number;
    price?: number;
    total?: number;
    product_id?: { featured_image?: { src?: string } };
  }[];
};

const StatusBadge = ({ status }: { status?: string }) => {
  const s = (status || "").toLowerCase();

  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    approved: "bg-blue-50 text-blue-700 ring-blue-200",
    processing: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rejected: "bg-red-50 text-red-700 ring-red-200",
    failed: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        map[s] || "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {(status || "--").toUpperCase()}
    </span>
  );
};

const Money = ({ amount }: { amount?: number }) => {
  const value = typeof amount === "number" ? amount : 0;

  return (
    <span className="text-base font-bold text-gray-900 dark:text-white">
      ৳ {value.toFixed(2)}
    </span>
  );
};

const UserInfo = ({ user }: { user?: RefundUser }) => {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
        {user?.name || "--"}
      </p>
      {user?.email && (
        <p className="max-w-[160px] truncate text-xs text-gray-500 dark:text-gray-400">
          {user.email}
        </p>
      )}
    </div>
  );
};

const OrderItemsPreview = ({ order }: { order?: RefundOrder | null }) => {
  const items = order?.line_items || [];

  if (!items.length) {
    return (
      <p className=" text-xs text-gray-400 dark:text-gray-500">
        No items found
      </p>
    );
  }

  const top = items.slice(0, 2);

  return (
    <div className="">
      {top.map((li, idx) => {
        const img = li?.product_id?.featured_image?.src;

        return (
          <div
            key={`${li?.title || "item"}-${idx}`}
            className="flex items-center gap-2  p-2 dark:bg-gray-700/50"
          >
            {img ? (
              <Image
                src={img}
                alt={li?.title || "Product"}
                width={44}
                height={44}
                className="h-11 w-11 rounded-lg border object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-white dark:bg-gray-800">
                <Icon
                  name="image"
                  variant="outlined"
                  size={20}
                  className="text-gray-400"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                {li?.title || "--"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Qty: {li?.quantity || 0}
              </p>
            </div>
          </div>
        );
      })}

      {items.length > 2 && (
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          +{items.length - 2} more items
        </p>
      )}
    </div>
  );
};

const RefundTable: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const {
    returnListData,
    tableLoading,
    setIsModalOpen,
    setModalMode,
    setSelectedRefund,
    fetchReturnList,
    setStatusUpdateOnly,
  } = useContext(RefundListContext);

  const items = (returnListData || []) as any[];

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = hasPermission(permissionList, "order_refund_edit");
  const canDelete = hasPermission(permissionList, "order_refund_delete");

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  const handleEditClick = (item: any) => {
    if (!item?._id) return;

    setSelectedRefund(item);
    setModalMode("Edit");
    setStatusUpdateOnly(false);
    setIsModalOpen(true);
    setPopupIndex(null);
  };

  const handleRemove = async (id?: string) => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await RefundListService.deleteRefund(id);
      ToastService.success("Refund deleted");
      fetchReturnList();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete refund";
      ToastService.error(message);
    } finally {
      setIsDeleting(false);
      setPopupIndex(null);
      setIsDeleteAlertOpen(false);
      setDeleteId(null);
    }
  };

  const openDeleteAlert = (id?: string) => {
    if (!id) return;

    setDeleteId(id);
    setIsDeleteAlertOpen(true);
    setPopupIndex(null);
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

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  return (
    <>
      <Alert
        isOpen={isDeleteAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        confirmBtn="bg-red-600 hover:bg-red-700 focus:ring-red-200"
        isLoading={isDeleting}
        onCancel={() => {
          if (isDeleting) return;
          setIsDeleteAlertOpen(false);
          setDeleteId(null);
        }}
        onConfirm={() => handleRemove(deleteId || undefined)}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="my-4 text-md">
          Are you sure you want to remove this refund?
        </h6>
        <div className="my-8 flex items-center justify-center">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>

      <TableWrapper
        className="min-h-[650px] rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        isSwitchOn
        data={returnListData}
        isLoading={tableLoading}
        noDataViewCondition={items.length < 1 ? "No refund data found" : null}
        colValue={9}
      >
        <Thead>
          <Tr className="h-[54px] bg-gray-50 dark:bg-gray-900">
            <Th className="min-w-72 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Order Details
            </Th>
            <Th className="min-w-40 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Refund Amount
            </Th>
            <Th className="min-w-36 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Status
            </Th>
            <Th className="min-w-40 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Reason & Note
            </Th>
            <Th className="min-w-40 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Created By
            </Th>
            <Th className="min-w-40 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Approved By
            </Th>
            <Th className="min-w-40 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Paid By
            </Th>
            <Th className="min-w-36 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              View
            </Th>
            <Th className="min-w-24 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300 bg-blue-100 dark:bg-gray-700">
              Action
            </Th>
          </Tr>
        </Thead>

        <Tbody className="bg-white dark:bg-gray-800">
          {items.map((item: any, index) => {
            const reasonLabel =
              reasonOptions.find((option) => option.value === item?.reason)
                ?.label || "--";
            return (
              <Tr
                key={item?._id || index}
                className="group align-top transition hover:bg-blue-50/40 dark:hover:bg-gray-700/40"
              >
                <Td>
                  <div className="max-w-64 ">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        #{item?.order?.sysid || "--"}
                      </span>
                    </div>

                    <OrderItemsPreview order={item?.order} />
                  </div>
                </Td>

                <Td>
                  <div className="space-y-1">
                    <Money amount={item?.amount} />

                    <div className="flex flex-wrap gap-2">
                      <p
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item?.is_partial
                            ? "bg-orange-50 text-orange-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {item?.is_partial ? "Partial Refund" : "Full Refund"}
                      </p>

                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {item?.payment_method || "--"}
                      </span>
                    </div>
                  </div>
                </Td>

                <Td>
                  <div className="">
                    <StatusBadge status={item?.status} />
                  </div>
                  <div className="">
                    <p className="font-bold text-gray-900 dark:text-white py-1">
                      {item?.trx_id || "--"}
                    </p>

                    <div className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                      <Icon name="schedule" variant="outlined" size={14} />
                      {item?.createdAt ? formatTimeAgo(item.createdAt) : "--"}
                    </div>
                  </div>
                </Td>

                <Td>
                  <div className="max-w-[360px] space-y-1">
                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-gray-400">
                        Reason
                      </p>
                      <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-200">
                        {reasonLabel || "--"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-bold uppercase text-gray-400">
                        Note
                      </p>
                      <div className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {(item?.notes ?? []).slice(0, 1).map((note: any) => (
                          <div key={note._id}>
                            <span className="block">{note.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Td>

                <Td>
                  <div className="">
                    <UserInfo user={item?.created_by} />
                  </div>
                </Td>

                <Td>
                  <div className="">
                    <UserInfo user={item?.approved_by} />
                  </div>
                </Td>
                <Td>
                  <div className="">
                    <UserInfo user={item?.paid_by} />
                  </div>
                </Td>

                <Td>
                  <div className="">
                    <Link href={`/admin/orders/refund/view/${item?._id}`}>
                      <Button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 !px-4 !py-1 !text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                </Td>

                <Td>
                  {hasPermission(
                    permissionList,
                    "order_refund_edit",
                    "order_refund_delete",
                  ) &&
                    item?.status !== "completed" && (
                      <div className="relative flex justify-center py-4">
                        <button
                          type="button"
                          onClick={() => togglePopup(index)}
                          className="flex  items-center justify-center   text-gray-600 shadow-sm transition "
                        >
                          <Icon
                            name="more_horiz"
                            variant="outlined"
                            size={20}
                          />
                        </button>

                        {popupIndex === index && (
                          <div
                            ref={popupRef}
                            className="absolute right-4 top-14 z-30 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-700"
                          >
                            {canEdit && item?.status !== "completed" && (
                              <button
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-600"
                                onClick={() => handleEditClick(item)}
                              >
                                <Icon
                                  name="edit"
                                  variant="outlined"
                                  size={18}
                                />
                                Edit
                              </button>
                            )}

                            {canDelete && item?.status !== "completed" && (
                              <button
                                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => openDeleteAlert(item?._id)}
                              >
                                <Icon
                                  name="delete"
                                  variant="outlined"
                                  size={18}
                                />
                                Delete
                              </button>
                            )}
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
    </>
  );
};

export default RefundTable;
