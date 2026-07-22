import React from "react";

interface ProgressBarProps {
  value: number;
  totalCount: number;
  stars: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  totalCount,
  value,
  stars,
}) => {
  const percentage = totalCount > 0 ? (value / totalCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-full bg-primary-lighter rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
