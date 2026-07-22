import { NextRequest, NextResponse } from "next/server";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

const BAD_HOSTS = new Set(["0.0.0.0", "[::]", "::"]);

function isBadHost(host: string): boolean {
  return BAD_HOSTS.has(host);
}

/**
 * bKash hits /bkash-callback on the same host the browser used. If Next binds to 0.0.0.0,
 * req.nextUrl.origin becomes "http://0.0.0.0:3000" which is not a valid browser address.
 * Prefer public env, then proxy headers, then map 0.0.0.0 -> localhost/127.0.0.1.
 */
function getFrontendOrigin(req: NextRequest): string {
  const tryParseUrl = (raw: string): string | null => {
    const t = raw.trim();
    if (!t) return null;
    try {
      const o = new URL(t);
      if (isBadHost(o.hostname)) return null;
      return o.origin;
    } catch {
      try {
        const o = new URL(t.startsWith("http") ? t : `https://${t}`);
        if (isBadHost(o.hostname)) return null;
        return o.origin;
      } catch {
        return null;
      }
    }
  };

  const envOrigin =
    tryParseUrl(process.env.NEXT_PUBLIC_APP_URL || "") ||
    tryParseUrl(process.env.FRONTEND_URL || "");
  if (envOrigin) return envOrigin;

  const xfHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = req.headers.get("host")?.split(",")[0]?.trim();
  const host = xfHost || hostHeader;
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (req.nextUrl.protocol === "https:" ? "https" : "http");

  if (host) {
    try {
      const u = new URL(`${proto}://${host}`);
      if (!isBadHost(u.hostname)) {
        return u.origin;
      }
    } catch {
      /* fall through */
    }
  }

  const nu = req.nextUrl;
  if (isBadHost(nu.hostname)) {
    const port = nu.port || "3000";
    return `http://127.0.0.1:${port}`;
  }
  return nu.origin;
}

function pickSearchParam(
  sp: URLSearchParams,
  key: string,
): string | undefined {
  const v = sp.get(key);
  return v && v.length > 0 ? v : undefined;
}

async function readBkashPayload(req: NextRequest): Promise<{
  orderId?: string;
  paymentID?: string;
  status?: string;
  signature?: string;
}> {
  const fromQuery = () => {
    const sp = req.nextUrl.searchParams;
    return {
      orderId: pickSearchParam(sp, "orderId"),
      paymentID: pickSearchParam(sp, "paymentID"),
      status: pickSearchParam(sp, "status"),
      signature: pickSearchParam(sp, "signature"),
    };
  };

  if (req.method === "GET") {
    return fromQuery();
  }

  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      const body = (await req.json()) as Record<string, string | undefined>;
      return {
        orderId: body.orderId,
        paymentID: body.paymentID,
        status: body.status,
        signature: body.signature,
      };
    } catch {
      return fromQuery();
    }
  }

  if (
    ct.includes("application/x-www-form-urlencoded") ||
    ct.includes("multipart/form-data")
  ) {
    try {
      const form = await req.formData();
      const get = (k: string) => {
        const v = form.get(k);
        return typeof v === "string" ? v : undefined;
      };
      return {
        orderId: get("orderId") ?? get("order_id"),
        paymentID: get("paymentID") ?? get("payment_id"),
        status: get("status"),
        signature: get("signature"),
      };
    } catch {
      return fromQuery();
    }
  }

  return fromQuery();
}

async function executeBkashOnApi(payload: {
  orderId: string;
  paymentID: string;
  status: string;
  signature?: string;
}) {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!base) return { ok: false as const, order: null };
  const res = await fetch(`${base}/bkash/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { order?: unknown };
  };
  if (!res.ok || !json?.success || !json?.data?.order) {
    return { ok: false as const, order: null };
  }
  return { ok: true as const, order: json.data.order };
}

function redirectTo(
  req: NextRequest,
  path: string,
  orderCookie?: string,
): NextResponse {
  const url = new URL(path, getFrontendOrigin(req));
  const res = NextResponse.redirect(url);
  if (orderCookie) {
    res.cookies.set("orderedData", orderCookie, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    });
  }
  return res;
}

async function handleBkashCallback(req: NextRequest) {
  const { orderId, paymentID, status, signature } =
    await readBkashPayload(req);

  if (status !== "success" || !orderId || !paymentID) {
    return redirectTo(req, "/payment/failed");
  }

  const { ok, order } = await executeBkashOnApi({
    orderId,
    paymentID,
    status,
    signature: signature ?? "",
  });

  if (!ok || !order) {
    return redirectTo(req, "/payment/failed");
  }

  return redirectTo(
    req,
    "/checkout/received-order",
    JSON.stringify(order),
  );
}

export async function GET(req: NextRequest) {
  return handleBkashCallback(req);
}

export async function POST(req: NextRequest) {
  return handleBkashCallback(req);
}
