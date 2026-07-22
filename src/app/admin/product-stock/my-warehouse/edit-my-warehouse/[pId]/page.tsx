"use client";
import Input from "@admin/components/core/Input/Input";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@admin/components/core/Button/Button";
import SelectComponent from "@admin/components/core/Select/Select";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import Image from "next/image";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { useRouter, useParams } from "next/navigation";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { MyWarehouseService } from "@admin/@services/apis/ProductStock/MyWarehouse/MyWarehouse.service";


const defaultValue: any = {
  warehouse: null,
  note: "",
};

const webSchema = yup.object({
  warehouse: yup.mixed().required("Warehouse is required"),
  note: yup.string(),
});

const Page: React.FC = () => {
  const router = useRouter();
  const { pId } = useParams();

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [warehouseData, setWarehouseData] = useState<any[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>({
    purchase_products: [],
  });

  const debouncedSearchTerm = useDebounce<string>(productSearch);

  const {
    handleSubmit,
    register,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

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

  const warehouseDataOption = warehouseData?.map((item: any) => ({
    label: item.title?.toUpperCase(),
    value: item._id,
  }));

  const getWarehouse = () => {
    WarehouseService.getggestion()
      .then((res: any) => {
        if (res?.success) {
          setWarehouseData(res?.data || []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const getSingleTransfer = () => {
    if (!pId) return;

    setPageLoading(true);

    MyWarehouseService.getSingleStockTransfer(pId)
      .then((res: any) => {
        if (res?.success) {
          const data = res?.data;

          setValue("note", data?.note || "");
          setValue("warehouse", {
            label: data?.receiver_warehouse?.title?.toUpperCase() || "",
            value: data?.receiver_warehouse?._id || "",
          });

          setOrderDetails({
            ...data,
            purchase_products:
              data?.line_items?.map((item: any) => ({
                product_id: item?.product?._id || item?.product,
                quantity: item?.quantity || 1,
                image:
                  item?.product?.featured_image?.src ||
                  item?.image ||
                  NodataImage,
                title: item?.product?.title || item?.title || "Unnamed Product",
                purchase_price: item?.product?.pricing?.purchase_price || 0,
                unit_cost: item?.product?.pricing?.purchase_price || 0,
                discount: 0,
                subtotal: 0,
              })) || [],
          });
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setPageLoading(false);
      });
  };

  useEffect(() => {
    getWarehouse();
  }, []);

  useEffect(() => {
    if (pId) {
      getSingleTransfer();
    }
  }, [pId]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchProductSearch();
    }
  }, [debouncedSearchTerm]);

  const isProductAlreadyAdded = (productId: string) => {
    return orderDetails?.purchase_products?.some(
      (item: any) => item.product_id === productId
    );
  };

  const handleProductSelect = (product: any) => {
    const isAlreadyAdded = isProductAlreadyAdded(product._id);

    if (isAlreadyAdded) {
      ToastService.warning("This product is already added to the list");
      return;
    }

    setOrderDetails((prev: any) => ({
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
          image: product?.featured_image?.src || NodataImage,
          title: product.title,
        },
      ],
    }));

    setProductSearch("");
    setFilteredProducts([]);
    setShowSuggestions(false);
  };

  const fetchProductSearch = async () => {
    productService
      .getProductSuggestion({
        searchTerm: debouncedSearchTerm,
        domain: "all",
      })
      .then((res: any) => {
        if (res?.success) {
          setFilteredProducts(res?.data || []);
          setShowSuggestions(true);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleSearchChange = (e: any) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);

    if (searchValue.length >= 2) {
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

  const decrementQuantity = (index: number) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];
    const currentQuantity = Number(newItems[index]?.quantity) || 0;

    if (currentQuantity > 1) {
      newItems[index] = {
        ...newItems[index],
        quantity: currentQuantity - 1,
      };

      setOrderDetails((prevDetails: any) => ({
        ...prevDetails,
        purchase_products: newItems,
      }));
    }
  };

  const incrementQuantity = (index: number) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];
    const currentQuantity = Number(newItems[index]?.quantity) || 0;

    newItems[index] = {
      ...newItems[index],
      quantity: currentQuantity + 1,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: newItems,
    }));
  };

  const handleRemoveProduct = (productId: string) => {
    if (!orderDetails) return;

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: prevDetails.purchase_products.filter(
        (item: any) => item.product_id !== productId
      ),
    }));
  };

  const handleQuantityChange = (index: number, value: string) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];

    if (value === "") {
      newItems[index] = {
        ...newItems[index],
        quantity: "",
      };

      setOrderDetails((prevDetails: any) => ({
        ...prevDetails,
        purchase_products: newItems,
      }));
      return;
    }

    const quantity = parseInt(value, 10);

    if (isNaN(quantity)) return;

    newItems[index] = {
      ...newItems[index],
      quantity: quantity < 1 ? 1 : quantity,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: newItems,
    }));
  };

  const formSubmit = (data: any) => {
    if (!orderDetails?.purchase_products?.length) {
      ToastService.error("Please add at least one product");
      return;
    }

    setIsSubmit(true);

    const simplifiedProducts = orderDetails.purchase_products.map(
      (product: any) => ({
        product: product.product_id,
        quantity: Number(product.quantity) || 1,
      })
    );

    const payload = {
      note: data?.note,
      receiver_warehouse: data?.warehouse?.value,
      line_items: simplifiedProducts,
    };

    MyWarehouseService.updateStockTransfer(pId, payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push("/admin/product-stock/transfer");
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
  };

  const totalQuantity =
    orderDetails?.purchase_products?.reduce(
      (acc: number, product: any) => acc + (Number(product?.quantity) || 0),
      0
    ) || 0;

  if (pageLoading) {
    return (
      <AuthLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <ButtonLoader />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Edit My Warehouse
            </h2>
          </div>
        </div>
      </NoScrollLayout>

      <form
        onSubmit={handleSubmit(formSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="px-4 min-h-[75vh] flex flex-col !w-full"
      >
        <div className="flex-1">
          <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 xl:gap-6 md:gap-2 !w-full ">
            <div>
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
                  />
                )}
              />
              {errors?.warehouse?.message && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors?.warehouse?.message)}
                </p>
              )}
            </div>

            <div className="-mt-3">
              <Input
                label={"Note"}
                registerProperty={register("note")}
                errorText={errors?.note?.message}
                type="text"
                placeholder="Enter note"
              />
            </div>
          </div>

          <div className="my-4">
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
                    productSearch.length >= 2 && setShowSuggestions(true)
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

                {showSuggestions && productSearch.length >= 2 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 w-full dark:bg-gray-700 bg-white border dark:text-gray-300 dark:border-gray-500 border-gray-300 mt-1 rounded-md z-10 max-h-72 overflow-y-auto"
                  >
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product: any, index: number) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex gap-6 items-center"
                          onClick={() => handleProductSelect(product)}
                        >
                          <Image
                            src={
                              product?.featured_image
                                ? product?.featured_image?.src
                                : NodataImage
                            }
                            width={40}
                            height={40}
                            className="rounded-md"
                            alt="Product Image"
                          />
                          <span>{product?.title}</span>
                          <span className="font-semibold">
                            BDT {product?.pricing?.purchase_price}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border dark:border-gray-500">
                <thead className="bg-blue-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 h-[40px] shadow-sm border-b border-gray-300">
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
                    <th className="border dark:border-gray-600 px-4 py-2 min-w-40 text-sm font-semibold">
                      Quantity ({totalQuantity})
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
                            <td className="border dark:border-gray-600 px-4 py-2 dark:text-gray-400 text-center text-sm font-semibold">
                              {originalIndex + 1}
                            </td>

                            <td className="border dark:border-gray-600 px-4 py-2">
                              <div className="flex items-center justify-center my-2 cursor-pointer">
                                <Image
                                  src={product?.image ? product?.image : NodataImage}
                                  width={60}
                                  height={60}
                                  className="rounded-md"
                                  alt="Product Image"
                                />
                              </div>
                            </td>

                            <td className="border dark:border-gray-600 text-sm font-semibold px-4 py-2 dark:text-gray-400">
                              {product?.title}
                            </td>

                            <td className="border dark:border-gray-600 px-4 py-2">
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => decrementQuantity(originalIndex)}
                                  className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-l"
                                >
                                  -
                                </button>

                                <input
                                  type="number"
                                  value={product.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      originalIndex,
                                      e.target.value
                                    )
                                  }
                                  className="w-28 text-center py-1 border-t border-b dark:border-gray-600 dark:bg-gray-700"
                                />

                                <button
                                  type="button"
                                  onClick={() => incrementQuantity(originalIndex)}
                                  className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-r"
                                >
                                  +
                                </button>
                              </div>
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
                        colSpan={5}
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
        </div>

        <div className="flex gap-3 items-end justify-end mt-auto pt-4">
          <Button
            type="button"
            className="bg-gray-400"
            onClick={() => {
              router.push("/admin/product-stock/transfer");
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="disabled:bg-gray-400 rounded-m flex justify-center font-medium text-white bg-blue-500"
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Page;