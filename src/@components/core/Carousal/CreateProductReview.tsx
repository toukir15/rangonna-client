"use client";
import React, { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastService } from "@/utils/toaster.service";
import Input from "../Input/Input";
import Button from "../Button/Button";
import ButtonLoader from "../Button/ButtonLoader";
import { Star } from "lucide-react";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import { ProductService } from "@/@services/apis/Product/Product.service";
import MultipleImageUpload from "../Input/ImageUpload";

const defaultValue: any = {
  rating: 5,
  headline: "",
  description: "",
  reviewImages: [],
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
});

const CreateProductReview = ({ productId, onCancel, fetchReviewData }: any) => {
  const { userInfo } = useContext(GlobalContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);

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
    setIsSubmit(true);
    const data = {
      rating: fromData.rating,
      customer: userInfo?._id,
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
      const res = await ProductService.createReview(productId, formData);
      if (res?.success) {
        ToastService.success(res.message);
        fetchReviewData();
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

  return (
    <form onSubmit={handleSubmit(formSubmit)} className=" rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl text-gray-900  font-bold">Create New Review</h3>
      </div>

      {/* ⭐ Rating */}
      <div className="mb-4">
        <label className="block text-sm  font-bold text-gray-700 -300 mb-1">
          Rating{" "}
          <span className="text-danger font-inter text-[18px] font-semibold">
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
            />
          )}
        />
        {errors.productImages && (
          <p className="text-danger text-sm">
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
  );
};

export default CreateProductReview;
