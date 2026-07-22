/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Image from "next/image";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { ToastService } from "@admin/utils/toastr.service";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ReturnListService } from "@admin/@services/apis/ReturnList/ReturnList.service";
import { ReturnListContext } from "@/app/admin/orders/return/page";

/* ---------------- validation ---------------- */
const schema: any = yup.object({
  status: yup.mixed().required("Status required"),
  issue_title: yup.string().when("status", {
    is: (v: any) => v?.value === "issue",
    then: (s) => s.required("Issue title required"),
  }),
  note: yup.string(),
});

const defaultValues = {
  status: null,
  issue_title: "",
  note: "",
};

const ReturnListModal = () => {
  const { modalMode, isModalOpen, setIsModalOpen, fetchReturnList } =
    useContext(ReturnListContext);

  /* ---------------- states ---------------- */
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSuggestions, setOrderSuggestions] = useState<any>(null);
  const [showOrderSug, setShowOrderSug] = useState(false);

  const [exchangeOrder, setExchangeOrder] = useState<any>(null);
  const [exchangeSearch, setExchangeSearch] = useState("");
  const [exchangeSuggestions, setExchangeSuggestions] = useState<any>(null);
  const [showExchangeSug, setShowExchangeSug] = useState(false);

  const [similarOrderSuggestions, setSimilarOrderSuggestions] = useState<any[]>(
    []
  );

  /**
   * ✅ Selection is based on quantity only:
   *  - qty === 0 => NOT selected
   *  - qty >= 1 => selected
   */
  const [selectedLineItems, setSelectedLineItems] = useState<
    Record<string, number>
  >({});
  const [selectedExchangeLineItems, setSelectedExchangeLineItems] = useState<
    Record<string, number>
  >({});

  const [isSubmit, setIsSubmit] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    control,
    reset,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const selectedStatus: any = watch("status");

  /**
   * ✅ FULL selected definition (your requirement):
   * A product is "fully selected" only if selectedQty === item.quantity
   * And ALL products are fully selected => show Return + Issue
   * Otherwise => Partial Return + Issue
   */
  const isAllItemsFullySelected =
    orderDetails?.line_items?.length > 0 &&
    orderDetails.line_items.every((li: any) => {
      const pid = li.product_id?._id;
      const selectedQty = pid ? selectedLineItems[pid] ?? 0 : 0;
      const maxQty = Number(li.quantity) || 0;
      return selectedQty === maxQty && maxQty > 0;
    });

  /* ---------------- status options ---------------- */
  const statusOptionsInTransit = isAllItemsFullySelected
    ? [
        { label: "Return", value: "return" },
        { label: "Issue", value: "issue" },
      ]
    : [
        {
          label: "Partial Delivery",
          value: "partial-delivery",
        },
        { label: "Issue", value: "issue" },
      ];

  const statusOptionsDelivery = isAllItemsFullySelected
    ? [
        { label: "Exchange", value: "exchange" },
        { label: "Issue", value: "issue" },
        { label: "Return", value: "return" },
      ]
    : [
        { label: "Partial Delivery", value: "partial-delivery" },
        { label: "Issue", value: "issue" },
      ];

  /* ---------------- helpers ---------------- */
  const searchOrder = async (
    term: string,
    setList: Function,
    setShow: Function
  ) => {
    try {
      const res = await productService.getOrderSuggestion({ searchTerm: term });
      if (res?.success) {
        setList(res.data);
        setShow(true);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const changeQty = (
    item: any,
    delta: number,
    setter: React.Dispatch<React.SetStateAction<Record<string, number>>>
  ) => {
    const pid = item.product_id?._id;
    if (!pid) return;

    setter((prev) => {
      const next = { ...prev };
      const current = next[pid] ?? 0;

      const max = Number(item.quantity) || 0;
      const updated = current + delta;

      if (updated <= 0) {
        delete next[pid];
        return next;
      }

      next[pid] = Math.min(updated, max);
      return next;
    });
  };

  const selectExchangeOrder = (order: any) => {
    if (!order?._id) return;

    if (orderDetails?._id === order?._id) {
      ToastService.error("Order and old order IDs cannot be the same");
      return;
    }

    setExchangeOrder(order);
    setShowExchangeSug(false);
    setExchangeSearch("");
    setSelectedExchangeLineItems({});
  };

  const clearExchangeOrder = () => {
    setExchangeOrder(null);
    setExchangeSearch("");
    setExchangeSuggestions(null);
    setSelectedExchangeLineItems({});
    setShowExchangeSug(false);
  };

  /* ---------------- suggested same number orders ---------------- */
  useEffect(() => {
    if (!orderDetails?._id) return;

    ReturnListService.getSuggestionOrder({
      searchTerm: orderDetails?.customer?.phone,
      sysid: orderDetails?.sysid,
    })
      .then((res: any) => {
        setSimilarOrderSuggestions(res.data || []);
      })
      .catch(() => setSimilarOrderSuggestions([]));
  }, [orderDetails?._id]);

  /* ---------------- submit ---------------- */
  // const formSubmit = async (data: any) => {

  //   if (!orderDetails?._id) {
  //     ToastService.error("Please select an order");
  //     return;
  //   }

  //   const line_items = (orderDetails?.line_items || [])
  //     .map((item: any) => {
  //       const pid = item.product_id?._id;
  //       const selectedQty = pid ? selectedLineItems[pid] ?? 0 : 0;

  //       if (!pid || selectedQty <= 0) return null;

  //       return {
  //         title: item.title,
  //         product: pid,
  //         quantity: selectedQty,
  //       };
  //     })
  //     .filter(Boolean);

  //   if (!line_items.length) {
  //     ToastService.error("Please select at least one product");
  //     return;
  //   }

  //   let old_order: any = undefined;
  //   let exchange_line_items: any[] = [];

  //   if (
  //     data.status.value === "exchange" ||
  //     data.status.value === "exchange_partial"
  //   ) {
  //     if (!exchangeOrder?._id) {
  //       ToastService.error("Please select exchange order");
  //       return;
  //     }

  //     exchange_line_items = Object.entries(selectedExchangeLineItems)
  //       .filter(([_, qty]) => Number(qty) > 0)
  //       .map(([productId]) => productId);

  //     if (!exchange_line_items.length) {
  //       ToastService.error("Please select exchange product(s)");
  //       return;
  //     }

  //     old_order = exchangeOrder._id;
  //   }

  //   const payload: any = {
  //     order: orderDetails._id,
  //     status: data.status.value,
  //     old_order,
  //     line_items,
  //     exchange_line_items,
  //     note: data.note || "",
  //     ...(data.issue_title ? { issue_title: data.issue_title } : {}),
  //   };

  //   if (
  //     !(
  //       data.status.value === "exchange" ||
  //       data.status.value === "exchange_partial"
  //     )
  //   ) {
  //     delete payload.old_order;
  //     delete payload.exchange_line_items;
  //   }

  //   try {
  //     const res = await ReturnListService.createReturnList(payload);

  //     ToastService.success(res.message);
  //     if (data.status.value === "return" && isAllItemsFullySelected) {
  //       await OrdersService.returnStockUpdate(orderDetails._id, {
  //         status: "return",
  //       });
  //       await OrdersService.statusUpdate(orderDetails._id, {
  //         status: "return",
  //       });
  //     }

  //     fetchReturnList();
  //     reset();
  //     setIsModalOpen(false);
  //   } catch (err: any) {
  //     ToastService.error(err.message);
  //   } finally {
  //     setIsSubmit(false);
  //     setOrderDetails(null);
  //     clearExchangeOrder();
  //     setSelectedLineItems({});
  //   }
  // };

  const buildReturnLineItems = () => {
    // selectedLineItems: { [productId]: qty }
    const items = (orderDetails?.line_items || [])
      .map((li: any) => {
        const pid = li.product_id?._id;
        const qty = pid ? Number(selectedLineItems?.[pid] ?? 0) : 0;
        if (!pid || qty <= 0) return null;

        return {
          title: li.title,
          product: pid,
          quantity: qty,
        };
      })
      .filter(Boolean);

    return items as Array<{ title: string; product: string; quantity: number }>;
  };

  const buildPayload = (data: any) => {
    const baseStatus = selectedStatus?.value;
    const orderState = orderDetails?.status;

    const payload: any = {
      old_order: orderDetails?._id,
      status: baseStatus,
      note: data?.note || "",
    };

    if (baseStatus === "issue") {
      payload.issue_title = data?.issue_title || "";
      return payload;
    }

    if (baseStatus === "return") {
      return payload;
    }

    if (baseStatus === "exchange") {
      if (!exchangeOrder?._id) {
        ToastService.error("Please select exchange order");
        return null;
      }
      if (exchangeOrder._id === orderDetails._id) {
        ToastService.error("Order and new order IDs cannot be the same");
        return null;
      }
      payload.new_order = exchangeOrder._id;
      return payload;
    }

    if (baseStatus === "partial-delivery") {
      const return_line_items = buildReturnLineItems();

      if (!return_line_items.length) {
        ToastService.error(
          "Please select at least one product for return_line_items"
        );
        return null;
      }

      payload.return_line_items = return_line_items;

      if (orderState === "delivery" && baseStatus === "exchange") {
        if (!exchangeOrder?._id) {
          ToastService.error("Please select new order");
          return null;
        }
        if (exchangeOrder._id === orderDetails._id) {
          ToastService.error("Order and new order IDs cannot be the same");
          return null;
        }
        payload.new_order = exchangeOrder._id;
      }

      return payload;
    }

    ToastService.error("Invalid status selection");
    return null;
  };
  const formSubmit = async (data: any) => {
    if (!orderDetails?._id) {
      ToastService.error("Please select an order");
      return;
    }

    const payload = buildPayload(data);
    if (!payload) return;

    try {
      setIsSubmit(true);
      const res = await ReturnListService.createReturnList(payload);
      ToastService.success(res.message);

      fetchReturnList();
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
      setOrderDetails(null);
      clearExchangeOrder();
      setSelectedLineItems({});
    }
  };

  // const { resetField } = useForm(); // যদি already destructure না করে থাকো
  const selectedCount = Object.keys(selectedLineItems || {}).length;

  useEffect(() => {
    resetField("status");
  }, [selectedCount, resetField]);
  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        <Modal.Header className="flex justify-between">
          <h3 className="text-lg font-medium">
            {modalMode === "Edit" ? "Edit Return" : "Create Return"}
          </h3>
          <Icon
            name="close"
            onClick={() => {
              setIsModalOpen(false);
              setOrderDetails(null);
              setExchangeOrder(null);
              reset();
            }}
          />
        </Modal.Header>

        <Modal.Body>
          {/* -------- main order search -------- */}
          <input
            value={orderSearch}
            onChange={(e) => {
              const v = e.target.value;
              setOrderSearch(v);
              v.length >= 2
                ? searchOrder(v, setOrderSuggestions, setShowOrderSug)
                : setShowOrderSug(false);
            }}
            placeholder="Search order"
            className="w-full border rounded-lg p-2 mb-3"
          />

          {showOrderSug && orderSuggestions && (
            <div
              className="border rounded p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setOrderDetails(orderSuggestions);
                setShowOrderSug(false);
                setOrderSearch("");
                setSelectedLineItems({});
                setExchangeOrder(null);
                setSelectedExchangeLineItems({});
              }}
            >
              {orderSuggestions?.line_items?.map((p: any, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setOrderDetails(orderSuggestions);
                    setShowOrderSug(false);
                    setOrderSearch("");
                    setSelectedLineItems({});
                    setExchangeOrder(null);
                    setSelectedExchangeLineItems({});
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex gap-3"
                >
                  <Image
                    src={p.product_id?.featured_image?.src}
                    width={60}
                    height={60}
                    alt=""
                  />
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <small>Qty: {p.quantity}</small>
                    <small className="ms-4">
                      Phone: {orderSuggestions?.customer?.phone}
                    </small>
                    <p className="text-xs">
                      Notes: {orderSuggestions?.notes?.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* -------- main order items -------- */}
          {orderDetails?.line_items?.map((item: any, i: number) => {
            const pid = item.product_id?._id;
            const selectedQty = pid ? selectedLineItems[pid] ?? 0 : 0;
            const maxQty = Number(item.quantity) || 0;

            const isSelected = selectedQty >= 1;
            const isFullySelected = maxQty > 0 && selectedQty === maxQty;

            return (
              <div
                key={i}
                className={`border p-2 mb-2 rounded ${
                  isFullySelected
                    ? "bg-green-50 border-green-400"
                    : isSelected
                    ? "bg-red-50 border-red-400"
                    : ""
                }`}
              >
                <div className="flex gap-3 items-center">
                  <Image
                    src={item.product_id?.featured_image?.src}
                    width={45}
                    height={45}
                    alt=""
                    onClick={() =>
                      setPreviewImg(item.product_id?.featured_image?.src)
                    }
                    className="cursor-pointer"
                  />

                  <div className="flex-1">
                    <p>{item.title}</p>
                    <small>Order Qty: {item.quantity}</small>
                    <small className="ms-4">
                      Phone: {orderDetails?.customer?.phone}
                    </small>
                    <p className="text-xs">
                      Notes: {orderDetails?.notes?.text}
                    </p>
                  </div>

                  {/* ✅ Quantity controller (0 = not selected) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="border rounded px-2 py-1"
                      onClick={() => changeQty(item, -1, setSelectedLineItems)}
                      disabled={selectedQty <= 0}
                    >
                      -
                    </button>

                    <span className="min-w-[24px] text-center">
                      {selectedQty}
                    </span>

                    <button
                      type="button"
                      className="border rounded px-2 py-1"
                      onClick={() => changeQty(item, +1, setSelectedLineItems)}
                      disabled={selectedQty >= maxQty}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* -------- status -------- */}
          {Object.keys(selectedLineItems).length > 0
            ? orderDetails && (
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      {...field}
                      placeholder="Select Status"
                      options={
                        orderDetails.status === "in-transit"
                          ? statusOptionsInTransit
                          : statusOptionsDelivery
                      }
                    />
                  )}
                />
              )
            : null}

          {/* -------- suggested same number -------- */}
          {selectedStatus?.value === "exchange" ||
          selectedStatus?.value === "exchange_partial" ? (
            <div className="border rounded mt-4 p-2">
              <h4 className="font-semibold mb-2">
                Suggested Order Same Number
              </h4>

              {similarOrderSuggestions.map((ord: any) => (
                <div
                  key={ord._id}
                  onClick={() => selectExchangeOrder(ord)}
                  className={`p-2 rounded border mb-2 cursor-pointer ${
                    exchangeOrder?._id === ord._id
                      ? "bg-blue-50 border-blue-400"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium">Order #{ord.sysid}</p>
                  <div className="mt-2 space-y-2">
                    {ord.line_items.map((li: any, i: number) => (
                      <div key={i} className="flex gap-3 items-center">
                        <Image
                          src={li.product_id?.featured_image?.src}
                          width={36}
                          height={36}
                          alt=""
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImg(li.product_id?.featured_image?.src);
                          }}
                          className="cursor-pointer"
                        />
                        <div>
                          <p className="text-sm">{li.title}</p>
                          <small>Qty: {li.quantity}</small>
                          <small className="ms-4">
                            Phone: {ord?.customer?.phone}
                          </small>
                          <p className="text-xs">Notes: {ord?.notes?.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* -------- manual exchange search -------- */}
          {selectedStatus?.value === "exchange" &&
            // ||
            //   selectedStatus?.value === "partial-delivery"
            !exchangeOrder && (
              <div className="mt-4">
                <input
                  value={exchangeSearch}
                  onChange={(e) => {
                    const v = e.target.value;
                    setExchangeSearch(v);
                    v.length >= 2
                      ? searchOrder(
                          v,
                          setExchangeSuggestions,
                          setShowExchangeSug
                        )
                      : setShowExchangeSug(false);
                  }}
                  placeholder="Search exchange order"
                  className="w-full border rounded-lg p-2"
                />

                {showExchangeSug && exchangeSuggestions && (
                  <div
                    className="border rounded mt-2 p-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectExchangeOrder(exchangeSuggestions)}
                  >
                    {exchangeSuggestions?.line_items?.map(
                      (p: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (
                              exchangeSuggestions?._id === orderDetails?._id
                            ) {
                              ToastService.error(
                                "Order and old order IDs cannot be the same"
                              );
                              return;
                            }
                            setExchangeOrder(exchangeSuggestions);
                            setShowExchangeSug(false);
                            setExchangeSearch("");
                            setSelectedExchangeLineItems({});
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex gap-3"
                        >
                          <Image
                            src={p.product_id?.featured_image?.src}
                            width={40}
                            height={40}
                            alt=""
                          />
                          <div>
                            <p>{p.title}</p>
                            <small>Qty: {p.quantity}</small>
                            <small className="ms-4">
                              Phone: {exchangeSuggestions?.customer?.phone}
                            </small>
                            <p className="text-xs">
                              Notes: {exchangeSuggestions?.notes?.text}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

          {/* -------- exchange order items -------- */}
          {exchangeOrder && (
            <div className="mt-4 border rounded-lg bg-gray-50 p-3">
              <div className="flex justify-between mb-2">
                <p className="font-semibold">
                  Exchange Order (Select Multiple Products)
                </p>
                <Icon
                  name="delete"
                  className="text-red-600 cursor-pointer"
                  onClick={clearExchangeOrder}
                />
              </div>

              {exchangeOrder.line_items.map((item: any, i: number) => {
                const pid = item.product_id?._id;
                const selectedQty = pid
                  ? selectedExchangeLineItems[pid] ?? 0
                  : 0;
                const maxQty = Number(item.quantity) || 0;

                const isSelected = selectedQty >= 1;
                const isFullySelected = maxQty > 0 && selectedQty === maxQty;

                return (
                  <div
                    key={i}
                    className={`border p-2 mb-2 rounded ${
                      isFullySelected
                        ? "bg-green-50 border-green-400"
                        : isSelected
                        ? "bg-red-50 border-red-400"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <Image
                        src={item.product_id?.featured_image?.src}
                        width={45}
                        height={45}
                        alt=""
                        onClick={() =>
                          setPreviewImg(item.product_id?.featured_image?.src)
                        }
                        className="cursor-pointer"
                      />

                      <div className="flex-1">
                        <p>{item.title}</p>
                        <small>Order Qty: {item.quantity}</small>
                        <small className="ms-4">
                          Phone: {exchangeOrder?.customer?.phone}
                        </small>
                        <p className="text-xs">
                          Notes: {exchangeOrder?.notes?.text}
                        </p>
                      </div>

                      {/* <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="border rounded px-2 py-1"
                          onClick={() =>
                            changeQty(item, -1, setSelectedExchangeLineItems)
                          }
                          disabled={selectedQty <= 0}
                        >
                          -
                        </button>

                        <span className="min-w-[24px] text-center">
                          {selectedQty}
                        </span>

                        <button
                          type="button"
                          className="border rounded px-2 py-1"
                          onClick={() =>
                            changeQty(item, +1, setSelectedExchangeLineItems)
                          }
                          disabled={selectedQty >= maxQty}
                        >
                          +
                        </button>
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedStatus?.value === "issue" && (
            <Input
              label="Issue Title"
              registerProperty={register("issue_title")}
              errorText={errors.issue_title?.message}
              isRequired
            />
          )}

          <Input
            label="Note"
            type="textarea"
            registerProperty={register("note")}
            errorText={errors.note?.message}
          />
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setIsModalOpen(false);
              setOrderDetails(null);
              setExchangeOrder(null);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 text-white">
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>

      {previewImg && (
        <ImagePreviewModal
          selectedImage={previewImg}
          closeModal={() => setPreviewImg(null)}
        />
      )}
    </form>
  );
};

export default ReturnListModal;
