import { ENV } from "@/@config/env.config";

export const SITE_NAME = "Rangonaa";

const rawOrigin =
  typeof ENV.APP_URL === "string" ? ENV.APP_URL.trim() : "";

export const SITE_ORIGIN = (rawOrigin || "https://rangonaa.com").replace(
  /\/+$/,
  "",
);

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized}`;
}
