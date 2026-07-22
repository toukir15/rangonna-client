"use client";
export default function PricePool({ landingData }: any) {
  const handleScrollToCheckout = () => {
    const el = document.getElementById("checkout");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-cream py-4 md:px-2 px-3">
      <div className="max-w-layout mx-auto">
        <div className="">
          <div className="premium-cta p-5 rounded-xl md:w-[500] mx-auto">
            <div className="cursor-pointer " onClick={handleScrollToCheckout}>
              <h2 className="text-center text-2xl font-extrabold">
                অর্ডার করতে চাই ⬇
              </h2>
            </div>
          </div>
        </div>
        <div className="premium-gradient text-white text-center rounded-xl px-4 py-3 mt-4">
          <h2 className="font-bold text-4xl strike-animation">
            {landingData?.price1}{" "}
            {landingData?.products[0]?.pricing?.regular_price}
          </h2>
        </div>

        <div className="premium-gradient text-white text-center rounded-xl px-4 py-3 mt-4">
          <h2 className="font-bold text-4xl strike-animation">
            {landingData?.price2}{" "}
            {landingData?.products[0]?.pricing?.sale_price}
          </h2>
        </div>

        <div className="premium-gradient text-white  text-center rounded-xl px-4 py-3 mt-4">
          <h2 className="font-bold text-4xl">
            {landingData?.price3}{" "}
            {landingData?.products[0]?.wholesale_pricing?.resale_price}
          </h2>
        </div>

        <div className="mt-4">
          <a
            href={`tel:${landingData?.phone_number}`}
            className="inline-block px-6 py-3  font-semibold text-white rounded-lg 
          bg-gradient-to-r from-green-500 to-black 
          shadow-lg hover:scale-105 transition-transform duration-200 w-full text-center text-2xl"
          >
            📞 সরাসরি কথা বলতে ক্লিক করুন
          </a>
        </div>

        <div
          className="mt-4  px-6 py-3  font-semibold text-white rounded-lg 
          bg-gradient-to-r from-green-500 to-black 
          shadow-lg hover:scale-105 transition-transform duration-200 w-full text-center text-2xl flex justify-center gap-2 cursor-pointer"
        >
          WhatsApp :
          <div
            onClick={() => {
              const rawPhone = landingData?.whatsapp_number;
              const digits = rawPhone.replace(/\D/g, "");
              const phone = /^0\d{10}$/.test(digits)
                ? `880${digits.slice(1)}`
                : digits.startsWith("880")
                ? digits
                : `88${digits}`;

              const message =
                `Product: ${landingData?.headline}\n` +
                `Price: ${landingData?.products[0]?.wholesale_pricing?.resale_price}\n` +
                `URL: ${window.location.href}\n`;

              const encoded = encodeURIComponent(message);

              const isMobile =
                /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
                  navigator.userAgent
                );

              const url = isMobile
                ? `https://wa.me/${phone}?text=${encoded}`
                : `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;

              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="text-green-500 font-medium hover:underline cursor-pointer"
          >
            {landingData?.whatsapp_number}
          </div>{" "}
          {/* /
          <a
            href="https://wa.me/8801608233898"
            className="text-green-500 font-medium hover:underline"
          >
            01608233898
          </a> */}
        </div>
      </div>
    </div>
  );
}
