"use client";

import { ArrowRight, Building2 } from "lucide-react";

const WHATSAPP_PHONE = "01768509905";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function BuildQualityBanner() {
  const handleWhatsApp = () => {
    const digits = WHATSAPP_PHONE.replace(/\D/g, "");
    const phone = /^0\d{10}$/.test(digits)
      ? `880${digits.slice(1)}`
      : digits.startsWith("880")
        ? digits
        : `88${digits}`;

    const message =
      "Hello, I'm interested in Corporate Deal / Bulk Order. Please share special pricing and quotation.";
    const encoded = encodeURIComponent(message);

    const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

    const url = isMobile
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      aria-label="Corporate deal and bulk order"
      className="@container group relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-white via-slate-50/80 to-white p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-all duration-300 @[640px]:rounded-2xl @[640px]:p-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-3 left-0 w-0.5 rounded-full bg-gradient-to-b from-primary/70 via-primary to-primary/70 @[640px]:inset-y-0 @[640px]:w-1"
      />

      <div className="relative flex flex-col gap-3.5 pl-2.5 @[640px]:flex-row @[640px]:items-center @[640px]:justify-between @[640px]:gap-6 @[640px]:pl-3">
        <div className="flex min-w-0 items-start gap-3 @[640px]:min-w-0 @[640px]:flex-1 @[640px]:items-center @[640px]:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.05)] @[640px]:h-12 @[640px]:w-12 @[640px]:rounded-xl">
            <Building2
              className="h-4 w-4 text-primary @[640px]:h-5 @[640px]:w-5"
              strokeWidth={2.2}
              aria-hidden
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-gray-900 @[640px]:text-lg @[640px]:leading-tight">
              Corporate Deal / Bulk Order / Wholesale ?
            </h3>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-600 @[640px]:mt-1 @[640px]:text-sm @[640px]:leading-relaxed">
              Chat with our Sales Manager on WhatsApp for special pricing &amp;
              quick quotation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhatsApp}
          className="group/btn relative inline-flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#128C7E] to-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,0.28)] transition-all duration-300 active:scale-[0.98] @[640px]:w-auto @[640px]:min-w-[168px] @[640px]:py-3 @[640px]:shadow-[0_8px_22px_rgba(37,211,102,0.35)] @[640px]:hover:-translate-y-0.5 @[640px]:hover:shadow-[0_12px_28px_rgba(37,211,102,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2"
        >
          <span className="pointer-events-none absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100" />
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          WhatsApp Now
          <ArrowRight className="hidden h-4 w-4 shrink-0 @[640px]:block" />
        </button>
      </div>
    </section>
  );
}
