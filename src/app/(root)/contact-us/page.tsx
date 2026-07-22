import React from "react";

const OFFICE_NAME = "Naviforce Bangladesh";
const ADDRESS_LINE = "Majumder House (5th Floor), 39, Purana Paltan";
const CITY = "Dhaka";
const POSTAL_CODE = "1000";
const COUNTRY = "Bangladesh";
const FULL_ADDRESS = `${ADDRESS_LINE}, ${CITY}-${POSTAL_CODE}.`;
const PHONE_E164 = "+8801805049380";
const PHONE_DISPLAY = "+8801805049380";
const HOURS_LABEL = "10am to 8pm";
const MAPS_QUERY = `${ADDRESS_LINE}, ${CITY} ${POSTAL_CODE}`;
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  MAPS_QUERY
)}`;
const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  MAPS_QUERY
)}&output=embed`;

const OfficeAddress: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: OFFICE_NAME,
    url: "https://naviforce.com.bd",
    telephone: PHONE_E164,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS_LINE,
      addressLocality: CITY,
      postalCode: POSTAL_CODE,
      addressCountry: "BD",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "20:00",
      },
    ],
    areaServed: "Bangladesh",
  };

  return (
    <div className="max-w-layout mx-auto text-justify px-3 bg-white border-primary-border border xl:my-8 lg:my-6 pt-6 rounded-lg">
      <h1 className="lg:text-3xl md:text-2xl text-xl font-bold ">
        Naviforce.com.bd এর অফিসের ঠিকানা
      </h1>

      {/* Show in map */}
      <div className="mb-5">
        <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden border border-gray-200">
          <iframe
            title="Naviforce Bangladesh - Location"
            src={MAPS_EMBED}
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0 }}
          />
        </div>
        <div className="mt-3 text-sm">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noreferrer"
            className="underline"
            aria-label="Open in Google Maps"
          >
            Open in Google Maps
          </a>
        </div>
      </div>

      <div className="bg-white border border-primary-border rounded-2xl p-4 md:p-6 shadow-sm mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Naviforce Bangladesh</h2>
            <address className="not-italic text-neutral-600 leading-relaxed">
              {FULL_ADDRESS}
            </address>
            <p className="text-neutral-600">
              📞{" "}
              <a href={`tel:${PHONE_E164}`} className="underline font-medium">
                {PHONE_DISPLAY}
              </a>{" "}
              <span className="text-neutral-500">(10am to 8pm)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${PHONE_E164}`}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
            >
              Call Now
            </a>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 transition"
            >
              Get Directions
            </a>
          </div>
        </div>

        <div className="mt-4 text-sm text-neutral-500">
          <p>Open Hours: {HOURS_LABEL} (Everyday)</p>
        </div>
      </div>

      {/* SEO: LocalBusiness schema */}
      {/* <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      /> */}
    </div>
  );
};

export default OfficeAddress;
