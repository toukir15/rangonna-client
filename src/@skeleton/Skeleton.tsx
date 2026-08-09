import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonProps {
  type: "text" | "avatar" | "card";
  count?: number;
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  baseColor?: string;
  highlightColor?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({
  type,
  count = 1,
  height,
  width,
  circle,
  baseColor = "#efe8e2",
  highlightColor = "#f8f3ef",
  className,
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "text":
        return (
          <Skeleton
            count={count}
            height={height || 20}
            width={width || "100%"}
            baseColor={baseColor}
            className={className}
            highlightColor={highlightColor}
          />
        );
      case "avatar":
        return (
          <Skeleton
            circle={circle || true}
            height={height || 50}
            width={width || 50}
            baseColor={baseColor}
            highlightColor={highlightColor}
          />
        );
      case "card":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              width: width || "100%",
            }}
          >
            <Skeleton
              height={20}
              width="40%"
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return <div>{renderSkeleton()}</div>;
};

export default LoadingSkeleton;
