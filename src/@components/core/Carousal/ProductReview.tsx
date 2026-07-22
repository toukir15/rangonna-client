"use client";
import Icon from "@/@components/core/Icon/Icon";
import { formatTimeAgo, trimString } from "@/utils";
import Image from "next/image";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ImagePreviewModal from "../ImagePreview/ImagePrevieModal";

export interface IReviewImage {
  src: string;
  title: string;
  alt: string;
}

export interface IReviewCustomer {
  _id: string;
  first_name: string;
  last_name: string;
}

export interface IProductReview {
  _id: string;
  customer: IReviewCustomer;
  product: string;
  headline: string;
  description: string;
  ratting: number;
  images: IReviewImage[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ReviewCarouselProps {
  reviews: IProductReview[];
  intervalMs?: number;
}

const ProductReview: React.FC<ReviewCarouselProps> = ({
  reviews = [],
  intervalMs = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerW, setContainerW] = useState(0);
  const [cardW, setCardW] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    if (!reviews?.length || paused) return;
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % reviews.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [reviews?.length ?? 0, intervalMs, paused]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth);
      if (firstCardRef.current) setCardW(firstCardRef.current.clientWidth);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (firstCardRef.current) ro.observe(firstCardRef.current);
    if (containerRef.current) setContainerW(containerRef.current.clientWidth);
    if (firstCardRef.current) setCardW(firstCardRef.current.clientWidth);
    return () => ro.disconnect();
  }, []);

  const translateX = useMemo(() => {
    if (!reviews?.length || !cardW || !containerW) return 0;
    const trackW = reviews.length * cardW;
    const ideal = currentIndex * cardW - (containerW - cardW) / 2;
    const min = 0;
    const max = Math.max(trackW - containerW, 0);
    return Math.min(Math.max(ideal, min), max);
  }, [currentIndex, cardW, containerW, reviews?.length ?? 0]);

  const goToNext = () => setCurrentIndex((i) => (i + 1) % reviews.length);
  const goToPrevious = () =>
    setCurrentIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const goToIndex = (idx: number) => setCurrentIndex(idx);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);
  const handleTouchStart = () => setPaused(true);
  const handleTouchEnd = () => setPaused(false);
  const handleTouchCancel = () => setPaused(false);

  return (
    <div
      ref={containerRef}
      className=" w-full h-auto mx-auto overflow-hidden pb-10 "
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out "
        style={{
          transform: `translate3d(-${translateX}px, 0, 0)`,
          width: reviews.length ? reviews.length * cardW || "auto" : "auto",
        }}
      >
        {reviews.map((review: IProductReview, idx) => (
          <div
            key={review._id ?? idx}
            ref={idx === 0 ? firstCardRef : undefined}
            className="md:w-96 w-80  flex-shrink-0 pt-2 px-2 "
          >
            <div className=" p-4 rounded-lg shadow-md border min-h-72 bg-green-50 border-green-600">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex">
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                  <Icon name="star" className="text-yellow-500" size={20} />
                </div>
                <p className="font-normal text-gray-500 text-sm">
                  {formatTimeAgo(review?.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <div className="border border-gray-300 shadow-md font-bold rounded-full h-12 w-12 flex items-center justify-center bg-primary text-white mt-2.5">
                  <p>
                    {review?.customer?.first_name?.[0]?.toUpperCase() || "A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-start">
                    {review?.customer?.first_name}
                  </h3>
                  <div className="text-xs bg-green-600 text-white font-bold rounded-lg px-2 py-0.5 flex items-center gap-1">
                    <Icon name="check" size={18} className="font-bold" />
                    Verified Buyer
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <h2 className="font-bold text-lg">{review?.headline}</h2>

                <p className="text-gray-600 italic mt-2">
                  {trimString(review?.description, 180)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {review.images.map((image, index) => {
                  return (
                    <Image
                      key={index}
                      src={image?.src}
                      alt="Review image"
                      width={240}
                      height={240}
                      sizes="(max-width: 640px) 50vw,
           (max-width: 1024px) 50vw,
           25vw"
                      loading="lazy"
                      className="rounded-md h-40 w-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof image?.src === "string")
                          handleImageClick(image?.src);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        className="absolute cursor-pointer text-center top-1/2 w-10 -left-5 -translate-y-1/2 bg-white border border-gray-300 text-gray-500/80 p-2 rounded-full hover:bg-gray-50"
        onClick={goToPrevious}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        &#10094;
      </button>

      <button
        type="button"
        aria-label="Next"
        className="absolute cursor-pointer text-center top-1/2 w-10 -right-5 -translate-y-1/2 bg-white border border-gray-300 text-gray-500/80 p-2 rounded-full hover:bg-gray-50"
        onClick={goToNext}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        &#10095;
      </button>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-2">
        {reviews.map((_, index) => (
          <div
            key={index}
            aria-label={`Go to ${index + 1}`}
            className={`w-3 h-1.5 rounded-full cursor-pointer ${
              index === currentIndex ? "bg-primary" : "bg-primary-lighter"
            }`}
            onClick={() => goToIndex(index)}
            onMouseDown={() => setPaused(true)}
            onMouseUp={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          />
        ))}
      </div>

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default ProductReview;
