"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import rongonaaLogo from "@/@assets/rongonaLogo/rongonaa.png";

const shopLinks = [
  { href: "/churi", label: "All Churi" },
  { href: "/churi/bridal", label: "Bridal" },
  { href: "/churi/glass-bangles", label: "Glass Bangles" },
  { href: "/churi/festival", label: "Festival" },
  { href: "/churi/premium-churi", label: "Premium Churi" },
  { href: "/churi/luxury", label: "Luxury" },
];

const helpLinks = [
  { href: "/how-to-buy", label: "How to Buy" },
  { href: "/my-account", label: "My Orders" },
  { href: "/contact-us", label: "Contact" },
  { href: "/about-us", label: "About Rangonaa" },
  { href: "/delivery-return-policy", label: "Delivery & Return" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("err");
      return;
    }
    setStatus("ok");
    setEmail("");
  };

  return (
    <div className="rongonaa-footer-nl">
      <form className="rongonaa-footer-nl__form" onSubmit={onSubmit}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="Your email address"
          className="rongonaa-footer-nl__input"
          aria-label="Email address"
        />
        <button type="submit" className="rongonaa-footer-nl__btn">
          Join
        </button>
      </form>
      <p className="rongonaa-footer-nl__note">
        {status === "ok"
          ? "Welcome to the Rangonaa circle."
          : status === "err"
            ? "Enter a valid email."
            : "No spam. Unsubscribe anytime."}
      </p>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="rongonaa-site-footer">
      <div className="rongonaa-footer-shimmer" aria-hidden />

      <div className="rongonaa-footer-inner">
        <div className="rongonaa-footer-grid">
          <div className="rongonaa-footer-brand">
            <Link href="/" className="rongonaa-footer-logo" aria-label="Rangonaa home">
              <Image
                src={rongonaaLogo}
                alt="Rangonaa"
                width={950}
                height={253}
                className="rongonaa-logo-img rongonaa-logo-img--footer"
              />
            </Link>
            <span className="rongonaa-footer-rule" aria-hidden />
            <p className="rongonaa-footer-about">
              Bangladesh&apos;s boutique for handcrafted women&apos;s bangles —
              elegance, tradition, and timeless beauty.
            </p>

            <div className="rongonaa-footer-social">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rongonaa-footer-social-btn"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rongonaa-footer-social-btn"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="mailto:support@rangonaa.com"
                aria-label="Email"
                className="rongonaa-footer-social-btn"
              >
                <Mail className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div className="rongonaa-footer-col">
            <h4 className="rongonaa-footer-col-title">Shop</h4>
            <ul className="rongonaa-footer-links">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rongonaa-footer-col">
            <h4 className="rongonaa-footer-col-title">Help</h4>
            <ul className="rongonaa-footer-links">
              {helpLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rongonaa-footer-col rongonaa-footer-col--nl">
            <h4 className="rongonaa-footer-col-title">Newsletter</h4>
            <p className="rongonaa-footer-nl-copy">
              New arrivals, bridal edits & exclusive offers — delivered to your
              inbox.
            </p>
            <FooterNewsletter />
          </div>
        </div>

        <div className="rongonaa-footer-bottom">
          <p className="rongonaa-footer-copy">
            © {new Date().getFullYear()} Rangonaa. Crafted with care in
            Bangladesh.
          </p>
          <div className="rongonaa-footer-badges">
            <span>Cash on Delivery</span>
            <span className="rongonaa-footer-badge-sep" aria-hidden />
            <span>SSLCommerz Ready</span>
            <span className="rongonaa-footer-badge-sep" aria-hidden />
            <span>Nationwide Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
