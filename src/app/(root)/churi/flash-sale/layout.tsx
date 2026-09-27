import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Flash Sale Churi & Bangles",
  description:
    "Shop today's flash-sale churi and bangles at Rangonaa, with limited offers and delivery across Bangladesh.",
  robots: { index: true, follow: true },
};

export default function FlashSaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
