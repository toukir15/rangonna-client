// import { ENV } from "@/@config/env.config";
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactStrictMode: false,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//         port: "",
//         pathname: "**",
//       },
//       {
//         protocol: "http",
//         hostname: "**",
//         port: "",
//         pathname: "**",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async redirects() {
    return [
      {
        source: "/blog/view/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
      {
        source: "/watches",
        destination: "/churi",
        permanent: true,
      },
      {
        source: "/watches/:path*",
        destination: "/churi/:path*",
        permanent: true,
      },
    ];
  },

  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "naviforce.s3.ap-southeast-1.amazonaws.com",
      //   pathname: "/product/**",
      // },
      {
        protocol: "https",
        hostname: "static-naviforce.sgp1.cdn.digitaloceanspaces.com",
        pathname: "/product/**",
      },
      {
        protocol: "https",
        hostname: "*",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "*",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
