"use client";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Star } from "lucide-react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import Input from "@admin/components/core/Input/Input";
import MultipleImageUpload from "@admin/components/core/Input/ImageUpload";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import Image from "next/image";
import Icon from "@admin/components/core/Icon/Icon";

const defaultValue: any = {
  rating: 5,
  headline: "",
  description: "",
  reviewImages: [],
  phone: "",
};

const reviewSchema = yup.object({
  rating: yup
    .number()
    .required("Rating is required")
    .min(1, "Minimum 1 star required")
    .max(5, "Maximum 5 stars allowed"),
  headline: yup.string().required("Headline is required"),
  description: yup.string().required("Description is required"),
  reviewImages: yup.array(),
  phone: yup
    .string()
    .required("Phone no is required")
    .transform((v) => v.replace(/[^\d]/g, ""))
    .length(11, "Phone must be exactly 11 digits"),
});

const CreateProductReview = ({ onCancel }: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [orderDetails, setOrderDetails] = useState<any>({ line_items: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(reviewSchema),
    defaultValues: defaultValue,
  });

  const handleRatingClick = (value: number) => {
    setRating(value);
    setValue("rating", value, { shouldValidate: true });
  };

  const formSubmit = async (fromData: any) => {
    if (orderDetails?.line_items[0]?.product_id?._id === undefined) {
      return ToastService.error("Please select a product to review");
    }

    setIsSubmit(true);
    const data = {
      rating: fromData.rating,
      customer_phone: fromData.phone,
      headline: fromData.headline,
      description: fromData.description,
    };

    const formData = new FormData();

    formData.append("data", JSON.stringify(data));

    if (Array.isArray(fromData.reviewImages)) {
      fromData.reviewImages.forEach((img: any) => {
        if (img instanceof File) {
          formData.append("reviewImages", img);
        } else if (img?.file instanceof File) {
          formData.append("reviewImages", img.file);
        }
      });
    }

    try {
      const res = await productService.createReview(
        orderDetails?.line_items[0]?.product_id?._id,
        formData
      );
      if (res?.success) {
        ToastService.success(res.message);
        reset();
        setRating(0);
      } else {
        ToastService.error(res.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleSearchChange = (e: any) => {
    const val = e.target.value;
    setProductSearch(val);
    if (val.length >= 2) fetchProductSearch(val);
    else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const fetchProductSearch = async (val: string) => {
    try {
      const res = await productService.getProductSuggestion({
        searchTerm: val,
      });
      if (res?.success) {
        setFilteredProducts(res.data);
        setShowSuggestions(true);
      } else ToastService.error(res?.message);
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (productSearch.length >= 2) fetchProductSearch(productSearch);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3">
          <div className="md:flex items-start justify-between md:space-x-4">
            <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2">
              Create Review
            </h1>
            <div>
              <div className="mb-3 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={productSearch}
                  onChange={handleSearchChange}
                  placeholder="Search for a product"
                  className="w-96 border rounded-lg p-2 pr-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                  onFocus={() =>
                    productSearch.length >= 2 && setShowSuggestions(true)
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-3 text-gray-400"
                  onClick={handleSearchSubmit}
                >
                  <Icon name="search" variant="outlined" />
                </button>

                {showSuggestions && productSearch.length >= 2 && (
                  <div className="absolute left-0 w-full bg-white border mt-1 rounded-md z-10 max-h-96 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p: any, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                          onClick={() => {
                            setOrderDetails((prev: any) => {
                              const updatedLineItems = [
                                {
                                  title: p.title,
                                  product_id: { _id: p._id },
                                  quantity: 1,
                                  subtotal: p.pricing?.sale_price,
                                  total: p.pricing?.sale_price,
                                  price: p.pricing?.sale_price,
                                  image: p.featured_image?.src || "",
                                },
                              ];

                              return {
                                ...prev,
                                line_items: updatedLineItems,
                              };
                            });

                            setProductSearch("");
                            setFilteredProducts([]);
                            setShowSuggestions(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={p.featured_image?.src}
                              width={40}
                              height={40}
                              alt=""
                              className="rounded"
                            />
                            <span>{p.title}</span>
                          </div>
                          <span className="font-semibold">
                            ৳{p.pricing?.sale_price}
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
          </div>
        </div>
      </NoScrollLayout>
      <div className="md:min-h-[87%] p-4 flex items-center justify-center ">
        <form
          onSubmit={handleSubmit(formSubmit)}
          className="rounded-lg w-[750px] bg-white p-6 shadow"
        >
          <div>
            <div className="space-y-2 mb-4">
              {orderDetails?.line_items?.length
                ? orderDetails.line_items.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b py-2 border rounded-lg p-2 mb-4"
                    >
                      <div className="flex gap-2 items-center">
                        <Icon
                          name={"delete"}
                          className="text-red-600 cursor-pointer"
                          onClick={() =>
                            setOrderDetails((prev: any) => ({
                              ...prev,
                              line_items: prev.line_items.filter(
                                (li: any) =>
                                  li.product_id._id !== item.product_id._id
                              ),
                            }))
                          }
                        />
                        <Image
                          src={item?.image}
                          width={60}
                          height={60}
                          alt=""
                          className="rounded"
                        />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm">৳{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">৳{item.total}</p>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>
          {/* ⭐ Rating */}
          <div className="mb-4">
            <label className="block text-sm  font-bold text-gray-700 -300 mb-1">
              Rating{" "}
              <span className="text-red-400 font-inter text-[18px] font-semibold">
                *
              </span>
            </label>
            <div className="flex space-x-1 mt-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <Star
                  key={val}
                  className={`w-5 h-5 cursor-pointer ${
                    rating >= val
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => handleRatingClick(val)}
                />
              ))}
            </div>
          </div>

          {/* Headline */}
          <Input
            label="Customer Phone No"
            type="text"
            registerProperty={register("phone")}
            errorText={errors?.phone?.message}
            isRequired
            placeholder="Enter customer phone no"
          />
          <Input
            label="Headline"
            type="text"
            registerProperty={register("headline")}
            errorText={errors?.headline?.message}
            isRequired
            placeholder="Enter headline"
            noMargin
          />

          {/* Description */}
          <Input
            label="Description"
            type="textarea"
            registerProperty={register("description")}
            errorText={errors?.description?.message}
            isRequired
            placeholder="Enter review description"
          />

          {/* Images */}
          <div className="">
            <Controller
              control={control}
              name="reviewImages"
              render={({ field: { onChange, value } }) => (
                <MultipleImageUpload
                  onChange={onChange}
                  value={value}
                  label="Review Images"
                  height="h-40"
                />
              )}
            />
            {errors.productImages && (
              <p className="text-red-500 text-sm">
                {errors.productImages.message as string}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              className="px-4 py-2 text-sm text-gray-700 cursor-pointer"
              onClick={() => {
                reset();
                setRating(0);
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded cursor-pointer"
              disabled={isSubmit}
            >
              {isSubmit ? <ButtonLoader /> : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};
export default CreateProductReview;
