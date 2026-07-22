import Image, { StaticImageData } from "next/image";
import { HandCoins } from "lucide-react";
import bkashLogo from "@/@assets/payments/bkash-logo.png";
import sslLogo from "@/@assets/payments/sslcommerz-logo.png";

export const PAYMENT_METHOD_LOGOS: Record<string, StaticImageData | null> = {
  "cash on delivery": null,
  "pay on bkash": bkashLogo,
  "pay with sslcommerz": sslLogo,
};

export function CashOnDeliveryLogo() {
  return (
    <HandCoins
      className="h-8 w-8 shrink-0 text-emerald-600"
      strokeWidth={2}
      aria-hidden
    />
  );
}

export function PaymentMethodLogoImage({
  value,
  label,
  className = "h-7 w-auto max-w-[8rem] object-contain",
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const logo = PAYMENT_METHOD_LOGOS[value];

  if (!logo) return null;

  return (
    <Image
      src={logo}
      alt={label}
      width={logo.width}
      height={logo.height}
      className={className}
      priority
      fetchPriority="high"
      loading="eager"
      sizes="128px"
      decoding="async"
    />
  );
}

export function getPaymentMethodLabelContent(value: string, label: string) {
  if (value === "pay on bkash") {
    return (
      <span className="flex items-center gap-1.5">
        <span>Pay On</span>
        <PaymentMethodLogoImage value={value} label="bKash" />
      </span>
    );
  }

  if (value === "pay with sslcommerz") {
    return (
      <span className="flex items-center gap-1.5">
        <span>Pay With</span>
        <PaymentMethodLogoImage value={value} label="SSLCommerz" />
      </span>
    );
  }

  if (value === "cash on delivery") {
    return (
      <span className="flex items-center gap-1.5">
        <CashOnDeliveryLogo />
        <span>{label}</span>
      </span>
    );
  }

  return <span>{label}</span>;
}
