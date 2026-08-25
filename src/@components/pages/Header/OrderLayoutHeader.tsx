import Image from "next/image";
import Link from "next/link";
import Icon from "@/@components/core/Icon/Icon";
import rongonaaLogo from "@/@assets/rongonaLogo/rongonaa.png";

export default function OrderLayoutHeader() {
  return (
    <header className="rongonaa-checkout-header">
      <div className="rongonaa-checkout-header-inner">
        <Link href="/" className="rongonaa-checkout-header-logo">
          <Image
            src={rongonaaLogo}
            alt="Rangonaa"
            width={950}
            height={253}
            className="rongonaa-logo-img rongonaa-logo-img--checkout"
            priority
          />
        </Link>
        <span className="rongonaa-checkout-header-badge">
          <Icon name="lock" size={14} />
          Secure Checkout
        </span>
      </div>
    </header>
  );
}
