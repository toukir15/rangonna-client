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
import Link from "next/link";
import { reasonOptions } from "../Utilities/paymentData";
import { getStatusLabel, getStatusStyle } from "@admin/utils/system.utils";

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

const Money = ({ amount }: { amount?: number }) => {
  const value = typeof amount === "number" ? amount : 0;

  return <span className="table-amount">৳ {value.toFixed(2)}</span>;
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
        className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
        isSwitchOn
        data={returnListData}
        isLoading={tableLoading}
        noDataViewCondition={items.length < 1 ? "No refund data found" : null}
        colValue={9}
      >
        <Thead>
          <Tr>
            <Th className="min-w-72">Order Details</Th>
            <Th className="min-w-40">Refund Amount</Th>
            <Th className="min-w-36">Status</Th>
            <Th className="min-w-40">Reason & Note</Th>
            <Th className="min-w-40">Created By</Th>
            <Th className="min-w-40">Approved By</Th>
            <Th className="min-w-40">Paid By</Th>
            <Th className="min-w-28 is-center">View</Th>
            <Th className="min-w-24 is-center">Action</Th>
          </Tr>
        </Thead>

        <Tbody>
          {items.map((item: any, index) => {
            const reasonLabel =
              reasonOptions.find((option) => option.value === item?.reason)
                ?.label || "--";
            return (
              <Tr key={item?._id || index}>
                <Td>
                  <div className="table-user-info max-w-64">
                    <div className="table-id-row">
                      <span className="table-id-chip">
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
                      <span
                        className={`table-role-badge ${
                          item?.is_partial ? "is-warning" : "is-approved"
                        }`}
                      >
                        {item?.is_partial ? "Partial Refund" : "Full Refund"}
                      </span>

                      <span className="table-role-badge is-neutral">
                        {item?.payment_method || "--"}
                      </span>
                    </div>
                  </div>
                </Td>

                <Td>
                  <div className="table-contact-stack">
                    <span className={getStatusStyle(item?.status)}>
                      {getStatusLabel(item?.status)}
                    </span>
                    <p className="data-table-primary">{item?.trx_id || "--"}</p>
                    <span className="table-date-cell">
                      <Icon name="schedule" variant="outlined" size={13} />
                      {item?.createdAt ? formatTimeAgo(item.createdAt) : "--"}
                    </span>
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

                <Td className="is-center">
                  <Link
                    href={`/admin/orders/refund/view/${item?._id}`}
                    className="data-table-view-btn"
                  >
                    <Icon name="visibility" variant="outlined" size={14} />
                    View
                  </Link>
                </Td>

                <Td className="is-center">
                  {hasPermission(
                    permissionList,
                    "order_refund_edit",
                    "order_refund_delete",
                  ) &&
                    item?.status !== "completed" && (
                      <div className="relative flex justify-center">
                        <button
                          type="button"
                          onClick={() => togglePopup(index)}
                          className="data-table-action-btn"
                          aria-expanded={popupIndex === index}
                        >
                          <Icon
                            name="more_vert"
                            variant="outlined"
                            size={18}
                          />
                        </button>

                        {popupIndex === index && (
                          <div
                            ref={popupRef}
                            className="data-table-row-menu"
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
