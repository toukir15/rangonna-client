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
import { useRouter } from "next/navigation";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import { WholesaleReturnService } from "@admin/@services/apis/WholesaleService/wholesale.service";

const defaultValue: any = {
  discount: 0,
  shipping: 0,
  status: { label: "Received", value: "received" },
  document: "",
};

const webSchema = yup.object({
  discount: yup.number(),
  shipping: yup.number(),
  status: yup.mixed().required("Supplier is required"),
  document: yup.string(),
  note: yup.string(),
});

const Page: React.FC = () => {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const [userInfo, setUserInfoData] = useState<any>();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const debouncedSearchTerm = useDebounce<string>(productSearch);

  const {
    handleSubmit,
    register,
    watch,
    control,
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

  const formSubmit = (data: any) => {
    setIsSubmit(true);

    const simplifiedProducts = orderDetails.purchase_products.map(
      (product: any) => ({
        product: product.product_id,
        quantity: product.quantity,
        discount: product.discount,
        unit_cost: product.unit_cost,
      }),
    );

    WholesaleReturnService.createPurchasesReturn({
      ...data,
      wholesale_user: data.wholesale_user.value,
      status: data.status.value,

      return_products: simplifiedProducts,
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push(`/orders/wholesale-return/view/${res?.data?._id}`);
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

  // const wholesaleDataOption = userInfo?.map((item: any) => ({
  //   label: `${item?.name
  //     ?.toLowerCase()
  //     .replace(/\b\w/g, (char: string) => char.toUpperCase())} `,
  //   value: item?._id,
  // }));
  const wholesaleDataOption = userInfo?.map((item: any) => ({
    label: `${item?.name
      ?.toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase())} - ${
      item?.business?.company_name
    } `,
    value: item._id,
  }));

  const fetchUserList = async () => {
    wholesaleOrderService
      .getWholesaleUserSuggestions()
      .then((res: any) => {
        if (res?.success) {
          setUserInfoData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    fetchUserList();
  }, []);
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchProductSearch();
    }
  }, [debouncedSearchTerm]);

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
          unit_cost: product?.price,
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
      .getProductWholesaleSuggestion({
        searchTerm: debouncedSearchTerm,
        wholesale_user: watch("wholesale_user")?.value,
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
    const currentQuantity = Number(newItems[index].quantity) || 0;

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
    const currentQuantity = Number(newItems[index].quantity) || 0;

    newItems[index] = {
      ...newItems[index],
      quantity: currentQuantity + 1,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: newItems,
    }));
  };

  const handleDiscountChange = (index: number, value: string) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];
    const discountValue = parseFloat(value);

    newItems[index] = {
      ...newItems[index],
      discount: discountValue,
      subtotal:
        newItems[index].quantity * newItems[index].unit_cost - discountValue,
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
        (item: any) => item.product_id !== productId,
      ),
    }));
  };

  const calculateSubtotal = () => {
    if (!orderDetails?.purchase_products) return 0;

    return orderDetails.purchase_products.reduce((total: number, item: any) => {
      const unitCost = item.unit_cost || 0;
      const quantity = item.quantity || 0;
      const discount = item.discount || 0;
      return total + (unitCost * quantity - discount);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = Number(watch("shipping")) || 0;
  const discount = Number(watch("discount")) || 0;
  const wholesaleUser = watch("wholesale_user") || 0;
  const total = subtotal + shipping - discount;

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Ordered", value: "ordered" },
    { label: "Partial", value: "partial" },
    { label: "Received", value: "received" },
  ];

  const handleQuantityChange = (index: number, value: string) => {
    if (!orderDetails) return;

    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity <= 0) return;

    const newItems = [...orderDetails.purchase_products];
    newItems[index] = {
      ...newItems[index],
      quantity: quantity,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: newItems,
    }));
  };

  const totalQuantity =
    orderDetails?.purchase_products?.reduce(
      (acc: number, product: any) => acc + (product?.quantity || 0),
      0,
    ) || 0;

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Create Wholesales Return
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
        className=" px-4 min-h-[75vh] !w-full"
      >
        <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 xl:gap-6 md:gap-2  !w-full">
          <div className="pb-2">
            <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
              WholeSale User
              <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                *
              </span>
            </label>
            <Controller
              name="wholesale_user"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectComponent
                  options={wholesaleDataOption}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select User"
                  isRequired
                  className=""
                />
              )}
            />
          </div>
        </div>
        <div className="my-4">
          <div>
            <div className="mb-3  w-full">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={productSearch}
                  onChange={handleSearchChange}
                  className={`p-4 px-4 pr-10 w-full border bg-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none ${
                    !wholesaleUser ? "cursor-not-allowed bg-gray-100" : ""
                  }`}
                  placeholder="Search for a product"
                  onFocus={() =>
                    productSearch.length >= 2 && setShowSuggestions(true)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                  disabled={!wholesaleUser}
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
                      filteredProducts.map((product: any, index: number) => {
                        return (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex gap-6 items-center"
                            onClick={() => handleProductSelect(product)}
                          >
                            <Image
                              src={
                                product?.featured_image
                                  ? product?.featured_image.src
                                  : NodataImage
                              }
                              width={40}
                              height={40}
                              className="rounded-md"
                              alt="Product Image"
                              // onClick={() => handleImageClick(product.image)}
                            />
                            <span>{product?.title}</span>
                            <span className="font-semibold">
                              BDT {product?.price}
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
                          <td className="border dark:border-gray-600  px-4 py-2 dark:text-gray-400 text-center text-sm font-semibold">
                            {originalIndex + 1}
                          </td>

                          <td className="flex items-center justify-center my-2 cursor-pointer">
                            {
                              <Image
                                src={
                                  product?.image ? product?.image : NodataImage
                                }
                                width={60}
                                height={60}
                                className="rounded-md"
                                alt="Product Image"
                              />
                            }
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
                                    e.target.value,
                                  )
                                }
                                className="w-16 text-center py-1 border-t border-b dark:border-gray-600 dark:bg-gray-700"
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

                          <td className="border dark:border-gray-600 px-4 py-2">
                            <input
                              type="number"
                              value={product.discount}
                              onChange={(e) =>
                                handleDiscountChange(
                                  originalIndex,
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                          </td>
                          <td className="border dark:border-gray-600 px-4 text-sm font-semibold py-2 dark:text-gray-400">
                            {(
                              (product.unit_cost || 0) * product.quantity -
                              (product.discount || 0)
                            ).toFixed(2)}
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
                      colSpan={6}
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
                    colSpan={6}
                    className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                  >
                    Subtotal:
                  </td>
                  <td className="px-4 py-2 dark:text-gray-300 text-end">
                    {subtotal.toFixed(2)}
                  </td>
                  <td></td>
                </tr>

                <tr>
                  <td
                    colSpan={6}
                    className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                  >
                    Shipping:
                  </td>
                  <td className="px-4 py-2 dark:text-gray-300 text-end">
                    {shipping.toFixed(2)}
                  </td>
                  <td></td>
                </tr>

                <tr>
                  <td
                    colSpan={6}
                    className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                  >
                    Discount(-):
                  </td>
                  <td className="px-4 py-2 dark:text-gray-300 text-end">
                    {discount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>

                <tr>
                  <td
                    colSpan={6}
                    className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-2 dark:text-gray-300 text-end">
                    {total.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className="mb-8 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 xl:gap-6 md:gap-2">
          <div className="">
            <Input
              label={"Shipping"}
              registerProperty={register("shipping")}
              errorText={errors?.shipping?.message}
              type="number"
              placeholder="Enter your discount"
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
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Supplier"
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
              placeholder="Enter your discount"
            />
            <Input
              label={"Note"}
              registerProperty={register("note")}
              errorText={errors?.note?.message}
              type="textarea"
              placeholder="Enter your discount"
            />
          </div>
          <div className="">
            <Input
              label={"Document"}
              registerProperty={register("document")}
              errorText={errors?.document?.message}
              type="text"
              placeholder="Enter your discount"
            />
          </div>
        </div>

        <div className="flex gap-3 items-end justify-end">
          <Button
            className="bg-gray-400"
            onClick={() => {
              router.push("/admin/purchases");
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className={
              "disabled:bg-gray-400 rounded-m flex justify-center font-medium text-white bg-blue-500 "
            }
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Create"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Page;
