"use client";

import Icon from "@/@components/core/Icon/Icon";
import Link from "next/link";
import { useContext } from "react";
import { GlobalContext } from "../Context/GlobalContext";
import { useRouter, usePathname } from "next/navigation";

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
  >
    <path d="M16 .5C7.3.5.2 7.6.2 16.3c0 2.9.8 5.6 2.3 8L0 31.5l7.5-2.4c2.3 1.2 4.9 1.8 7.5 1.8 8.7 0 15.8-7.1 15.8-15.8S24.7.5 16 .5zm0 28.6c-2.3 0-4.6-.6-6.6-1.8l-.5-.3-4.4 1.4 1.4-4.3-.3-.5c-1.4-2-2.1-4.4-2.1-6.9 0-6.8 5.6-12.4 12.4-12.4s12.4 5.6 12.4 12.4S22.8 29.1 16 29.1zm6.8-9.3c-.4-.2-2.3-1.1-2.6-1.2s-.6-.2-.9.2c-.3.4-1 1.2-1.2 1.5-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-2-1.2-1.1-2-2.3-2.2-2.7s0-.6.2-.8c.2-.2.4-.5.6-.7.2-.2.3-.4.4-.6.1-.2 0-.5 0-.7 0-.2-.9-2.2-1.2-3s-.7-.7-.9-.7h-.8c-.2 0-.7.1-1.1.5s-1.5 1.5-1.5 3.6 1.5 4.1 1.7 4.4c.2.3 3 4.5 7.3 6.2.9.4 1.6.6 2.2.8.9.3 1.7.3 2.3.2.7-.1 2.3-.9 2.7-1.7.3-.8.3-1.5.2-1.7-.1-.3-.3-.4-.7-.6z" />
  </svg>
);

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    setIsProfile,
    userInfo,
    setIsSignUpDrawer,
  } = useContext(GlobalContext);

  const handleSignUpClick = () => {
    setIsProfile(true);
    if (userInfo) {
      router.push("/my-account");
    } else {
      setIsSignUpDrawer(true);
    }
  };

  const openWhatsApp = () => {
    const rawPhone = "01768509905";
    const digits = rawPhone.replace(/\D/g, "");
    const phone = /^0\d{10}$/.test(digits)
      ? `880${digits.slice(1)}`
      : digits.startsWith("880")
        ? digits
        : `88${digits}`;

    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

    const url = isMobile
      ? `https://wa.me/${phone}`
      : `https://web.whatsapp.com/send?phone=${phone}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="rongonaa-bottom-nav fixed bottom-0 left-0 z-50 w-full lg:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-layout items-center justify-around px-2 py-2.5">
        <Link
          href="/watches"
          className={`rongonaa-bottom-nav-item ${pathname.startsWith("/watches") ? "rongonaa-bottom-nav-item--active" : ""}`}
        >
          <Icon name="store" variant="outlined" size={22} />
          <span>Shop</span>
        </Link>

        <button
          type="button"
          className="rongonaa-bottom-nav-item"
          onClick={openWhatsApp}
          aria-label="WhatsApp"
        >
          <WhatsappIcon className="h-[22px] w-[22px] text-success" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          className={`rongonaa-bottom-nav-item ${pathname === "/my-account" ? "rongonaa-bottom-nav-item--active" : ""}`}
          onClick={handleSignUpClick}
          aria-label="Account"
        >
          <Icon name="person" variant="outlined" size={22} />
          <span>Account</span>
        </button>
      </div>
    </div>
  );
}
