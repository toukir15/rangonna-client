"use client";
import { useEffect, useState } from "react";
import ProductReview from "../core/Carousal/ProductReview";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";

export default function Reviews({ landingData }: any) {
  const [reviewData, setReviewData] = useState<any>();

  useEffect(() => {
    if (landingData?.products[0]?._id) {
      fetchReviewData();
    }
  }, [landingData?.products[0]?._id]);

  const fetchReviewData = () => {
    ProductService.getReview(landingData?.products[0]?._id)
      .then((res: any) => {
        if (res?.success) {
          setReviewData(res?.data?.data);
          // setReviewDataLength(res?.data?.meta?.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };
  return (
    <div className="bg-gray-100 py-4">
      <div className="max-w-layout mx-auto ">
        <div className="relative">
          <ProductReview reviews={reviewData} />
        </div>
      </div>
    </div>
  );
}
