import React from "react";
import ReceivedOrder from "@/@components/pages/Checkout/ReceivedOrder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | Rongonaa",
};

async function fetchOrderAfterSsl(
  orderId: string,
  valId: string,
): Promise<unknown | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const url = `${base}/sslcommerz/validate?orderId=${encodeURIComponent(orderId)}&val_id=${encodeURIComponent(valId)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { success?: boolean; order?: unknown };
    };
    const data = json?.data;
    if (data?.success && data?.order) return data.order;
  } catch {
    return null;
  }
  return null;
}

function pickParam(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Page = async ({ searchParams }: PageProps) => {
  const sp = await searchParams;
  const orderId = pickParam(sp, "orderId");
  const val_id = pickParam(sp, "val_id");
  const hadSslQuery = Boolean(orderId && val_id);
  const initialOrderFromSsl =
    hadSslQuery && orderId && val_id
      ? await fetchOrderAfterSsl(orderId, val_id)
      : null;

  return (
    <ReceivedOrder
      initialOrderFromSsl={initialOrderFromSsl}
      hadSslQuery={hadSslQuery}
    />
  );
};

export default Page;
