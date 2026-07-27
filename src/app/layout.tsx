import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito, Poppins, Inter } from "next/font/google";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "./globals.css";
import "material-icons/iconfont/material-icons.css";
import { GoogleTagManager } from "@next/third-parties/google";
import { ENV } from "@/@config/env.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

// Normalize a safe canonical URL so Next.js doesn't receive invalid values like "null"
const CANONICAL_URL =
  ENV.APP_URL && typeof ENV.APP_URL === "string" && ENV.APP_URL.trim() !== ""
    ? ENV.APP_URL
    : "http://localhost:3000";

export const metadata: Metadata = {
  title: "Naviforce Watch Bangladesh",
  description:
    "Find Best Naviforce Watch Price in Bangladesh at Naviforce Bangladesh. Buy Naviforce Watch price in BD with Official Warranty.",
  alternates: { canonical: CANONICAL_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Naviforce Watch Bangladesh",
    description:
      "Find Best Naviforce Watch Price in Bangladesh at Naviforce Bangladesh. Buy Naviforce Watch price in BD with Official Warranty.",
    siteName: "Naviforce Bangladesh",
    type: "website",
    url: "https://Naviforce.com.bd",
    images: [
      {
        url: "https://static-naviforce.sgp1.cdn.digitaloceanspaces.com/NaviforceLogo.jpg",
        width: 200,
        height: 200,
        alt: "Naviforce Logo",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naviforce Watch Bangladesh",
    description:
      "Find Best Naviforce Watch Price in Bangladesh at Naviforce Bangladesh. Buy Naviforce Watch price in BD with Official Warranty.",
    images: [
      {
        url: "https://static-naviforce.sgp1.cdn.digitaloceanspaces.com/NaviforceLogo.jpg",
        width: 200,
        height: 200,
        alt: "Naviforce Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Naviforce Bangladesh",
    url: CANONICAL_URL,
    image: `https://static-naviforce.sgp1.cdn.digitaloceanspaces.com/NaviforceLogo.jpg`,
    description:
      "Find Best Naviforce Watch Price in Bangladesh at Naviforce Bangladesh. Buy Naviforce Watch price in BD with Official Warranty.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Majumder House (5th Floor) 39, Purana Paltan.",
      addressLocality: "Dhaka",
      addressRegion: "Dhaka",
      postalCode: "1000",
      addressCountry: "BD",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+8801805049380",
      contactType: "customer service",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#7a3356" media="(max-width: 768px)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"){document.documentElement.classList.add("dark");}else{document.documentElement.classList.remove("dark");}}catch(e){}})();`,
          }}
        />

        <GoogleTagManager gtmId={ENV.GTM_CODE} />
      </head>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          nunito.variable,
          poppins.variable,
          inter.variable,
          "antialiased w-full mx-auto",
        ].join(" ")}
      >
        <div className="!w-[100%] font-nunito">
          <div className="bg-background 2xl:p-0">{children}</div>
        </div>

        {ENV.env === "production" ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        ) : null}
      </body>
    </html>
  );
}
