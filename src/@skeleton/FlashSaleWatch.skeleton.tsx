import React from "react";

/** Compact flash-sale grid loader */
const FlashSaleWatch: React.FC = () => {
  return (
    <div className="rongonaa-product-loader" role="status" aria-live="polite">
      <span className="rongonaa-product-loader__spinner" aria-hidden />
      <p className="rongonaa-product-loader__text">Loading products…</p>
    </div>
  );
};

export default FlashSaleWatch;
