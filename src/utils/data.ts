import { ISideBarItems, Review } from "@/@interfaces/common.interface";
import { IMenuItem } from "@/@interfaces/RouteInterface/route.interface";

// navbar items start

// export const navBarItems: IMenuItem[] = [
//   { id: 1, name: "Home", route: "/" },
//   {
//     id: 2,
//     name: "Flash Sale",
//     route: "/churi/flash-sale",
//     icon: "flash",
//   },
//   {
//     id: 3,
//     name: "Reviews",
//     route: "/reviews",
//   },
//   {
//     id: 4,
//     name: "Shop",
//     route: "/shop",
//     submenu: [
//       { id: 1, name: "All Watch", route: "/churi" },
//       { id: 2, name: "Men", route: "/churi/men" },
//       { id: 3, name: "Women", route: "/churi/women" },
//       { id: 4, name: "Couple", route: "/churi/couple" },
//       { id: 5, name: "Smart Watches", route: "/churi/smart-watches" },
//       { id: 6, name: "Kids", route: "/churi/kids" },
//     ],
//   },

//   {
//     id: 5,
//     name: "Collection",
//     route: "/shop",
//     submenu: [
//       { id: 1, name: "Leather Strap", route: "/churi/leather-strap" },
//       { id: 2, name: "Silicone Strap", route: "/churi/silicone-strap" },
//       { id: 3, name: "Stainless Steel", route: "/churi/stainless-steel" },
//       { id: 4, name: "Dual Time Watch", route: "/churi/dual-time-watch" },
//       { id: 5, name: "Digital Watch", route: "/churi/digital-watch" },
//       { id: 6, name: "Dual Strap", route: "/churi/dual-strap" },
//       { id: 7, name: "Quartz Standard", route: "/churi/quartz-standard" },
//       {
//         id: 8,
//         name: "Quartz Chronograph",
//         route: "/churi/quartz-chronograph",
//       },
//       { id: 9, name: "Quartz Calendar", route: "/churi/quartz-calendar" },
//       {
//         id: 10,
//         name: "Multi-Function Quartz",
//         route: "/churi/multi-function-quartz",
//       },
//       {
//         id: 11,
//         name: "Mechanical Watch",
//         route: "/churi/mechanical-watch",
//       },
//     ],
//   },
//   {
//     id: 7,
//     name: "Premium",
//     route: "/churi/premium-segment",
//     icon: "premium",
//   },
//   {
//     id: 8,
//     name: "Accessories",
//     route: "/shop",
//     submenu: [
//       { id: 1, name: "Watch Belt", route: "/churi/belt" },
//       { id: 2, name: "Watch Box", route: "/churi/box" },
//     ],
//   },
//   {
//     id: 9,
//     name: "Sunglass",
//     route: "/sunglass",
//   },
//   {
//     id: 10,
//     name: "Wallet",
//     route: "/wallet",
//   },
// ];

// navbar items end

// sidebar items start

export const sortData: ISideBarItems[] = [
  { name: "best-selling", label: "Best Selling", rightLabel: "(1)" },
  { name: "new-released", label: "New Released", rightLabel: "(2)" },
  { name: "price-asc", label: "Price - Low to High", rightLabel: "(3)" },
  { name: "price-desc", label: "Price - High to Low", rightLabel: "(4)" },
];

export const categoryData: ISideBarItems[] = [
  { name: "bridal", label: "Bridal", rightLabel: "(1)" },
  { name: "glass-bangles", label: "Glass Bangles", rightLabel: "(1)" },
  { name: "luxury", label: "Luxury", rightLabel: "(1)" },
  { name: "festival", label: "Festival", rightLabel: "(1)" },
  { name: "premium-churi", label: "Premium Churi", rightLabel: "(1)" },
];

// sidebar items

// review data checkout start
export const reviews: Review[] = [
  {
    id: 1,
    name: "Nusrat Jahan",
    date: "29 July 2025",
    comment:
      "Bridal churi set-টা একদম স্বপ্নের মতো। রং ও finishing অসাধারণ, wedding look-এ পারফেক্ট ম্যাচ হয়েছে।",
  },
  {
    id: 2,
    name: "Farhana Akter",
    date: "15 July 2025",
    comment:
      "Glass bangles-এর quality খুব ভালো। হালকা, চকচকে আর packing-ও খুব যত্নসহকারে। Definitely recommend করব।",
  },
  {
    id: 3,
    name: "Sadia Rahman",
    date: "23 May 2025",
    comment:
      "Festival-এর জন্য রঙিন চুড়ি অর্ডার করেছিলাম। আলহামদুলিল্লাহ একদম যেমন ছবিতে দেখেছি তেমনই পেয়েছি। অসংখ্য ধন্যবাদ Rangonaa।",
  },
  {
    id: 4,
    name: "Mitu Chowdhury",
    date: "15 May 2025",
    comment:
      "Premium churi set gift হিসেবে নিয়েছিলাম। Packaging সুন্দর, product premium feel দেয়। আবারও কিনব ইনশাআল্লাহ।",
  },
  {
    id: 5,
    name: "Ruma Islam",
    date: "07 May 2025",
    comment:
      "Luxury collection-এর চুড়িগুলো দেখতে যেমন elegant, পরতেও আরামদায়ক। Deliveryও সময়মতো পেয়েছি।",
  },
  {
    id: 6,
    name: "Tasnim Ahmed",
    date: "06 May 2025",
    comment:
      "প্রথমবার online থেকে চুড়ি কিনে এত ভালো experience পেয়েছি। Color combination আর shine দারুণ।",
  },
  {
    id: 7,
    name: "Jannatul Ferdous",
    date: "23 April 2025",
    comment:
      "Bridal + glass mix করে নিয়েছিলাম। Look-টা খুব premium লেগেছে। যারা ভালো মানের চুড়ি খুঁজছেন, তাদের জন্য recommend।",
  },
  {
    id: 8,
    name: "Meherin Kabir",
    date: "17 April 2025",
    comment:
      "Product khub sundor, packing o neat. Festival er jonne perfect churi set. Next time aro nibo inshaAllah.",
  },
];

// review data checkout end

export const dhakaKeywords = [
  "dhaka",
  "dhakka",
  "daka",
  "dahka",
  "gulshan",
  "gulshen",
  "gulsan",
  "gulshn",
  "banani",
  "bananni",
  "bonani",
  "bananee",
  "motijheel",
  "motijhil",
  "motijheel",
  "motijheal",
  "mirpur",
  "mirpoor",
  "mirpur",
  "mirpore",
  "uttara",
  "utara",
  "utarra",
  "uttra",
  "dhanmondi",
  "dhanmondy",
  "dhanmondi",
  "dhanmondee",
  "bashundhara",
  "bashudhara",
  "bashundara",
  "basundhara",
  "mohakhali",
  "mohakhali",
  "mohakholy",
  "mohakhalee",
  "baridhara",
  "baridara",
  "baridhara",
  "baridhara",
  "farmgate",
  "farmget",
  "farmgate",
  "farmgait",
  "shahbag",
  "shahbagh",
  "shabag",
  "shaabag",
  "tejgaon",
  "tejgon",
  "tejgaon",
  "tezgaon",
  "badda",
  "bada",
  "badda",
  "badha",
  "shyamoli",
  "shamoli",
  "shyamoly",
  "shyamolee",
  "elephant road",
  "elefant road",
  "elliphant rod",
  "new market",
  "nu market",
  "new markit",
  "azar",
  "azimpur",
  "azimpur",
  "ajimpur",
  "savar",
  "shavar",
  "saver",
  "sabar",
  "paltan",
  "palton",
  "pultan",
  "jatrabari",
  "jatrabari",
  "jatrabari",
  "rampura",
  "rampura",
  "rampura",
  "malibagh",
  "malibag",
  "mali bagh",
  "kuril",
  "kuril",
  "kuril",
  "kalabagan",
  "kalabagan",
  "calabagan",
  "wari",
  "wari",
  "wary",
  "cantonment",
  "cantoment",
  "canttonment",
  "kafrul",
  "kafrul",
  "cafrul",
  "green road",
  "green rd",
  "gren road",
  "siddheshwari",
  "siddeswari",
  "siddheshwary",
  "gandaria",
  "gandaria",
  "gandariah",
  "ঢাকা",
  "গুলশান",
  "বনানী",
  "মতিঝিল",
  "মিরপুর",
  "উত্তরা",
  "ধানমন্ডি",
  "বসুন্ধরা",
  "মোহাখালী",
  "বারিধারা",
  "ফার্মগেট",
  "শাহবাগ",
  "তেজগাঁও",
  "বাড্ডা",
  "শ্যামলী",
  "হাতিরঝিল",
  "কাকরাইল",
  "সাভার",
  "আজিমপুর",
  "নিউ মার্কেট",
  "পল্টন",
  "যাত্রাবাড়ী",
  "রামপুরা",
  "মালিবাগ",
  "কুড়িল",
  "কালাবাগান",
  "ওয়ারি",
  "ক্যান্টনমেন্ট",
  "কাফরুল",
  "গ্রীন রোড",
  "সিদ্ধেশ্বরী",
  "গান্ধারীয়া",
];

/* ================= Dhaka Auto-Select Helpers (one-time, above component) ================= */

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const buildDhakaRegex = (words: string[]) => {
  const latin: string[] = [],
    nonLatin: string[] = [];
  for (const w of words)
    (/[A-Za-z]/.test(w) ? latin : nonLatin).push(escapeRe(w.trim()));
  const latinPart = latin.length ? String.raw`\b(?:${latin.join("|")})\b` : "";
  const nonLatinPart = nonLatin.length ? `(?:${nonLatin.join("|")})` : "";
  return new RegExp([latinPart, nonLatinPart].filter(Boolean).join("|"), "i");
};
const DHAKA_RE = buildDhakaRegex(dhakaKeywords);
export const inferShippingFromAddress = (addr?: string) =>
  addr && DHAKA_RE.test(addr.replace(/\s+/g, " ").trim())
    ? "dhaka city"
    : "all bangladesh";
/* ======================================================================================= */
