import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/@config/site";

const disallowPaths = [
  "/api/",
  "/admin",
  "/404",
  "/500",
  "/search",
  "/checkout",
  "/cart",
  "/my-account",
  "/payment",
  "/verifications",
  "/received-order",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      {
        userAgent: ["PerplexityBot", "Bytespider", "Diffbot"],
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPaths,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
