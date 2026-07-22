/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use client";
import Input from "@admin/components/core/Input/Input";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@admin/components/core/Button/Button";
import SelectComponent from "@admin/components/core/Select/Select";
// import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { ToastService } from "@admin/utils/toastr.service";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { formatDateRange } from "@admin/utils/hook.utils";
import { SupplierService } from "@admin/@services/apis/TeamService/SupplierService/supplier.service";
import Icon from "@admin/components/core/Icon/Icon";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import Image from "next/image";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import PurchasesModal from "@admin/components/pages/Purchases/PurchasesModal";
// import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";
import { useParams, useRouter } from "next/navigation";
import { parse, isValid } from "date-fns";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import UpdatePurchaseSkeleton from "@admin/components/Skeleton/Purchase/updatePurchase.skeleton";
import EditProductInfoSkeleton from "@admin/components/Skeleton/Orders/EditOrder/EditProductInfoSkeleton";
import PurchaseUpdateSkeleton from "@admin/components/Skeleton/Purchase/purchaseUpdate.skeleton";
import { PurchasesReturnService } from "@admin/@services/apis/PurchasesService/PurchasesReturn.service";

interface PurchaseFormData {
  // warehouse: { label: string; value: string } | string;
  supplier: { label: string; value: string } | string;
  discount: number;
  shipping: number;
  status: { label: string; value: string } | string;
  document: string | null;
  note: string | null;
  date: Date | null;
}

const webSchema = yup.object({
  // warehouse: yup.mixed().required("Warehouse is required"),
  supplier: yup.mixed().required("Supplier is required"),
  discount: yup
    .number()
    .typeError("Discount must be a number")
    .min(0, "Discount cannot be negative"),
  shipping: yup
    .number()
    .typeError("Shipping must be a number")
    .min(0, "Shipping cannot be negative"),
  status: yup.mixed().required("Status is required"),
  document: yup.string().nullable(),
  note: yup.string().nullable(),
  date: yup
    .date()
    .required("Date is required")
    .typeError("Invalid date format"),
});

const Page: React.FC = () => {
  const router = useRouter();
  const { pId } = useParams();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  // const [warehouseData, setWarehouseData] = useState<any>();
  const [supplierData, setSupplierData] = useState<any>();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [singleData, setSingleData] = useState<any>(null);
  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [productUnitCosts, setProductUnitCosts] = useState<
    Record<string, number>
  >({});

  const initialDefaultValues: PurchaseFormData = {
    // warehouse: "",
    supplier: "",
    discount: 0,
    shipping: 0,
    status: "",
    document: null,
    date: null,
    note: null,
  };

  const {
    handleSubmit,
    register,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: initialDefaultValues,
  });

  useEffect(() => {
    if (pId && singleData) {
      const apiDateFormat = "dd-MM-yyyy";
      let parsedDate: any = singleData.date
        ? parse(singleData.date, apiDateFormat, new Date())
        : null;

      if (parsedDate && !isValid(parsedDate)) {
        parsedDate = null;
      }

      reset({
        // warehouse: singleData.warehouse
        //   ? {
        //       label: singleData.warehouse.title.toUpperCase(),
        //       value: singleData?.warehouse?._id,
        //     }
        //   : "",
        supplier: singleData.supplier
          ? {
            label: `${singleData?.supplier?.name
              ?.toLowerCase()
              .replace(/\b\w/g, (char: string) =>
                char.toUpperCase()
              )} - ${singleData?.supplier?.company_name
                ?.toLowerCase()
                .replace(/\b\w/g, (char: string) => char.toUpperCase())}`,
            value: singleData?.supplier?._id,
          }
          : "",
        discount: singleData.discount ?? 0,
        shipping: singleData.shipping ?? 0,
        status: singleData.status
          ? {
            label:
              singleData.status
                .charAt(0)
                .toLowerCase()
                .replace(/\b\w/g, (char: string) => char.toUpperCase()) +
              singleData.status.slice(1),
            value: singleData.status,
          }
          : "",
        document: singleData.document ?? null,
        note: singleData.note ?? null,
        date: parsedDate,
      });

      setOrderDetails({
        return_products: singleData.return_products.map((item: any) => {
          return {
            product_id: item?.product?._id,
            quantity: item?.quantity,
            subtotal: item?.subtotal,
            discount: item?.discount,
            unit_cost: item?.unit_cost,
            image: item?.product?.featured_image?.src || NodataImage.src,
            title: item?.product?.title,
          };
        }),
      });

      const initialUnitCosts: Record<string, number> = {};
      singleData.return_products.forEach((item: any) => {
        initialUnitCosts[item?.product?._id] = item.unit_cost;
      });
      setProductUnitCosts(initialUnitCosts);
    } else if (!pId) {
      reset(initialDefaultValues);
      setOrderDetails(null);
      setProductUnitCosts({});
    }
  }, [pId, singleData, reset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        if (filteredProducts.length > 0) {
          setFilteredProducts([]);
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filteredProducts]);

  const formSubmit = (data: PurchaseFormData) => {
    if (
      !orderDetails ||
      !orderDetails.return_products ||
      orderDetails.return_products.length === 0
    ) {
      ToastService.error("Please add at least one product to the purchase.");
      return;
    }

    const simplifiedProducts = orderDetails.return_products.map(
      (product: any) => ({
        product: product?.product_id,
        quantity: product?.quantity,
        discount: product?.discount,
        unit_cost: product?.unit_cost,
      })
    );

    if (typeof data.status === "string" || !data.status?.value) {
      ToastService.error("Please select a valid Status.");
      return;
    }
    if (typeof data.supplier === "string" || !data.supplier?.value) {
      ToastService.error("Please select a valid Supplier.");
      return;
    }
    // if (typeof data.warehouse === "string" || !data.warehouse?.value) {
    //   ToastService.error("Please select a valid Warehouse.");
    //   return;
    // }
    if (!data.date) {
      ToastService.error("Please select a purchase date.");
      return;
    }

    if (pId) {
      setIsSubmit(true);
      PurchasesReturnService.updatePurchases(pId, {
        ...data,
        date: formatDateRange(data.date).trim(),
        status: (data.status as { value: string }).value,
        supplier: (data.supplier as { value: string }).value,
        // warehouse: (data.warehouse as { value: string }).value,
        return_products: simplifiedProducts,
      })
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            // router.push("/admin/purchases/purchases-return");
            router.push(`/admin/purchase/return/view/${pId}`);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
        });
    } else {
      ToastService.error("Purchase ID is missing for update operation.");
    }
  };

  // const warehouseDataOption =
  //   warehouseData?.map((item: any) => ({
  //     label: item?.title.toUpperCase(),
  //     value: item?._id,
  //   })) || [];

  const supplierDataOption =
    supplierData?.map((item: any) => ({
      label: `${item.name
        .toLowerCase()
        .replace(/\b\w/g, (char: string) =>
          char.toUpperCase()
        )} - ${item.company_name
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase())}`,
      value: item?._id,
    })) || [];

  useEffect(() => {
    getAllSupplier();
    // getWarehouse();
  }, []);

  // const getWarehouse = () => {
  //   WarehouseService.getWarehouse({ searchTerm: "", page: 1, limit: 10 })
  //     .then((res: any) => {
  //       if (res?.success) {
  //         setWarehouseData(res?.data.data);
  //       } else {
  //         ToastService.error(res?.message);
  //       }
  //     })
  //     .catch((err: { message: string }) => {
  //       ToastService.error(err.message);
  //     });
  // };

  const getAllSupplier = () => {
    SupplierService.getAllSupplierSuggestions()
      .then((res: any) => {
        if (res?.success) {
          setSupplierData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const isProductAlreadyAdded = (productId: string) => {
    return orderDetails?.return_products?.some(
      (item: any) => item?.product_id === productId
    );
  };

  const handleProductSelect = (product: any) => {
    if (isProductAlreadyAdded(product?._id)) {
      ToastService.warning("This product is already added to the list");
      return;
    }

    setOrderDetails((prev: { return_products: any[] } | null) => ({
      return_products: [
        ...(prev?.return_products || []),
        {
          product_id: product?._id,
          quantity: 1,
          subtotal: product.pricing.purchase_price,
          discount: 0,
          unit_cost: product.pricing.purchase_price,
          image: product.featured_image?.src || NodataImage.src,
          title: product.title,
        },
      ],
    }));
    setProductSearch("");
    setFilteredProducts([]);
    setShowSuggestions(false);
  };

  const fetchProductSearch = async (searchValue: string) => {
    if (searchValue.length < 2) return;

    productService
      .getPurchaseProductSuggestion({
        searchTerm: searchValue,
      })
      .then((res: any) => {
        if (res?.success) {
          setFilteredProducts(res.data);

          if (res.data.length === 1) {
            const product = res.data[0];
            if (!isProductAlreadyAdded(product?._id)) {
              handleProductSelect(product);
            } else {
              ToastService.warning("This product is already added.");
            }
            setShowSuggestions(false);
          } else {
            setShowSuggestions(true);
          }
        } else {
          setFilteredProducts([]);
          setShowSuggestions(false);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
        setFilteredProducts([]);
        setShowSuggestions(false);
      });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);
    if (searchValue.length >= 2) {
      fetchProductSearch(searchValue);
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (productSearch.length >= 2) {
      fetchProductSearch(productSearch);
    }
  };

  const decrementQuantity = (index: number) => {
    if (!orderDetails || !orderDetails.return_products) return;

    const newItems = [...orderDetails.return_products];
    const currentQuantity = Number(newItems[index].quantity);

    if (currentQuantity > 1) {
      newItems[index] = {
        ...newItems[index],
        quantity: currentQuantity - 1,
      };
      setOrderDetails({ return_products: newItems });
    }
  };

  const incrementQuantity = (index: number) => {
    if (!orderDetails || !orderDetails.return_products) return;

    const newItems = [...orderDetails.return_products];
    const currentQuantity = Number(newItems[index].quantity);

    newItems[index] = {
      ...newItems[index],
      quantity: currentQuantity + 1,
    };
    setOrderDetails({ return_products: newItems });
  };

  const handleDiscountChange = (index: number, value: string) => {
    if (!orderDetails || !orderDetails.return_products) return;

    const newItems = [...orderDetails.return_products];
    const discountValue = parseFloat(value) || 0;

    newItems[index] = {
      ...newItems[index],
      discount: discountValue,
    };
    setOrderDetails({ return_products: newItems });
  };

  const handleRemoveProduct = (productId: string) => {
    if (!orderDetails) return;

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      return_products: prevDetails.return_products.filter(
        (item: any) => item?.product_id !== productId
      ),
    }));
  };

  const calculateSubtotal = () => {
    if (!orderDetails?.return_products) return 0;

    return orderDetails?.return_products.reduce((total: number, item: any) => {
      const unitCost =
        productUnitCosts[item?.product_id] !== undefined
          ? productUnitCosts[item?.product_id]
          : item?.unit_cost || 0;
      const quantity = item?.quantity || 0;
      const discountItem = item?.discount || 0;
      return total + (unitCost * quantity - discountItem);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = Number(watch("shipping")) || 0;
  const discount = Number(watch("discount")) || 0;
  const total = subtotal + shipping - discount;

  const isButtonDisable = total < singleData?.paid

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Ordered", value: "ordered" },
    { label: "Partial", value: "partial" },
    { label: "Received", value: "received" },
  ];

  useEffect(() => {
    setIsLoading(true);
    if (pId) {
      PurchasesReturnService.getSinglePurchases(pId)
        .then((res: any) => {
          if (res?.success) {
            setSingleData(res.data);
          } else {
            ToastService.error(res?.message);
            setSingleData(null);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
          setSingleData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [pId]);

  const totalQuantity =
    orderDetails?.return_products?.reduce(
      (acc: number, product: any) => acc + (product?.quantity || 0),
      0
    ) || 0;

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Update Purchases Return
            </h2>
          </div>
        </div>
      </NoScrollLayout>

      <form onSubmit={handleSubmit(formSubmit)} className=" px-4 min-h-[75vh]">
        {isLoading ? (
          <UpdatePurchaseSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-6 w-full">
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  selectedDate={field.value}
                  onChange={(date) => field.onChange(date)}
                  label="Date"
                  dateFormat="dd-MM-yy"
                  wrapperClassName="min-w-full"
                  required
                />
              )}
            />
            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Supplier
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="supplier"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={supplierDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Supplier"
                    isRequired
                    className=""
                  />
                )}
              />
            </div>

            {/* <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Warehouse
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="warehouse"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={warehouseDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Warehouse"
                    isRequired
                    className=""
                  />
                )}
              />
            </div> */}
          </div>
        )}

        <div className="my-4">
          <div>
            <div className="mb-3 w-full">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={productSearch}
                  onChange={handleSearchChange}
                  className="p-4 px-4 pr-10 w-full border bg-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                  placeholder="Search for a product"
                  onFocus={() =>
                    productSearch?.length >= 2 && setShowSuggestions(true)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-3.5 text-gray-400"
                  onClick={handleSearchSubmit}
                >
                  <Icon name="search" variant="outlined" size={40} />
                </button>

                {/* Suggestions dropdown */}
                {showSuggestions && productSearch?.length >= 2 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 w-full dark:bg-gray-700 bg-white border border-gray-300 dark:border-gray-500 mt-1 rounded-md z-10 max-h-72 overflow-y-auto"
                  >
                    {filteredProducts?.length > 0 ? (
                      filteredProducts?.map((product: any, index: number) => {
                        return (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center dark:text-gray-300"
                            onClick={() => handleProductSelect(product)}
                          >
                            <span>{product?.title}</span>
                            <span className="font-semibold ">
                              BDT {product?.pricing?.purchase_price?.toFixed(2)}
                            </span>
                          </div>
                        );
                      })
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
          {isLoading ? (
            <EditProductInfoSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border dark:border-gray-500">
                <thead className="bg-blue-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 h-[40px] shadow-sm border-b border-gray-300 ">
                  <tr>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-40 text-sm font-semibold">
                      Serial
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-40 text-sm font-semibold">
                      Product Image
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-60 text-sm font-semibold">
                      Product Name
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-60 text-sm font-semibold">
                      Net Unit Cost
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-40 text-sm font-semibold">
                      Quantity ({totalQuantity})
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-32 text-sm font-semibold">
                      Discount
                    </th>
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-32 text-sm font-semibold">
                      Subtotal
                    </th>

                    <th className="border dark:border-gray-600 px-4 py-2 min-w-20 text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails?.return_products?.length > 0 ? (
                    [...orderDetails?.return_products]
                      .reverse()
                      .map((product: any, reversedIndex: number) => {
                        const originalIndex =
                          orderDetails?.return_products?.length -
                          1 -
                          reversedIndex;

                        const currentUnitCost =
                          productUnitCosts[product?.product_id] !== undefined
                            ? productUnitCosts[product?.product_id]
                            : product?.unit_cost || 0;

                        const calculatedSubtotal =
                          currentUnitCost * product.quantity -
                          (product?.discount || 0);

                        return (
                          <tr
                            key={originalIndex}
                            className="odd:bg-gray-100 dark:odd:bg-gray-700 dark:border-gray-600 border"
                          >
                            <td className="border dark:border-gray-600  px-4 py-2 dark:text-gray-400 text-center text-sm font-semibold">
                              {originalIndex + 1}
                            </td>

                            <td className="flex items-center justify-center my-2 cursor-pointer">
                              <Image
                                src={
                                  product?.image ? product?.image : NodataImage
                                }
                                width={60}
                                height={60}
                                className="rounded-md"
                                alt="Product Image"
                              // onClick={() => handleImageClick(product.image)} // Define handleImageClick if needed
                              />
                            </td>
                            <td className="border dark:border-gray-600 text-sm font-semibold px-4 py-2 dark:text-gray-400">
                              {product?.title}
                            </td>
                            <td className="border dark:border-gray-600 text-sm font-semibold px-4 py-2 dark:text-gray-400">
                              <span className="flex items-center gap-4">
                                <p> {currentUnitCost?.toFixed(2)}</p>
                                {/* <Icon
                                name={"edit_square"}
                                onClick={() => handleEditClick(product)}
                                className="text-blue-600 cursor-pointer"
                              /> */}
                              </span>
                            </td>
                            <td className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2">
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decrementQuantity(originalIndex)
                                  }
                                  className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-l"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={product.quantity}
                                  readOnly
                                  className="w-16 text-center py-1 border-t border-b dark:border-gray-500 dark:bg-gray-700"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    incrementQuantity(originalIndex)
                                  }
                                  className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-r"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="border dark:border-gray-600 px-4 py-2">
                              <input
                                type="number"
                                value={product.discount}
                                onChange={(e) =>
                                  handleDiscountChange(
                                    originalIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                              />
                            </td>
                            <td className="border dark:border-gray-600 px-4 text-sm font-semibold py-2 dark:text-gray-400">
                              {calculatedSubtotal.toFixed(2)}
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
                        colSpan={8}
                        className="text-center py-4 dark:text-gray-400"
                      >
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={7}
                      className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                    >
                      Subtotal:
                    </td>
                    <td className="px-4 py-2 dark:text-gray-300 text-end">
                      {subtotal.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={7}
                      className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                    >
                      Shipping:
                    </td>
                    <td className="px-4 py-2 dark:text-gray-300 text-end">
                      {shipping.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={7}
                      className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                    >
                      Discount(-):
                    </td>
                    <td className="px-4 py-2 dark:text-gray-300 text-end">
                      {discount.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td
                      colSpan={7}
                      className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-2 dark:text-gray-300 text-end">
                      {total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
        {isLoading ? (
          <PurchaseUpdateSkeleton />
        ) : (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 md:gap-6">
            <div className="">
              <Input
                label={"Shipping"}
                registerProperty={register("shipping")}
                errorText={errors?.shipping?.message}
                type="number"
                placeholder="Enter shipping cost"
              />
              <div className="pb-2">
                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                  Status
                  <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                    *
                  </span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      options={statusOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select Status"
                      isRequired
                      className=""
                    />
                  )}
                />
              </div>
            </div>
            <div className="">
              <Input
                label={"Discount"}
                registerProperty={register("discount")}
                errorText={errors?.discount?.message}
                type="number"
                placeholder="Enter global discount"
              />
              <Input
                label={"Note"}
                registerProperty={register("note")}
                errorText={errors?.note?.message}
                type="textarea"
                placeholder="Add purchase note"
              />
            </div>
            <div className="">
              <Input
                label={"Document"}
                registerProperty={register("document")}
                errorText={errors?.document?.message}
                type="text"
                placeholder="Enter document reference"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 items-end justify-end">
          <Button
            className="bg-gray-400"
            onClick={() => {
              router.push("/admin/purchase/return");
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={
              "disabled:bg-gray-400 rounded-m flex justify-center font-medium text-white bg-blue-500 "
            }
            disabled={isSubmit || isButtonDisable}
          >
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </div>
      </form>

      <PurchasesModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        modalMode={modalMode}
        items={items}
        setProductUnitCosts={setProductUnitCosts}
      />
    </AuthLayout>
  );
};

export default Page;
