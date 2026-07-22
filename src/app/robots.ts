import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const disallowPaths = [
    "/api/",
    "/404",
    "/500",
    "/search",
    "/checkout",
    "/cart",
    "/verifications",
    "/received-order",
  ];

  return {
    rules: [
      // 🤖 GPTBot
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: disallowPaths,
      },

      // 🤖 ChatGPT-User
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: disallowPaths,
      },

      // ❌ CCBot block
      {
        userAgent: "CCBot",
        disallow: "/",
      },

      // 🤖 Anthropic bots
      {
        userAgent: ["anthropic-ai", "Claude-Web", "Google-Extended"],
        allow: "/",
        disallow: disallowPaths,
      },

      // ❌ Blocked bots
      {
        userAgent: ["PerplexityBot", "Bytespider", "Diffbot"],
        disallow: "/",
      },

      // 🤖 FacebookBot
      {
        userAgent: "FacebookBot",
        allow: "/",
        disallow: disallowPaths,
      },

      // 🔍 Googlebot
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: disallowPaths,
      },

      // 🔍 Bingbot
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: disallowPaths,
      },

      // 🌍 Default সকল bot
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPaths,
      },
    ],

    sitemap: [
      "https://api.naviforce.com.bd/api/v1/sitemap/naviforce/sitemap-index.xml",
    ],
  };
}
