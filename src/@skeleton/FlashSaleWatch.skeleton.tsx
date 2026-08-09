import React from "react";

const FlashSaleWatch: React.FC = () => {
  const cards = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="rongonaa-flash-sale__grid rongonaa-skel-grid" aria-hidden="true">
      {cards.map((id) => (
        <article key={id} className="rongonaa-skel-card">
          <div className="rongonaa-skel-card__media" />
          <div className="rongonaa-skel-card__body">
            <div className="rongonaa-skel-line rongonaa-skel-line--title" />
            <div className="rongonaa-skel-line rongonaa-skel-line--sub" />
            <div className="rongonaa-skel-line rongonaa-skel-line--price" />
            <div className="rongonaa-skel-actions">
              <div className="rongonaa-skel-btn" />
              <div className="rongonaa-skel-btn rongonaa-skel-btn--cta" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FlashSaleWatch;
