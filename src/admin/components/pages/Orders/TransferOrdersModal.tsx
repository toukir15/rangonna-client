"use client";

import React, { useEffect, useState } from "react";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { ToastService } from "@admin/utils/toastr.service";
import {
  IEmployeeAssignmentSnapshot,
  INeedOrdersNotification,
  OrderAssignmentService,
} from "@admin/@services/apis/OrdersService/OrderAssignment.service";

type Props = {
  isOpen: boolean;
  onClose: (opts?: { transferred?: boolean }) => void;
  initialToUserId?: string | null;
  onTransferred?: () => void;
};

const TransferOrdersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialToUserId,
  onTransferred,
}) => {
  const [employees, setEmployees] = useState<IEmployeeAssignmentSnapshot[]>([]);
  const [fromUser, setFromUser] = useState<SelectOption | null>(null);
  const [toUser, setToUser] = useState<SelectOption | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const transferredRef = React.useRef(false);

  useEffect(() => {
    if (!isOpen) {
      transferredRef.current = false;
      return;
    }
    setLoading(true);
    OrderAssignmentService.listEmployees()
      .then((res: any) => {
        if (!res?.success) {
          ToastService.error(res?.message || "Failed to load employees");
          return;
        }
        const list = ((res.data || []) as IEmployeeAssignmentSnapshot[]).filter(
          (e) => e.status === "available" || e.status === "busy"
        );
        setEmployees(list);

        if (initialToUserId) {
          const to = list.find((e) => e.user_id === initialToUserId);
          if (to) {
            setToUser({
              label: `${to.name} (${to.active_order_count}/${to.max_orders})`,
              value: to.user_id,
            });
          }
        }

        const donor = list.find(
          (e) =>
            e.active_order_count > 0 &&
            (!initialToUserId || e.user_id !== initialToUserId)
        );
        if (donor) {
          setFromUser({
            label: `${donor.name} (${donor.active_order_count}/${donor.max_orders})`,
            value: donor.user_id,
          });
        }
      })
      .catch((err: any) => ToastService.error(err?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [isOpen, initialToUserId]);

  const options = employees.map((e) => ({
    label: `${e.name} · ${e.active_order_count}/${e.max_orders} · ${e.status}`,
    value: e.user_id,
  }));

  // From/To mutually exclusive — selected user never listed on the other side
  const fromOptions = toUser?.value
    ? options.filter((o) => o.value !== toUser.value)
    : options;
  const toOptions = fromUser?.value
    ? options.filter((o) => o.value !== fromUser.value)
    : options;

  const fromSnap = employees.find((e) => e.user_id === fromUser?.value);
  const toSnap = employees.find((e) => e.user_id === toUser?.value);
  const maxAllowed = Math.min(
    fromSnap?.active_order_count ?? 0,
    toSnap?.remaining_capacity ?? 0
  );

  const handleTransfer = async () => {
    const qty = Math.floor(Number(quantity));
    if (!fromUser?.value || !toUser?.value) {
      ToastService.error("Select from and to employees");
      return;
    }
    if (!Number.isFinite(qty) || qty < 1) {
      ToastService.error("Quantity must be at least 1");
      return;
    }
    if (maxAllowed < 1) {
      ToastService.error("No transferable capacity between selected users");
      return;
    }

    setSaving(true);
    try {
      const res = await OrderAssignmentService.adminTransfer({
        from_user: String(fromUser.value),
        to_user: String(toUser.value),
        quantity: qty,
      });
      if (!res?.success) {
        ToastService.error(res?.message || "Transfer failed");
        return;
      }
      ToastService.success(res?.message || "Orders transferred");
      transferredRef.current = true;
      onTransferred?.();
      onClose({ transferred: true });
    } catch (err: any) {
      ToastService.error(err?.message || "Transfer failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose({ transferred: transferredRef.current })}
      width="w-full md:w-3/4"
      maxWidth="max-w-lg"
    >
      <Modal.Header className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Transfer Assigned Orders
        </h3>
        <Icon
          name="close"
          onClick={() => onClose({ transferred: transferredRef.current })}
          className="cursor-pointer text-gray-600 dark:text-gray-300"
        />
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p className="text-sm text-gray-500 py-6">Loading employees…</p>
        ) : (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                From (has orders)
              </label>
              <SelectComponent
                options={fromOptions}
                value={fromUser}
                onChange={setFromUser}
                placeholder="Select source employee"
                className="w-full mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                To (needs orders)
                {initialToUserId ? (
                  <span className="ml-1 font-normal text-gray-500">
                    — locked from notification
                  </span>
                ) : null}
              </label>
              <SelectComponent
                options={toOptions}
                value={toUser}
                onChange={setToUser}
                placeholder="Select target employee"
                className="w-full mt-1"
                isDisabled={Boolean(initialToUserId)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity (max {maxAllowed})
              </label>
              <input
                type="number"
                min={1}
                max={Math.max(1, maxAllowed)}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <Button
              type="button"
              disabled={saving || maxAllowed < 1}
              onClick={handleTransfer}
              className="h-11 w-full rounded-xl bg-blue-700 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-300"
            >
              {saving ? "Transferring…" : "Transfer orders"}
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export type { INeedOrdersNotification };
export default TransferOrdersModal;
