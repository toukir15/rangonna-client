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
import { SITE_ORIGIN } from "@/@config/site";

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

const CANONICAL_URL = SITE_ORIGIN;

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
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var path=location.pathname||"";if(path.indexOf("/admin")!==0)return;var raw=localStorage.getItem("rangonaa-dashboard-theme-colors");if(!raw)return;var c=JSON.parse(raw);function ok(v){return typeof v==="string"&&/^#([0-9a-fA-F]{6})$/.test(v)}if(!ok(c.primary))return;var primary=c.primary.toLowerCase();var secondary=ok(c.secondary)?c.secondary.toLowerCase():primary;var accent=ok(c.accent)?c.accent.toLowerCase():primary;function rgb(hex){var n=parseInt(hex.slice(1),16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255}}function h2(n){return("0"+n.toString(16)).slice(-2)}function mix(hex,amount){var c=rgb(hex);var m=function(ch){return Math.round(ch+(255-ch)*amount)};return"#"+h2(m(c.r))+h2(m(c.g))+h2(m(c.b))}function shade(hex,amount){var c=rgb(hex);var m=function(ch){return Math.round(ch*(1-amount))};return"#"+h2(m(c.r))+h2(m(c.g))+h2(m(c.b))}function darken(hex,amount){var c=rgb(hex);var f=1-amount;return"#"+h2(Math.round(c.r*f))+h2(Math.round(c.g*f))+h2(Math.round(c.b*f))}var p=rgb(primary);var glow=p.r+", "+p.g+", "+p.b;var hover=darken(primary,0.12);var light=mix(primary,0.35);var soft="rgba("+glow+", 0.15)";var glowA="rgba("+glow+", 0.35)";var s=rgb(secondary);var root=document.documentElement;root.setAttribute("data-dashboard-theme","boot");var set=function(k,v){root.style.setProperty(k,v)};set("--dashboard-primary",primary);set("--dashboard-primary-hover",hover);set("--dashboard-secondary",secondary);set("--dashboard-accent",accent);set("--dashboard-soft",soft);set("--dashboard-glow",glowA);set("--color-primary",primary);set("--color-primary-hover",hover);set("--color-primary-dark",hover);set("--color-primary-light",light);set("--color-secondary",secondary);set("--color-accent",accent);set("--color-primary-soft",soft);set("--color-primary-glow",glowA);set("--color-secondary-soft","rgba("+s.r+", "+s.g+", "+s.b+", 0.15)");set("--accent",primary);set("--accent-soft",soft);set("--accent-glow",glowA);set("--gold",accent);set("--brand-scrollbar-thumb",primary);set("--brand-scrollbar-thumb-hover",hover);set("--brand-primary",primary);set("--brand-primary-dark",hover);set("--brand-primary-light",light);set("--brand-text",hover);set("--brand-text-bright",mix(primary,0.25));set("--brand-border-soft","color-mix(in srgb, "+primary+" 22%, transparent)");set("--brand-border-medium","color-mix(in srgb, "+primary+" 35%, transparent)");set("--brand-bg-soft","color-mix(in srgb, "+primary+" 10%, transparent)");set("--brand-bg-softer","color-mix(in srgb, "+primary+" 8%, transparent)");set("--brand-bg-medium","color-mix(in srgb, "+primary+" 18%, transparent)");var scale={"50":mix(primary,0.92),"100":mix(primary,0.85),"200":mix(primary,0.72),"300":mix(primary,0.45),"400":light,"500":primary,"600":primary,"700":hover,"800":shade(hover,0.15),"900":shade(hover,0.35),"950":shade(hover,0.55)};Object.keys(scale).forEach(function(step){set("--color-green-"+step,scale[step]);set("--color-emerald-"+step,scale[step])})}catch(e){}})();`,
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
