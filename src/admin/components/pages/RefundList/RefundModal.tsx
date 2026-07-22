"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import { ToastService } from "@admin/utils/toastr.service";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { RefundListService } from "@admin/@services/apis/RefundList/RefundList.service";
import { RefundListContext } from "@/app/admin/orders/refund/page";
import Image from "next/image";
import {
  allPaymentMethodOptions,
  reasonOptions,
} from "@admin/components/pages/Utilities/paymentData";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";

type SelectOption = { label: string; value: string };

type OrderSuggestion = {
  _id?: string;
  sysid?: string;
  account_id?: any;
  customer?: { phone?: string };
  status?: string;
  line_items?: {
    title?: string;
    quantity?: number;
    price?: number;
    subtotal?: number;
    total?: number;
    product_id?: { featured_image?: { src?: string } };
  }[];
};

const buildSchema = (isCreate: boolean, isStatusUpdateOnly: boolean) =>
  yup.object({
    trx_id: yup.string().optional(),
    account_id: yup.mixed().required("Account required"),
    order: yup.string().required("Order required"),
    amount: yup
      .number()
      .nullable()
      .transform((value, originalValue) => {
        if (
          originalValue === "" ||
          originalValue === null ||
          originalValue === undefined
        )
          return null;
        return Number.isNaN(value) ? null : value;
      })
      .min(0, "Amount must be positive")
      .when([], {
        is: () => isStatusUpdateOnly,
        then: (s) => s.optional(),
        otherwise: (s) => s.required("Amount required"),
      }),
    reason: isStatusUpdateOnly
      ? yup.string().optional()
      : yup.string().required("Reason required"),
    note: yup.string().optional(),
    payment_method: yup.string().required("Payment method required"),
    customer_account: yup.string().trim().required("Customer account required"),
    is_partial: isStatusUpdateOnly
      ? yup.boolean().optional()
      : yup.boolean().required("Refund type required"),
  });

type RefundFormValues = yup.InferType<ReturnType<typeof buildSchema>>;

const defaultValues: RefundFormValues = {
  trx_id: "",
  order: "",
  amount: null,
  account_id: "",
  reason: "",
  note: "",
  payment_method: "",
  customer_account: "",
  is_partial: undefined,
};

const RefundModal = () => {
  const {
    modalMode,
    isModalOpen,
    setIsModalOpen,
    fetchReturnList,
    selectedRefund,
    setSelectedRefund,
    statusUpdateOnly,
    setStatusUpdateOnly,
  } = useContext(RefundListContext);

  const [selectedOrder, setSelectedOrder] = useState<OrderSuggestion | null>(
    null,
  );
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSuggestions, setOrderSuggestions] = useState<OrderSuggestion[]>(
    [],
  );
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const [showOrderSug, setShowOrderSug] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const isCreateMode = modalMode === "Add";

  const formResolver = useMemo(
    () => yupResolver(buildSchema(isCreateMode, statusUpdateOnly)),
    [isCreateMode, statusUpdateOnly],
  );

  const getAccountList = () => {
    AccountListService.getAccountSuggestion()
      .then((res: any) => {
        if (res?.success) {
          const options = res?.data?.map((item: any) => ({
            label: item?.account_name
              .toLowerCase()
              .replace(/\b\w/g, (char: string) => char.toUpperCase()),
            value: item._id,
          }));
          setAccountOptions(options);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    if (isModalOpen && !isCreateMode) {
      getAccountList();
    }
  }, [isModalOpen, isCreateMode]);
  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RefundFormValues>({
    resolver: formResolver,
    defaultValues,
  });

  const paymentMethodValue = watch("payment_method");
  const refundTypeOptions: SelectOption[] = useMemo(
    () => [
      { label: "Full Refund", value: "false" },
      { label: "Partial Refund", value: "true" },
    ],
    [],
  );

  // const reasonOptions: SelectOption[] = useMemo(
  //   () => [
  //     { label: "প্রোডাক্ট পছন্দ হয়নি", value: "not_liked" },
  //     { label: "প্রোডাক্ট ড্যামেজ", value: "damaged" },
  //     { label: "দামের অমিল", value: "price_mismatch" },
  //     { label: "স্টক নেই", value: "out_of_stock" },
  //     {
  //       label: "ডেলিভারি/সার্ভিস চার্জ সংক্রান্ত সমস্যা",
  //       value: "delivery_charge_issue",
  //     },
  //   ],
  //   [],
  // );

  const renderProductSummary = (order?: OrderSuggestion | null) => {
    const items = order?.line_items || [];
    if (!items.length) {
      return (
        <p className="text-lg text-gray-500">
          {order?.sysid ? `Order: ${order.sysid}` : "No line items"}
        </p>
      );
    }

    const top = items
      .slice(0, 4)
      .map((li) => {
        const t = li?.title?.trim();
        const q = typeof li?.quantity === "number" ? li.quantity : undefined;
        if (!t) return null;
        const img = li?.product_id?.featured_image?.src;
        const total = typeof li?.total === "number" ? li.total : undefined;
        const price = typeof li?.price === "number" ? li.price : undefined;
        return { t, q, img, total, price };
      })
      .filter(Boolean) as {
      t: string;
      q?: number;
      img?: string;
      total?: number;
      price?: number;
    }[];

    return (
      <div className="mt-1">
        <div className="mt-1 space-y-4">
          {top.map((li, i) => (
            <div
              key={`${li.t}-${i}`}
              className="flex gap-2 text-xs text-gray-500 "
            >
              {li.img ? (
                <Image
                  src={li.img}
                  alt=""
                  width={40}
                  height={40}
                  className="w-14 h-14 rounded object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded bg-gray-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-medium text-gray-500">
                  {li.t}
                </p>
                <p className="text-[14px] text-gray-400 truncate pt-1">
                  Price: ৳ {li.price || 0}
                </p>
                <p className="text-[14px] text-gray-400 truncate pt-1">
                  Total : ৳ {li.total || 0}
                </p>
              </div>
            </div>
          ))}
          {items.length > 4 && (
            <p className="text-xs text-gray-500">+{items.length - 4} more</p>
          )}
        </div>
      </div>
    );
  };

  const normalizeSuggestionList = <T,>(value: unknown): T[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];

    if (typeof value === "object") {
      const maybeData = (value as Record<string, unknown>)["data"];
      if (Array.isArray(maybeData)) return maybeData as T[];
      if (maybeData && typeof maybeData === "object") {
        const nested = (maybeData as Record<string, unknown>)["data"];
        if (Array.isArray(nested)) return nested as T[];
      }
      return [value as T];
    }

    return [];
  };

  const clearOrder = () => {
    setSelectedOrder(null);
    setOrderSuggestions([]);
    setOrderSearch("");
    setShowOrderSug(false);
    setValue("order", "");
  };

  const onClose = () => {
    setIsModalOpen(false);
    clearOrder();
    reset(defaultValues);
    setSelectedRefund(null);
    setStatusUpdateOnly(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    if (modalMode !== "Edit") return;
    if (!selectedRefund?._id) return;

    const orderId =
      typeof selectedRefund?.order === "string"
        ? selectedRefund.order
        : selectedRefund?.order?._id || "";

    setSelectedOrder({
      _id: orderId,
      sysid: selectedRefund?.order?.sysid,
    });
    setValue("order", orderId);

    setValue("trx_id", selectedRefund?.trx_id || "");
    setValue(
      "amount",
      selectedRefund?.amount === null || selectedRefund?.amount === undefined
        ? null
        : Number(selectedRefund.amount),
    );
    setValue("reason", selectedRefund?.reason || "");
    setValue("note", selectedRefund?.note || "");
    setValue("payment_method", selectedRefund?.payment_method || "");
    setValue(
      "customer_account",
      (selectedRefund as { customer_account?: string })?.customer_account || "",
    );
    setValue(
      "is_partial",
      typeof selectedRefund?.is_partial === "boolean"
        ? selectedRefund.is_partial
        : undefined,
    );
  }, [isModalOpen, modalMode, selectedRefund?._id]);

  const searchOrder = async (term: string) => {
    try {
      const res = await productService.getAllOrderSuggestion({
        searchTerm: term,
      });
      if (res?.success) {
        const raw = (res as { data?: unknown } | null | undefined)?.data;
        const list = normalizeSuggestionList<OrderSuggestion>(raw);
        setOrderSuggestions(list);
        setShowOrderSug(list.length > 0);
      } else {
        setOrderSuggestions([]);
        setShowOrderSug(false);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to search order";
      ToastService.error(message);
    }
  };

  const formSubmit = async (data: any) => {
    if (statusUpdateOnly) {
      if (!selectedRefund?._id) {
        ToastService.error("Refund not selected");
        return;
      }

      try {
        setIsSubmit(true);
        const updatePayload: Record<string, unknown> = {};
        if (data.trx_id?.trim()) updatePayload.trx_id = data.trx_id.trim();
        if (data.amount !== null && data.amount !== undefined) {
          updatePayload.amount = Number(data.amount);
        }
        // Always send method/account (so edit/clear is reflected)
        updatePayload.payment_method = data.payment_method || "";
        updatePayload.customer_account = data.customer_account || "";
        updatePayload.account_id = data.account_id?.value;

        if (Object.keys(updatePayload).length === 0) {
          ToastService.warning("Nothing to update");
          return;
        }

        if (data.trx_id?.trim()) {
          const statusRes = await RefundListService.updateStatusRefund(
            selectedRefund._id,
            {
              status: "completed",
              ...updatePayload,
            },
          );
          ToastService.success(statusRes?.message || "Status updated");
        } else {
          const res = await RefundListService.updateRefund(
            selectedRefund._id,
            updatePayload,
          );
          ToastService.success(res?.message || "Refund updated");
        }
        fetchReturnList();
        onClose();
      } catch (err: any) {
        ToastService.error(err.message);
      } finally {
        setIsSubmit(false);
      }
      return;
    }

    const payload = {
      ...(modalMode === "Edit" ? { trx_id: data.trx_id } : {}),
      order: data.order,
      ...(data.amount === null || data.amount === undefined
        ? {}
        : { amount: Number(data.amount) }),
      reason: data.reason || undefined,
      ...(modalMode === "Edit" ? { note: data.note || undefined } : {}),
      ...(modalMode === "Add" ? { status: "pending" } : {}),
      payment_method: data.payment_method,
      ...(data.customer_account?.trim()
        ? { customer_account: data.customer_account.trim() }
        : {}),
      is_partial: Boolean(data.is_partial),
    };

    // hello
    try {
      setIsSubmit(true);
      const res =
        modalMode === "Edit" && selectedRefund?._id
          ? await RefundListService.updateRefund(selectedRefund._id, payload)
          : await RefundListService.createRefundList(payload);
      ToastService.success(
        res?.message ||
          (modalMode === "Edit" ? "Refund updated" : "Refund created"),
      );
      fetchReturnList();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : modalMode === "Edit"
            ? "Failed to update refund"
            : "Failed to create refund";
      ToastService.error(message);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal isOpen={isModalOpen} onClose={onClose}>
        <Modal.Header className="flex justify-between">
          <h3 className="text-lg font-medium">
            {modalMode === "Edit" ? "Edit Refund" : "Create Refund"}
          </h3>
          <Icon name="close" onClick={onClose} />
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            {!statusUpdateOnly && (
              <div>
                <label className="block text-sm font-medium mb-1">Order</label>

                {selectedOrder?._id ? (
                  <div className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      {renderProductSummary(selectedOrder)}
                    </div>
                    {modalMode === "Add" && (
                      <Button
                        type="button"
                        className="!px-3 !py-1.5 !bg-gray-200 !text-gray-800"
                        onClick={clearOrder}
                      >
                        Change
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <input
                      value={orderSearch}
                      onChange={(e) => {
                        const v = e.target.value;
                        setOrderSearch(v);
                        if (v.length >= 2) searchOrder(v);
                        else setShowOrderSug(false);
                      }}
                      placeholder="Search order (sysid / phone)"
                      className="w-full border rounded-lg p-2"
                    />

                    {showOrderSug && orderSuggestions.length > 0 && (
                      <div className="w-full border rounded-lg mt-2 overflow-hidden">
                        {orderSuggestions.slice(0, 8).map((sug, idx) => (
                          <button
                            key={sug?._id || `${sug?.sysid || "order"}-${idx}`}
                            type="button"
                            className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                            onClick={() => {
                              setSelectedOrder(sug);
                              setValue("order", sug?._id || "");
                              setShowOrderSug(false);
                              setOrderSearch("");
                              setOrderSuggestions([]);
                            }}
                          >
                            {renderProductSummary(sug)}
                          </button>
                        ))}
                      </div>
                    )}

                    {errors?.order && (
                      <p className="text-red-500 text-sm mt-1">
                        {String(errors.order?.message)}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <div className=" gap-4">
              {!isCreateMode && (
                <div className="pb-2">
                  <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                    Account
                    <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                      *
                    </span>
                  </label>
                  <Controller
                    name="account_id"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        options={accountOptions}
                        value={accountOptions.find(
                          (o) => o.value === field.value,
                        )}
                        onChange={(val: any) => field.onChange(val || [])}
                        placeholder="Select Account"
                        isRequired
                      />
                    )}
                  />

                  {errors?.account_id && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.account_id.message as string}
                    </p>
                  )}
                </div>
              )}
              {!isCreateMode && (
                <div>
                  <Input
                    label="TRX ID"
                    placeholder="TRX-2026-00001"
                    registerProperty={register("trx_id")}
                    isDisabled={false}
                  />
                  {errors?.trx_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errors.trx_id?.message)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Input
                  label="Amount"
                  placeholder="Enter amount"
                  type="number"
                  registerProperty={register("amount")}
                  isDisabled={false}
                />
                {errors?.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.amount?.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Payment Method
                </label>
                <Controller
                  name="payment_method"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      options={allPaymentMethodOptions}
                      value={allPaymentMethodOptions.find(
                        (o) => o.value === field.value,
                      )}
                      onChange={(opt: SelectOption | null) => {
                        field.onChange(opt?.value || "");
                        if (!opt?.value) setValue("customer_account", "");
                      }}
                      placeholder="Select payment method"
                      isDisabled={false}
                    />
                  )}
                />
                {errors?.payment_method && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.payment_method?.message)}
                  </p>
                )}
              </div>

              {/* Status removed: update from Track Refund */}
            </div>

            {Boolean(paymentMethodValue) && (
              <div>
                <Input
                  label="Customer account"
                  placeholder="Customer account / wallet number"
                  registerProperty={register("customer_account")}
                  isDisabled={false}
                />
                {errors?.customer_account && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.customer_account?.message)}
                  </p>
                )}
              </div>
            )}

            {!statusUpdateOnly && (
              <div className=" gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason
                  </label>
                  <Controller
                    name="reason"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        options={reasonOptions}
                        value={reasonOptions.find(
                          (o) => o.value === field.value,
                        )}
                        onChange={(opt: SelectOption | null) =>
                          field.onChange(opt?.value || "")
                        }
                        placeholder="Select reason"
                        isRequired
                        isDisabled={false}
                      />
                    )}
                  />
                  {errors?.reason && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errors.reason?.message)}
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">
                    Refund Type
                  </label>
                  <Controller
                    name="is_partial"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        options={refundTypeOptions}
                        value={
                          refundTypeOptions.find(
                            (o) =>
                              o.value ===
                              (typeof field.value === "boolean"
                                ? String(field.value)
                                : ""),
                          ) ?? null
                        }
                        onChange={(opt: SelectOption | null) =>
                          field.onChange(opt?.value === "true")
                        }
                        placeholder="Select Refund"
                        isRequired
                      />
                    )}
                  />
                  {errors?.is_partial && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errors.is_partial?.message)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!statusUpdateOnly && !isCreateMode && (
              <div>
                <Input
                  label="Note"
                  placeholder="Note"
                  registerProperty={register("note")}
                  type="textarea"
                />
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="!bg-gray-200 !text-gray-800"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmit}>
              {isSubmit ? <ButtonLoader /> : "Submit"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default RefundModal;
