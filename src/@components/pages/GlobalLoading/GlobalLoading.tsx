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
      <div className="rongonaa-global-loading__atmosphere" aria-hidden="true">
        <span className="rongonaa-global-loading__orb rongonaa-global-loading__orb--a" />
        <span className="rongonaa-global-loading__orb rongonaa-global-loading__orb--b" />
        <span className="rongonaa-global-loading__orb rongonaa-global-loading__orb--c" />
        <span className="rongonaa-global-loading__grain" />
      </div>

      <div className="rongonaa-global-loading__stage">
        <div className="rongonaa-global-loading__bangles" aria-hidden="true">
          <span className="rongonaa-global-loading__bangle rongonaa-global-loading__bangle--1" />
          <span className="rongonaa-global-loading__bangle rongonaa-global-loading__bangle--2" />
          <span className="rongonaa-global-loading__bangle rongonaa-global-loading__bangle--3" />
          <span className="rongonaa-global-loading__bangle rongonaa-global-loading__bangle--4" />
          <span className="rongonaa-global-loading__sparkle rongonaa-global-loading__sparkle--1" />
          <span className="rongonaa-global-loading__sparkle rongonaa-global-loading__sparkle--2" />
          <span className="rongonaa-global-loading__sparkle rongonaa-global-loading__sparkle--3" />
        </div>

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

        <p className="rongonaa-global-loading__eyebrow">Quiet luxury</p>
        <p className="rongonaa-global-loading__message">
          Curating your churi
          <span className="rongonaa-global-loading__dots" aria-hidden="true">
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
