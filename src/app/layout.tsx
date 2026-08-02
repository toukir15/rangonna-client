import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Nunito,
  Poppins,
  Inter,
  Playfair_Display,
} from "next/font/google";
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
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const CANONICAL_URL =
  ENV.APP_URL && typeof ENV.APP_URL === "string" && ENV.APP_URL.trim() !== ""
    ? ENV.APP_URL
    : "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Rangonaa | Handcrafted Women's Bangles from Bangladesh",
    template: "%s | Rangonaa",
  },
  description:
    "Discover premium handcrafted women's bangles (Churi) at Rangonaa — elegant glass, bridal, daily wear, and luxury collections with Cash on Delivery across Bangladesh.",
  alternates: { canonical: CANONICAL_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Rangonaa | Celebrate Every Moment with Elegance",
    description:
      "Handcrafted women's bangles blending tradition with modern beauty.",
    siteName: "Rangonaa",
    type: "website",
    url: CANONICAL_URL,
    locale: "en_BD",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rangonaa | Celebrate Every Moment with Elegance",
    description:
      "Handcrafted women's bangles blending tradition with modern beauty.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Rangonaa",
    url: CANONICAL_URL,
    description:
      "Handcrafted women's bangles (Churi) — bridal, glass, luxury, and festival collections.",
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
        <meta name="theme-color" content="#9b1b30" media="(max-width: 768px)" />
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
          playfair.variable,
          inter.variable,
          "antialiased w-full mx-auto",
        ].join(" ")}
      >
        <div className="!w-[100%] font-poppins">
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
