"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { productService } from "@admin/@services/apis/ProductService/Product.service";

type LineItem = {
  _id?: string;
  title: string;
  total?: number;
  product_id?:
    | {
        _id?: string;
        featured_image?: { src?: string };
      }
    | string;
};

type ReportIssueForm = {
  category: { label: string; value: string } | null;
  sub_category: { label: string; value: string } | null;
  description: string;
  selected_items: string[];
  name: string;
  phone: string;
  order_sysid: string;
  amount: null;
  address: string;
};

const defaultValue: ReportIssueForm = {
  category: null,
  sub_category: null,
  description: "",
  selected_items: [],
  name: "",
  phone: "",
  order_sysid: "",
  address: "",
  amount: null,
};

const webSchema = yup.object({
  category: yup.mixed().required("Category is required"),
  sub_category: yup.mixed().required("Sub category is required"),
  description: yup.string().required("Description is required"),
  order_sysid: yup.string().required("Order id is required"),
  name: yup.string().required("Name is required"),
  address: yup.string().required("Address is required"),
  phone: yup.string().required("Phone is required"),
  amount: yup.string().required("Amount is required"),
  selected_items: yup.array().of(yup.string()),
});

const ManualReportIssueModal = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  orderDetail,
  getReportIssue,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [reportCategories, setReportCategories] = useState<
    Array<{
      categories: { label: string; value: string };
      subCategory: Array<{ label: string; value: string }>;
    }>
  >([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const debouncedSearchTerm = useDebounce<string>(productSearch);

  const lineItems: LineItem[] = useMemo(
    () => orderDetail?.line_items ?? [],
    [orderDetail?.line_items],
  );

  // ---- Key builder to guarantee unique, non-empty keys
  const buildLineItemKey = (item: LineItem, index: number) => {
    const orderId = String(
      orderDetail?._id ?? orderDetail?.order_id ?? "order",
    );
    const idPart =
      (item?._id && String(item._id)) ||
      (typeof item?.product_id === "string" && item.product_id) ||
      (typeof item?.product_id === "object" && (item.product_id?._id || "")) ||
      (item?.title && item.title.trim().slice(0, 40).replace(/\s+/g, "-")) ||
      "noid";
    return `li-${orderId}-${idPart}-${index}`; // index ensures uniqueness even if duplicates exist
  };

  // Stable IDs for selection values
  const lineItemIds = useMemo(
    () => lineItems.map((it, idx) => buildLineItemKey(it, idx)),
    [lineItems], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    resetField,
    // setValue,
    watch,
    reset,
  } = useForm<ReportIssueForm | any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2) {
      fetchProductSearch();
    }
  }, [debouncedSearchTerm]);

  const selectedIds = watch("selected_items");
  // const allSelected =
  //   lineItemIds.length > 0 && selectedIds.length === lineItemIds.length;

  // const toggleSelectAll = () => {
  //   if (allSelected) {
  //     setValue("selected_items", []);
  //   } else {
  //     setValue("selected_items", lineItemIds);
  //   }
  // };

  const formSubmit = async (formData: ReportIssueForm) => {
    const report_issue_line_items = orderDetails?.purchase_products?.map(
      (item: any) => ({
        title: item.title,
        image: item.image || "",
      }),
    );

    // const report_issue_line_items = lineItems
    //   .map((item, idx) => ({ id: lineItemIds[idx], item }))
    //   .filter(({ id }) => selectedSet.has(id))
    //   .map(({ item }) => ({
    //     title: item.title,
    //     image:
    //       (typeof item.product_id === "object"
    //         ? item.product_id?.featured_image?.src
    //         : undefined) || "",
    //   }));

    const mainData = {
      name: formData.name,
      phone: formData.phone,
      amount: formData.amount,
      order_sysid: formData.order_sysid,
      address: formData.address,
      // order: orderDetail?._id,
      description: formData.description,
      issue_title: formData.category?.value,
      issue_sub_title: formData.sub_category?.value,
      report_issue_line_items,
    };

    setIsSubmit(true);
    ReportIssueCategoryService.createOrderReportIssue(mainData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);

          setIsModalOpen(false);
          reset(defaultValue);
          getReportIssue();
        } else {
          ToastService.error(res?.message || "Failed to create report");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Something went wrong");
      })
      .finally(() => setIsSubmit(false));
  };

  const getReportCategory = () => {
    ReportIssueCategoryService.getReportIssueCategory()
      .then((res: any) => {
        if (res?.success) {
          const formattedData = res.data.data.map((item: any) => {
            const formattedCategory = {
              label: item.issue_title
                .toLowerCase()
                .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              value: item.issue_title,
            };
            const formattedSubCategory = item.issue_sub_title.map(
              (subTitle: string) => ({
                label: subTitle
                  .toLowerCase()
                  .replace(/\b\w/g, (char: string) => char.toUpperCase()),
                value: subTitle,
              }),
            );
            return {
              categories: formattedCategory,
              subCategory: formattedSubCategory,
            };
          });
          setReportCategories(formattedData);
        } else {
          ToastService.error(res?.message || "Failed to get report categories");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err.message || "An error occurred while fetching report categories",
        );
      });
  };

  useEffect(() => {
    if (isModalOpen) {
      getReportCategory();
    } else {
      reset(defaultValue);
    }
  }, [isModalOpen]);

  const handleSearchChange = (e: any) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);
    if (searchValue.length >= 2) {
      // fetchProductSearch(searchValue, "683b0d1077bf0bc4713a8ee6");
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (productSearch.length >= 2) {
      fetchProductSearch();
    }
  };

  const fetchProductSearch = async () => {
    productService
      .getPurchaseProductSuggestion({
        searchTerm: debouncedSearchTerm,
      })
      .then((res: any) => {
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

  const isProductAlreadyAdded = (productId: string) => {
    return orderDetails?.purchase_products?.some(
      (item: any) => item.product_id === productId,
    );
  };

  const handleProductSelect = (product: any) => {
    const isAlreadyAdded = isProductAlreadyAdded(product._id);
    if (isAlreadyAdded) {
      ToastService.warning("This product is already added to the list");
      return;
    }

    setOrderDetails((prev: { purchase_products: any[] }) => ({
      ...prev,
      purchase_products: [
        ...(prev?.purchase_products || []),
        {
          product_id: product?._id,
          quantity: 1,
          subtotal: product.subtotal || "0",
          discount: product.discount || 0,
          purchase_price: product?.pricing?.purchase_price,
          unit_cost: product?.pricing?.purchase_price || 0,
          image: product?.featured_image?.src,
          title: product.title,
        },
      ],
    }));

    setProductSearch("");
    setFilteredProducts([]);
    setShowSuggestions(false);
  };

  const handleRemoveProduct = (productId: string) => {
    if (!orderDetails) return;

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: prevDetails.purchase_products.filter(
        (item: any) => item.product_id !== productId,
      ),
    }));
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
            Report Issue
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full gap-5">
            {/* Order summary */}
            <div className="flex items-center gap-20"></div>

            <Input
              label="Name"
              registerProperty={register("name")}
              errorText={errors?.name?.message}
              type="text"
              isRequired
              placeholder="Enter your name"
            />
            <Input
              label="Phone"
              registerProperty={register("phone")}
              errorText={errors?.phone?.message}
              type="text"
              isRequired
              placeholder="Enter your phone"
            />
            <Input
              label="Address"
              registerProperty={register("address")}
              errorText={errors?.address?.message}
              type="text"
              isRequired
              placeholder="Enter your address"
            />
            <Input
              label="Amount"
              registerProperty={register("amount")}
              errorText={errors?.amount?.message}
              type="text"
              isRequired
              placeholder="Enter your amount"
            />
            <Input
              label="Order Id"
              registerProperty={register("order_sysid")}
              errorText={errors?.order_sysid?.message}
              type="text"
              isRequired
              placeholder="Enter your order id"
            />

            {/* Form fields */}
            <div className="mt-5">
              {/* Category */}
              <div className="pb-4">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Category
                  <span className="text-red-400 text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={reportCategories?.map((c) => c.categories)}
                      value={field.value}
                      onChange={(selectedOption: any) => {
                        field.onChange(selectedOption);
                        const match = reportCategories.find(
                          (item) =>
                            item.categories.value === selectedOption?.value,
                        );
                        setSelectedSubCategories(match?.subCategory || []);
                        resetField("sub_category");
                      }}
                      placeholder="Select Category"
                      isRequired
                    />
                  )}
                />
                {errors?.category?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {String(errors.category.message)}
                  </p>
                )}
              </div>

              {/* Sub Category */}
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Sub Category
                  <span className="text-red-400 text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="sub_category"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <SelectComponent
                      options={selectedSubCategories}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Sub Category"
                      isRequired
                    />
                  )}
                />
                {errors?.sub_category?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {String(errors.sub_category.message)}
                  </p>
                )}
              </div>

              {/* Description */}
              <Input
                label="Description"
                registerProperty={register("description")}
                errorText={errors?.description?.message}
                type="textarea"
                isRequired
                placeholder="Enter your description"
              />

              <div className="my-4">
                <div>
                  <div className="mb-3 w-full">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={productSearch}
                        onChange={handleSearchChange}
                        className="input-app !pr-10"
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
                        className="absolute right-4 top-3.5 text-gray-400"
                        onClick={handleSearchSubmit}
                      >
                        <Icon name="search" variant="outlined" size={40} />
                      </button>

                      {showSuggestions && productSearch.length >= 2 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute left-0 w-full dark:bg-gray-700 bg-white border dark:text-gray-300 dark:border-gray-500 border-gray-300 mt-1 rounded-md z-10 max-h-72 overflow-y-auto"
                        >
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map(
                              (product: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex gap-6 items-center"
                                    onClick={() => handleProductSelect(product)}
                                  >
                                    <Image
                                      src={product?.featured_image.src}
                                      width={40}
                                      height={40}
                                      className="rounded-md"
                                      alt="Product Image"
                                      // onClick={() => handleImageClick(product.image)}
                                    />
                                    <span>{product?.title}</span>
                                    <span className="font-semibold">
                                      BDT {product?.pricing?.purchase_price}
                                    </span>
                                  </div>
                                );
                              },
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
                <div className="overflow-x-auto">
                  <table className="edit-order-products-table">
                    <thead className="">
                      <tr>
                        <th className="border dark:border-gray-600 px-4 py-2 min-w-40 text-sm font-semibold">
                          Product Image
                        </th>
                        <th className="border dark:border-gray-600 px-4 py-2 min-w-60 text-sm font-semibold">
                          Product Name
                        </th>

                        <th className="border dark:border-gray-600 px-4 py-2 min-w-20 text-sm font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetails?.purchase_products?.length > 0 ? (
                        [...orderDetails.purchase_products]
                          .reverse()
                          .map((product: any, reversedIndex: number) => {
                            const originalIndex =
                              orderDetails.purchase_products.length -
                              1 -
                              reversedIndex;

                            return (
                              <tr
                                key={originalIndex}
                                className="odd:bg-gray-100 dark:odd:bg-gray-700 dark:border-gray-600 border"
                              >
                                <td className="flex items-center justify-center my-2 cursor-pointer">
                                  {
                                    <Image
                                      src={product?.image}
                                      width={60}
                                      height={60}
                                      className="rounded-md"
                                      alt="Product Image"
                                      // onClick={() => handleImageClick(product.image)}
                                    />
                                  }
                                </td>
                                <td className="border dark:border-gray-600 text-sm font-semibold px-4 py-2 dark:text-gray-400">
                                  {product?.title}
                                </td>

                                <td className="border px-4 py-2 text-center dark:border-gray-600">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveProduct(product?.product_id)
                                    }
                                    className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                                  >
                                    <Icon name="delete" variant="filled" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-4 dark:text-gray-400"
                          >
                            No products added yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4">
                <div className="space-y-2">
                  {lineItems?.map((item: LineItem, index: number) => {
                    const id = lineItemIds[index];
                    const imgSrc =
                      (typeof item.product_id === "object"
                        ? item.product_id?.featured_image?.src
                        : undefined) || "";

                    const isSelected = selectedIds.includes(id);

                    return (
                      <label
                        key={id}
                        className={`flex items-start gap-4 border dark:border-gray-500 p-2 rounded-lg cursor-pointer 
                          ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-gray-600 "
                              : "border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            value={id}
                            {...register("selected_items")}
                            className="mt-1"
                          />
                          <Image
                            src={imgSrc || "/placeholder.png"}
                            alt={item.title || "product"}
                            height={56}
                            width={56}
                            className="rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-base dark:text-gray-300">
                            {item.title}
                          </p>
                          {item?.total !== undefined && (
                            <p className="text-sm pt-1 dark:text-gray-300">
                              Total: {item.total}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {errors?.selected_items?.message && (
                  <p className="text-xs text-red-500 mt-2">
                    {String(errors.selected_items.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="btn-primary"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <ButtonLoader />
            ) : modalMode === "Edit" ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ManualReportIssueModal;
