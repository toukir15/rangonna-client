import { FraudCheckContext } from "@/app/admin/fraud-check/page";
import React, { useContext } from "react";

const FraudSummaryCart: React.FC = () => {
  const { totalOrder } = useContext(FraudCheckContext);
  return (
    <div className="flex items-center justify-between gap-3 mt-4">
      {[
        {
          label: "Total",
          value: totalOrder?.total_parcel,
          bg: "from-blue-400 to-blue-700",
        },
        {
          label: "Delivery",
          value: totalOrder?.total_delivery,
          bg: "from-green-500 to-green-800",
        },
        {
          label: "Return",
          value: totalOrder?.total_return,
          bg: "from-red-400 to-red-600",
        },
      ]?.map(({ label, value, bg }, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-r ${bg} p-3 text-white shadow-lg rounded-lg min-w-28`}
        >
          <h4 className="text-center text-lg font-semibold">{value || 0}</h4>
          <h6 className="text-center mt-1 text-lg font-semibold">{label}</h6>
        </div>
      ))}
    </div>
  );
};

export default FraudSummaryCart;
