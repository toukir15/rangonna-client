/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
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
import { ToastService } from "@admin/utils/toastr.service";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ReturnListService } from "@admin/@services/apis/ReturnList/ReturnList.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { ReturnListContext } from "@/app/admin/orders/return/page";

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
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSuggestions, setOrderSuggestions] = useState<any>();
  const [showOrderSug, setShowOrderSug] = useState(false);
  const [exchangeOrder, setExchangeOrder] = useState<any>(null);
  const [exchangeSearch, setExchangeSearch] = useState("");
  const [exchangeSuggestions, setExchangeSuggestions] = useState<any>();
  const [showExchangeSug, setShowExchangeSug] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState<any[]>([]);
  const [selectedExchangeLineItems, setSelectedExchangeLineItems] = useState<
    any[]
  >([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ModalOpen, setModalOpen] = useState(false);
  const [similarOrderSuggestions, setSimilarOrderSuggestions] = useState<any[]>(
    []
  );

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const isAllItemsSelected =
    orderDetails?.line_items?.length > 0 &&
    selectedLineItems.length === orderDetails.line_items.length;

  const {
    handleSubmit,
    register,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const selectedStatus: any = watch("status");

  const searchOrder = async (
    term: string,
    setList: Function,
    setShow: Function
  ) => {
    try {
      const res = await productService.getOrderSuggestion({
        searchTerm: term,
      });
      if (res?.success) {
        setList(res.data || []);
        setShow(true);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const toggleLineItem = (item: any) => {
    setSelectedLineItems((prev) => {
      const exists = prev.find((p) => p.product_id === item.product_id?._id);

      if (exists) {
        return prev.filter((p) => p.product_id !== item.product_id?._id);
      }

      return [...prev, { product_id: item.product_id?._id }];
    });
  };

  const toggleExchangeLineItem = (item: any) => {
    setSelectedExchangeLineItems((prev) => {
      const exists = prev.find((p) => p.product_id === item.product_id?._id);

      if (exists) {
        return prev.filter((p) => p.product_id !== item.product_id?._id);
      }

      return [...prev, { product_id: item.product_id?._id }];
    });
  };

  const clearExchangeOrder = () => {
    setExchangeOrder(null);
    setExchangeSearch("");
    setExchangeSuggestions([]);
    setSelectedExchangeLineItems([]);
  };

  const formSubmit = async (data: any) => {
    if (!orderDetails?._id) {
      ToastService.error("Please select an order");
      return;
    }

    if (selectedLineItems.length === 0) {
      ToastService.error("Please select at least one product");
      return;
    }

    if (data.status.value === "exchange") {
      if (!exchangeOrder?._id) {
        ToastService.error("Please select exchange order");
        return;
      }

      if (exchangeOrder._id === orderDetails._id) {
        ToastService.error("Order and old order IDs cannot be the same");
        return;
      }

      if (selectedExchangeLineItems.length === 0) {
        ToastService.error("Please select exchange product(s)");
        return;
      }
    }

    setIsSubmit(true);

    const payload: any = {
      order: orderDetails._id,
      status: data.status.value,
      note: data.note,
      line_items: selectedLineItems.map((i) => i.product_id),

      ...(data.status.value === "exchange" && {
        old_order: exchangeOrder._id,
        exchange_line_items: selectedExchangeLineItems.map((i) => i.product_id),
      }),

      ...(data.issue_title && { issue_title: data.issue_title }),
    };

    try {
      const res = await ReturnListService.createReturnList(payload);

      if (!res?.success) {
        ToastService.error(res.message);
        return;
      }

      ToastService.success(res.message);

      const isAllMainItemsSelected =
        orderDetails.line_items.length === selectedLineItems.length;
      const AllExchangeItemsSelected =
        data.status.value === "return" &&
        orderDetails.line_items.length === selectedLineItems.length;

      if (isAllMainItemsSelected && AllExchangeItemsSelected) {
        await OrdersService.returnStockUpdate(res.data.order, {
          status: "return",
        });
        ToastService.success("Stock updated successfully");
        await OrdersService.statusUpdate(res.data.order, { status: "return" });
      }
      fetchReturnList();
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
      reset();
      setIsModalOpen(false);
      setSelectedLineItems([]);
      setSelectedExchangeLineItems([]);
      setOrderDetails(null);
      clearExchangeOrder();
    }
  };

  const returnOrPartialOption = isAllItemsSelected
    ? [{ label: "Return", value: "return" }]
    : [{ label: "Partial", value: "partial" }];

  const statusOptionsInTransit = [
    ...returnOrPartialOption,
    { label: "Exchange", value: "exchange" },
    { label: "Issue", value: "issue" },
  ];

  const statusOptionsDelivery = [
    { label: "Exchange", value: "exchange" },
    { label: "Issue", value: "issue" },
  ];

  useEffect(() => {
    if (!orderSuggestions) return;
    ReturnListService.getSuggestionOrder({
      searchTerm: orderSuggestions?.customer?.phone,
      sysid: orderSuggestions?.sysid,
    })
      .then((res: any) => {
        setSimilarOrderSuggestions(res.data || []);
      })
      .catch((err: any) => {
        console.error("Price update failed:", err);
      });
  }, [orderSuggestions]);

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex justify-between">
          <h3 className="text-lg font-medium">
            {modalMode === "Edit" ? "Edit Return" : "Create Return"}
          </h3>
          <Icon name="close" onClick={() => setIsModalOpen(false)} />
        </Modal.Header>

        <Modal.Body>
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

          {showOrderSug && (
            <div className="border rounded mb-3">
              {orderSuggestions?.line_items?.map((p: any, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setOrderDetails(orderSuggestions);
                    setShowOrderSug(false);
                    setOrderSearch("");
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

          {orderDetails?.line_items?.map((item: any, i: number) => {
            const checked = selectedLineItems.some(
              (p) => p.product_id === item.product_id?._id
            );

            return (
              <div
                key={i}
                onClick={() => toggleLineItem(item)}
                className={`border p-2 mb-2 flex justify-between rounded cursor-pointer
    ${checked ? "bg-green-50 border-green-400" : "hover:bg-gray-50"}
  `}
              >
                <div className="flex gap-3 items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleLineItem(item)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Image
                    src={item.product_id?.featured_image?.src}
                    width={45}
                    height={45}
                    alt=""
                    onClick={() =>
                      handleImageClick(item.product_id?.featured_image?.src)
                    }
                  />
                  <div>
                    <p>{item.title}</p>
                    <small>Qty: {item.quantity}</small>
                    <small className="ms-4">
                      Phone: {orderSuggestions?.customer?.phone}
                    </small>
                    <p className="text-xs">
                      Notes: {orderSuggestions?.notes?.text}
                    </p>
                  </div>
                </div>
                <p>৳ {item.total}</p>
              </div>
            );
          })}

          <div className="my-4">
            {orderDetails && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    {...field}
                    placeholder="Select Status"
                    // options={
                    //   orderDetails.status === "in-transit"
                    //     ? statusOptionsInTransit
                    //     : statusOptionsDelivery
                    // }

                    options={
                      orderDetails.status === "in-transit"
                        ? statusOptionsInTransit
                        : statusOptionsDelivery
                    }
                  />
                )}
              />
            )}
          </div>

          {selectedStatus?.value === "exchange" ? (
            <div className="border rounded mt-2 overflow-y-auto max-h-60 p-2">
              <h1>Suggested Order Same Number</h1>
              {similarOrderSuggestions?.map((p: any, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    if (exchangeSuggestions?._id === orderDetails?._id) {
                      ToastService.error(
                        "Order and old order IDs cannot be the same"
                      );
                      return;
                    }
                    setExchangeOrder(exchangeSuggestions);
                    setShowExchangeSug(false);
                    setExchangeSearch("");
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            "hll"
          )}

          {selectedStatus?.value === "exchange" && !exchangeOrder && (
            <div className="py-4">
              <input
                value={exchangeSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setExchangeSearch(v);
                  v.length >= 2
                    ? searchOrder(v, setExchangeSuggestions, setShowExchangeSug)
                    : setShowExchangeSug(false);
                }}
                placeholder="Search exchange order"
                className="w-full border rounded-lg p-2 "
              />

              {showExchangeSug && (
                <div className="border rounded mt-2">
                  {exchangeSuggestions?.line_items?.map((p: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (exchangeSuggestions?._id === orderDetails?._id) {
                          ToastService.error(
                            "Order and old order IDs cannot be the same"
                          );
                          return;
                        }
                        setExchangeOrder(exchangeSuggestions);
                        setShowExchangeSug(false);
                        setExchangeSearch("");
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                const checked = selectedExchangeLineItems.some(
                  (p) => p.product_id === item.product_id?._id
                );

                return (
                  <div
                    key={i}
                    onClick={() => toggleExchangeLineItem(item)}
                    className={`border p-2 mb-2 flex justify-between rounded cursor-pointer
    ${checked ? "bg-green-50 border-green-400" : "hover:bg-gray-50"}
  `}
                  >
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExchangeLineItem(item)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Image
                        src={item.product_id?.featured_image?.src}
                        width={45}
                        height={45}
                        alt=""
                      />
                      <div>
                        <p>{item.title}</p>
                        <small>Qty: {item.quantity}</small>
                      </div>
                    </div>
                    <p>৳ {item.total}</p>
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
              noMargin
            />
          )}

          <Input
            label="Note"
            type="textarea"
            registerProperty={register("note")}
            errorText={errors.note?.message}
            noMargin
          />
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-2">
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button type="submit" className="bg-blue-600 text-white">
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
      {ModalOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </form>
  );
};

export default ReturnListModal;
