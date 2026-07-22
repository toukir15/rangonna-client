"use client";

import Accordion from "@/@components/core/Accordian/Accordian";
import Link from "next/link";
import { ReactNode, useState } from "react";

interface FaqData {
  id: number;
  title: string;
  des: ReactNode;
}

const linkClass = "rongonaa-footer-mobile-link";

const FooterAccordion: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const handleAccordionClick = (accordionId: number) => {
    setOpenAccordion((prev) => (prev === accordionId ? null : accordionId));
  };

  const acData: FaqData[] = [
    {
      id: 1,
      title: "Shop",
      des: (
        <ul className="rongonaa-footer-mobile-links">
          <li><Link className={linkClass} href="/watches/men">Men&apos;s Collection</Link></li>
          <li><Link className={linkClass} href="/watches/women">Women&apos;s Collection</Link></li>
          <li><Link className={linkClass} href="/watches/couple">Couple Collection</Link></li>
          <li><Link className={linkClass} href="/watches">All Products</Link></li>
        </ul>
      ),
    },
    {
      id: 2,
      title: "Company",
      des: (
        <ul className="rongonaa-footer-mobile-links">
          <li><Link className={linkClass} href="/terms-conditions">Terms & Conditions</Link></li>
          <li><Link className={linkClass} href="/delivery-return-policy">Delivery & Return</Link></li>
          <li><Link className={linkClass} href="/refund-policy">Refund Policy</Link></li>
          <li><Link className={linkClass} href="/replacement-warranty">Replacement Warranty</Link></li>
          <li><Link className={linkClass} href="/privacy-policy">Privacy Policy</Link></li>
          <li><Link className={linkClass} href="/voucher-terms-conditions">Voucher Terms</Link></li>
        </ul>
      ),
    },
    {
      id: 3,
      title: "Support",
      des: (
        <ul className="rongonaa-footer-mobile-links">
          <li><Link className={linkClass} href="/how-to-buy">How to Buy</Link></li>
          <li><Link className={linkClass} href="/contact-us">Contact Us</Link></li>
          <li><Link className={linkClass} href="/about-us">About Rongonaa</Link></li>
          <li><Link className={linkClass} href="/blog">Blog</Link></li>
        </ul>
      ),
    },
  ];

  return (
    <div className="rongonaa-footer-mobile-nav">
      {acData.map((data) => (
        <Accordion
          key={data.id}
          title={data.title}
          isOpen={openAccordion === data.id}
          onToggle={() => handleAccordionClick(data.id)}
        >
          {data.des}
        </Accordion>
      ))}
    </div>
  );
};

export default FooterAccordion;
