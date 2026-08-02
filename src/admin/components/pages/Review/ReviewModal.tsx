"use client";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useRef } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ProductReviewContext } from "@/app/admin/product/reviews/page";
import MultipleImageUpload, {
  GalleryItem,
} from "@admin/components/core/Input/ImageUpload";
import Image from "next/image";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { Star } from "lucide-react";
import { toAbsolute } from "@/app/admin/product/products/edit/[eId]/page";

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

const ReviewModal = () => {
  const { modalMode, items, setIsModalOpen, fetchProductReview, isModalOpen } =
    useContext(ProductReviewContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [orderDetails, setOrderDetails] = useState<any>([]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
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

  const initialGallery: any[] = (items?.images || []).map((im: any) => ({
    isExisting: true,
    src: toAbsolute(im?.src),
    name: im?.title || "",
    id: im?._id,
    previewUrl: toAbsolute(im?.src),
  }));

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        rating: items?.rating || 5,
        headline: items?.headline || "",
        description: items?.description || "",
        phone: items?.customer?.phone || "",
        reviewImages: initialGallery,
      });
      setRating(items?.rating || 5);

      if (items?.product) {
        setOrderDetails({
          line_items: [
            {
              title: items.product?.title,
              product_id: { _id: items.product?._id },
              sku:
                items.product?.variants?.[0]?.sku || items.product?.sku || "",
              size: items.product?.variants?.[0]?.size || "",
              quantity: 1,
              subtotal: items.product?.pricing?.sale_price,
              total: items.product?.pricing?.sale_price,
              price: items.product?.pricing?.sale_price,
              image: items.product?.featured_image?.src,
            },
          ],
        });
      }
    } else {
      reset(defaultValue);
      setOrderDetails({ line_items: [] });
      setRating(5);
    }
  }, [modalMode, items, reset]);

  // ✅ Updated formSubmit (new + existing image handling)
  const formSubmit = async (fromData: any) => {
    if (orderDetails?.line_items[0]?.product_id?._id === undefined) {
      return ToastService.error("Please select a product to review");
    }

    setIsSubmit(true);

    const data: any = {
      rating: fromData.rating,
      customer_phone: fromData.phone,
      headline: fromData.headline,
      description: fromData.description,
    };

    const formData = new FormData();

    // 🖼️ Review image গুলো থেকে নতুন ও পুরোনো আলাদা করা
    const itemsList: GalleryItem[] = fromData.reviewImages || [];

    // নতুন আপলোড ইমেজ
    itemsList.forEach((it) => {
      if (!("isExisting" in it) || it.isExisting === false) {
        const f = (it as any).file;
        if (f instanceof File) {
          formData.append("reviewImages", f);
        }
      }
    });

    // পুরোনো ইমেজ src গুলো
    const existingSrc = itemsList
      .filter((it) => "isExisting" in it && it.isExisting)
      .map((it: any) => toAbsolute(it.src));

    const allPrevSrc =
      (items?.images || []).map((im: any) => toAbsolute(im?.src)) || [];

    data.remove_review_images = allPrevSrc.filter(
      (src: string) => !existingSrc.includes(src)
    );

    formData.append("data", JSON.stringify(data));

    try {
      let res;
      if (modalMode === "Edit" && items?._id) {
        res = await productService.updateProductReview(items._id, formData);
      } else {
        res = await productService.createReview(
          orderDetails?.line_items[0]?.product_id?._id,
          formData
        );
      }

      if (res?.success) {
        ToastService.success(res.message);
        setIsModalOpen(false);
        fetchProductReview();
        reset();
        setOrderDetails([]);
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
      const res = await productService.getPurchaseProductSuggestion({
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
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {modalMode === "Edit"
              ? "Edit Product Review"
              : "Create Product Review"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          {/* 🔍 Product Search */}
          <div className="mb-3 relative">
            <input
              ref={inputRef}
              type="text"
              value={productSearch}
              onChange={handleSearchChange}
              placeholder="Search for a product"
              className="w-full border rounded-lg p-2 pr-10 dark:bg-gray-700 dark:text-gray-300"
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
              <div className="absolute left-0 w-full bg-white dark:bg-gray-600 dark:border-gray-500 border mt-1 rounded-md z-10 max-h-96 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p: any, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-500 flex justify-between items-center cursor-pointer"
                      onClick={() => {
                        setOrderDetails({
                          line_items: [
                            {
                              title: p.title,
                              product_id: { _id: p._id },
                              sku: p.variants?.[0]?.sku || p.sku || "",
                              size: p.variants?.[0]?.size || "",
                              quantity: 1,
                              subtotal: p.pricing?.sale_price,
                              total: p.pricing?.sale_price,
                              price: p.pricing?.sale_price,
                              image: p.featured_image?.src || "",
                            },
                          ],
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
                        <span className="dark:text-gray-300">{p.title}</span>
                      </div>
                      <span className="font-semibold dark:text-gray-300 ">
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

          {/* Selected Product */}
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
                    <p className="font-medium dark:text-gray-300">
                      {item.title}
                    </p>
                    <p className="text-sm dark:text-gray-300">
                      ৳{item.price}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold dark:text-gray-300">
                    ৳{item.total}
                  </p>
                </div>
              </div>
            ))
            : null}

          {/* ⭐ Rating */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1 dark:text-gray-300">
              Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex space-x-1 mt-3">
              {[1, 2, 3, 4, 5].map((val) => (
                <Star
                  key={val}
                  className={`w-5 h-5 cursor-pointer ${rating >= val
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                    }`}
                  onClick={() => handleRatingClick(val)}
                />
              ))}
            </div>
          </div>

          {/* Inputs */}
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
          <Input
            label="Description"
            type="textarea"
            registerProperty={register("description")}
            errorText={errors?.description?.message}
            isRequired
            placeholder="Enter review description"
          />

          {/* 🖼️ Images */}
          <Controller
            control={control}
            name="reviewImages"
            render={({ field: { onChange, value } }) => (
              <MultipleImageUpload
                value={(value as GalleryItem[]) || []}
                onChange={onChange}
                label="Review Images"
                maxImages={4}
                height="h-40"
              />
            )}
          />
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ReviewModal;
