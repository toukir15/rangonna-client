import Image from "next/image";
import rongonaaLogo from "@/@assets/rongonaLogo/rongonaa.png";

const GlobalLoading = () => {
  return (
    <div
      className="rongonaa-global-loading"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="rongonaa-global-loading__stage">
        <div className="rongonaa-global-loading__mark">
          <Image
            src={rongonaaLogo}
            alt="Rangonaa"
            width={240}
            height={64}
            priority
            className="rongonaa-global-loading__logo"
          />
        </div>

        <span
          className="rongonaa-global-loading__spinner"
          aria-hidden="true"
        />
        <p className="rongonaa-global-loading__message">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default GlobalLoading;
