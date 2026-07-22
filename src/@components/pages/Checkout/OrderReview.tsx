import React from "react";
import OrderCarousal from "@/@components/core/Carousal/OrderCarousal";
import { reviews } from "@/utils/data";

const OrderReview: React.FC = () => {
  return (
    <div className="App  max-w-layout mx-auto">
      <OrderCarousal reviews={reviews} />
    </div>
  );
};

export default OrderReview;
