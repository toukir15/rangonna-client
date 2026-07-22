"use client";

import Image from "next/image";
import Link from "next/link";
import methodImage from "@/@assets/visa.webp";
import facebookIcon from "@/@assets/icon/facebook.png";
import youtubeIcon from "@/@assets/icon/youtube.webp";
import whatsappIcon from "@/@assets/icon/whatsapp.png";
import rongonaaLogo from "@/@assets/rongonaLogo/rongonaa.png";
import Icon from "@/@components/core/Icon/Icon";
import FooterAccordion from "./FooterAccordion";

const productLinks = [
  { href: "/watches/men", label: "Men's Collection" },
  { href: "/watches/women", label: "Women's Collection" },
  { href: "/watches/couple", label: "Couple Collection" },
  { href: "/watches", label: "All Products" },
];

const companyLinks = [
  { href: "/terms-conditions", label: "Terms & Conditions" },
  { href: "/delivery-return-policy", label: "Delivery & Return" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/replacement-warranty", label: "Replacement Warranty" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/voucher-terms-conditions", label: "Voucher Terms" },
];

const supportLinks = [
  { href: "/how-to-buy", label: "How to Buy" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/about-us", label: "About Rongonaa" },
  { href: "/blog", label: "Blog" },
];

const trustItems = [
  "১০০% অরিজিনাল",
  "ক্যাশ অন ডেলিভারি",
  "দ্রুত ডেলিভারি",
];

const openWhatsApp = () => {
  const phone = "8801768509905";
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  const url = isMobile
    ? `https://wa.me/${phone}`
    : `https://web.whatsapp.com/send?phone=${phone}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

const Footer: React.FC = () => {
  return (
    <footer className="rongonaa-site-footer">
      <div className="rongonaa-footer-shimmer" aria-hidden="true" />

      <div className="max-w-layout mx-auto px-3 pb-4 pt-8 sm:px-5 2xl:px-0 lg:pb-6">
        <div className="rongonaa-footer-hero">
          <div className="rongonaa-footer-brand">
            <Link href="/" className="rongonaa-footer-logo-wrap">
              <Image
                src={rongonaaLogo}
                alt="Rongonaa"
                width={140}
                height={40}
                className="h-auto w-[108px] sm:w-[120px]"
              />
            </Link>
            <p className="rongonaa-footer-tagline">
              মায়েদের জন্য নিরাপদ ও প্রিমিয়াম পণ্য
            </p>
            <p className="rongonaa-footer-about">
              Rongonaa — বাংলাদেশের মায়েদের trusted online store। quality,
              safety ও fast delivery এক জায়গায়।
            </p>
            <div className="rongonaa-footer-trust-row">
              {trustItems.map((item) => (
                <span key={item} className="rongonaa-footer-trust-pill">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rongonaa-footer-contact-card">
            <p className="rongonaa-footer-contact-title">যোগাযোগ</p>
            <ul className="rongonaa-footer-contact-list">
              <li>
                <Icon name="call" size={16} className="text-gold shrink-0" />
                <a href="tel:01805049380">01805049380</a>
              </li>
              <li>
                <Icon name="mail" size={16} className="text-gold shrink-0" />
                <a href="mailto:support@rongonaa.com">support@rongonaa.com</a>
              </li>
              <li>
                <Icon name="location_on" size={16} className="text-gold shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rongonaa-footer-grid hidden md:grid">
          <div className="rongonaa-footer-column">
            <p className="rongonaa-footer-column-title">Shop</p>
            <ul className="rongonaa-footer-links">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rongonaa-footer-column">
            <p className="rongonaa-footer-column-title">Company</p>
            <ul className="rongonaa-footer-links">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rongonaa-footer-column">
            <p className="rongonaa-footer-column-title">Support</p>
            <ul className="rongonaa-footer-links">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rongonaa-footer-column">
            <p className="rongonaa-footer-column-title">Connect</p>
            <div className="rongonaa-footer-social">
              <a
                href="https://www.facebook.com/Naviforce.com.bd"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rongonaa-footer-social-btn"
              >
                <Image src={facebookIcon} alt="" width={22} height={22} />
              </a>
              <a
                href="https://www.youtube.com/@naviforceofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rongonaa-footer-social-btn"
              >
                <Image src={youtubeIcon} alt="" width={22} height={22} />
              </a>
              <button
                type="button"
                onClick={openWhatsApp}
                aria-label="WhatsApp"
                className="rongonaa-footer-social-btn"
              >
                <Image src={whatsappIcon} alt="" width={22} height={22} />
              </button>
            </div>
            <p className="rongonaa-footer-social-note">
              Messenger/WhatsApp-এ সরাসরি অর্ডার ও সাপোর্ট
            </p>
          </div>
        </div>

        <div className="md:hidden">
          <FooterAccordion />
        </div>
      </div>

      <div className="rongonaa-footer-bottom">
        <div className="max-w-layout mx-auto flex flex-col items-center justify-between gap-4 px-3 py-4 sm:px-5 lg:flex-row 2xl:px-0">
          <p className="rongonaa-footer-copy">
            © {new Date().getFullYear()} Rongonaa. All rights reserved.
          </p>
          <Image
            src={methodImage}
            alt="Payment methods"
            className="h-auto w-auto max-h-7 opacity-90"
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
