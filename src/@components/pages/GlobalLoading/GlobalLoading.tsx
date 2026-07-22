import Image from "next/image";
import rongonaaLogo from "@/@assets/rongonaLogo/rongonaa.png";

const GlobalLoading = () => {
  return (
    <div
      className="rongonaa-global-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading Rongonaa"
    >
      <div className="rongonaa-global-loading__glow" aria-hidden="true" />

      <div className="rongonaa-global-loading__card">
        <div className="rongonaa-global-loading__shimmer" aria-hidden="true" />

        <div className="rongonaa-global-loading__logo-wrap">
          <Image
            src={rongonaaLogo}
            alt="Rongonaa"
            width={120}
            height={36}
            priority
            className="h-auto w-[96px] sm:w-[108px]"
          />
        </div>

        <div className="rongonaa-global-loading__rings" aria-hidden="true">
          <span className="rongonaa-global-loading__ring rongonaa-global-loading__ring--outer" />
          <span className="rongonaa-global-loading__ring rongonaa-global-loading__ring--mid" />
          <span className="rongonaa-global-loading__ring rongonaa-global-loading__ring--inner" />
          <span className="rongonaa-global-loading__core" />
        </div>

        <p className="rongonaa-global-loading__brand">Rongonaa</p>
        <p className="rongonaa-global-loading__message">
          লোড হচ্ছে
          <span className="rongonaa-global-loading__dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>

        <div className="rongonaa-global-loading__track" aria-hidden="true">
          <div className="rongonaa-global-loading__track-fill" />
        </div>
      </div>
    </div>
  );
};

export default GlobalLoading;
