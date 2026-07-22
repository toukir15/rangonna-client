"use client";

import ImagePreviewModal from "@/@components/core/ImagePreview/ImagePrevieModal";
import { IReview } from "@/@interfaces/Reviews/reviews.interface";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const formatDateDDMMYYYY = (date: string | Date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()}`;
};

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`text-xl ${
          i <= rating ? "text-yellow-500" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ))}
    <span className="ml-2 text-base font-semibold text-gray-800">
      {rating}.0
    </span>
  </div>
);

export default function ReviewGridCard({ review }: { review: IReview }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };
  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="rounded-xl border border-primary-border bg-white p-5 hover:shadow-md transition flex flex-col">
      <Stars rating={review.rating} />

      {/* Customer Info */}
      <div className="mt-3 flex items-center gap-3">
        {review.customer?.first_name ? (
          <div className="h-10 w-10 rounded-full bg-primary-lighter flex items-center justify-center text-xl font-semibold text-primary">
            {review.customer?.first_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {review.customer?.first_name}
          </p>

          <p className="text-xs text-green-600 font-medium">
            {review.customer ? "Verified Buyer" : null}
          </p>
        </div>
      </div>

      <h3 className="mt-2 text-xl font-bold text-gray-900 leading-snug">
        {review.headline}
      </h3>

      <p className="mt-2 text-base text-gray-700 leading-relaxed line-clamp-5">
        {review.description}
      </p>

      {review.images?.length > 0 && (
        <div className="mt-4 flex gap-3 mb-4">
          {review.images.map((img, i) => (
            <Image
              key={i}
              src={img.src}
              height={100}
              width={100}
              alt={img.alt || "review image"}
              className="h-24 w-24 rounded-lg object-cover border cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (typeof img?.src === "string") handleImageClick(img?.src);
              }}
            />
          ))}
        </div>
      )}

      <div className=" h-px bg-gray-100 mt-auto" />

      <div className="flex items-center gap-3 border border-gray-300 rounded-lg p-1 mt-4">
        {review?.product?.featured_image?.src ? (
          <Image
            src={review?.product?.featured_image?.src}
            alt={review.product.title || "Product image"}
            width={70}
            height={70}
            className="rounded-lg"
          />
        ) : null}

        <div className="min-w-0">
          <p className="truncate text-xs text-gray-500">Reviewed on</p>
          <p className="truncate text-sm font-medium text-gray-800">
            {review?.product?.title}
          </p>
          <div className="border border-gray-300 rounded-lg px-3 py-0.5 mt-1 inline-block text-xs text-primary font-medium hover:bg-primary hover:text-white transition cursor-pointer">
            <Link href={`/product/${review?.product?.product?.slug}`}>
              View
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {review.customer ? "Verified Customer Review" : "Customer Review"}
        </span>
        <span>{formatDateDDMMYYYY(review.createdAt)}</span>
      </div>

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </div>
  );
}
