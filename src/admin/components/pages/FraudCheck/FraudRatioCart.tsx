import { FraudCheckContext } from "@/app/admin/fraud-check/page";
import React, { useContext } from "react";
import { CircularProgressbar } from "react-circular-progressbar";

const FraudRatioCart: React.FC = () => {
  const { ratio } = useContext(FraudCheckContext);
  return (
    <div className="md:w-4/12 border dark:border-gray-500 p-6 rounded-lg dark:bg-gray-700">
      <h2 className="text-4xl font-bold text-center text-blue-900 dark:text-gray-300">
        Fraud
      </h2>
      <p className="mt-5 text-lg text-center font-semibold dark:text-gray-300">
        Delivery Success Ratio
      </p>
      <div className="text-center flex justify-center mt-5">
        <div style={{ width: 120, height: 120 }}>
          <CircularProgressbar value={ratio} text={`${ratio || 0}%`} />
        </div>
      </div>
      <h5 className="text-center mt-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
        {ratio > 90
          ? "Excellent"
          : ratio > 75
          ? "Good"
          : ratio > 60
          ? "Average"
          : "Very Bad"}
      </h5>
      <p className="text-center text-sm mt-4 font-semibold dark:text-gray-300">
        {ratio > 90
          ? "Delivery is very safe."
          : ratio > 75
          ? "Delivery is quite safe, but some precautions should be taken."
          : ratio > 60
          ? "Delivery is moderately safe, caution is advised."
          : "Delivery is not safe, strict precautions are necessary."}
      </p>
    </div>
  );
};

export default FraudRatioCart;
