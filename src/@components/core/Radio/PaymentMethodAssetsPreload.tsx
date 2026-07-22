import { preload } from "react-dom";
import bkashLogo from "@/@assets/payments/bkash-logo.png";
import sslLogo from "@/@assets/payments/sslcommerz-logo.png";

export default function PaymentMethodAssetsPreload() {
  preload(bkashLogo.src, { as: "image" });
  preload(sslLogo.src, { as: "image" });

  return null;
}
