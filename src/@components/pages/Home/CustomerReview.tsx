import reviewImageOne from "@/@assets/review/review poster 3.jpg";
import reviewImageTwo from "@/@assets/review/review poster 2.jpg";
import reviewImageThree from "@/@assets/review/review poster 10.jpg";
import reviewImageFour from "@/@assets/review/review poster 24.jpg";
import reviewImageFive from "@/@assets/review/review poster 26.jpg";
import reviewImageSix from "@/@assets/review/review poster 28.jpg";
import reviewImageSave from "@/@assets/review/review poster 4.jpg";
import reviewImageEight from "@/@assets/review/review poster 5.jpg";
import reviewImageNine from "@/@assets/review/review poster 6.jpg";
import reviewImageTen from "@/@assets/review/review poster 2.jpg";
import reviewImageEliven from "@/@assets/review/review poster 2.jpg";
import React from "react";
import { CoverCarousel } from "@/@components/core/Carousal/Carousal";
interface Review {
  id: number;
  name: string;
  comment: string;
  img: any;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "John Doe",
    comment: "Great service and excellent support! Hig",
    img: reviewImageOne,
  },
  {
    id: 2,
    name: "Jane Smith",
    comment: "The product is amazing and worth eve.",
    img: reviewImageTwo,
  },
  {
    id: 3,
    name: "Alice Johnson",
    comment: "Very satisfied with the quality and delivery.",
    img: reviewImageThree,
  },
  {
    id: 4,
    name: "Bob Brown",
    comment: "Fantastic experience from start to finish.",
    img: reviewImageFour,
  },
  {
    id: 5,
    name: "Charlie Davis",
    comment: "Excellent customer service and fast delivery.",
    img: reviewImageFive,
  },
  {
    id: 6,
    name: "John Doe",
    comment: "Great service and excellent support! Hig",
    img: reviewImageSix,
  },
  {
    id: 7,
    name: "Jane Smith",
    comment: "The product is amazing and worth eve.",
    img: reviewImageSave,
  },
  {
    id: 8,
    name: "Alice Johnson",
    comment: "Very satisfied with the quality and delivery.",
    img: reviewImageEight,
  },
  {
    id: 9,
    name: "Bob Brown",
    comment: "Fantastic experience from start to finish.",
    img: reviewImageNine,
  },
  {
    id: 10,
    name: "Charlie Davis",
    comment: "Excellent customer service and fast delivery.",
    img: reviewImageTen,
  },
  {
    id: 11,
    name: "John Doe",
    comment: "Great service and excellent support! Hig",
    img: reviewImageEliven,
  },
];

const CustomerReview: React.FC = () => {
  return (
    <div className="max-w-layout mx-auto mt-4">
      <h1 className="text-3xl font-bold text-center premium-section-title py-3 rounded-lg">
        Customer Reviews
      </h1>
      <div className="md:h-[640px] sm:h-[460px] ">
        <CoverCarousel
          reviews={reviews}
          autoplayMs={6000}
          depth={140}
          visibleRange={1}
        />
      </div>
    </div>
  );
};

export default CustomerReview;
