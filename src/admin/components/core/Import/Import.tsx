import React from "react";

interface ProgressSpinnerProps {
  page: number;
  totalPage: number;
}

const ProgressSpinner = ({ page, totalPage }: ProgressSpinnerProps) => {
  const progress =
    totalPage > 0 ? Math.min(Math.max(0, (page / totalPage) * 100), 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/50 to-black/40 backdrop-blur-[2px] bg-opacity-60 flex items-center justify-center z-50">
      <div className="relative flex flex-col items-center">
        <div className="w-24 h-24 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={`${
                page > 0 && totalPage > 0 ? "text-green-600" : "text-white"
              } transition-all duration-300 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference.toString()}
              strokeDashoffset={strokeDashoffset.toString()}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>

        <div className="text-white font-bold absolute top-9 text-center">
          {Math.round(progress)}%
        </div>
        {page > 0 && totalPage > 0 && (
          <div className="text-white text-sm">
            Order {page} of {totalPage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressSpinner;
