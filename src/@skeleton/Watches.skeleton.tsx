import React from "react";

/** Compact product-grid loader — replaces heavy skeleton cards */
const WatchSkeleton: React.FC = () => {
  return (
    <div className="rongonaa-product-loader" role="status" aria-live="polite">
      <span className="rongonaa-product-loader__spinner" aria-hidden />
      <p className="rongonaa-product-loader__text">Loading products…</p>
    </div>
  );
};

export default WatchSkeleton;
