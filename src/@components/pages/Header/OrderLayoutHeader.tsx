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
            alt="Rongonaa"
            width={120}
            height={36}
            className="h-auto w-[96px] sm:w-[108px]"
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
