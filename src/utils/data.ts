import { ISideBarItems, Review } from "@/@interfaces/common.interface";
import { IMenuItem } from "@/@interfaces/RouteInterface/route.interface";

// navbar items start

// export const navBarItems: IMenuItem[] = [
//   { id: 1, name: "Home", route: "/" },
//   {
//     id: 2,
//     name: "Flash Sale",
//     route: "/watches/flash-sale",
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
//       { id: 1, name: "All Watch", route: "/watches" },
//       { id: 2, name: "Men", route: "/watches/men" },
//       { id: 3, name: "Women", route: "/watches/women" },
//       { id: 4, name: "Couple", route: "/watches/couple" },
//       { id: 5, name: "Smart Watches", route: "/watches/smart-watches" },
//       { id: 6, name: "Kids", route: "/watches/kids" },
//     ],
//   },

//   {
//     id: 5,
//     name: "Collection",
//     route: "/shop",
//     submenu: [
//       { id: 1, name: "Leather Strap", route: "/watches/leather-strap" },
//       { id: 2, name: "Silicone Strap", route: "/watches/silicone-strap" },
//       { id: 3, name: "Stainless Steel", route: "/watches/stainless-steel" },
//       { id: 4, name: "Dual Time Watch", route: "/watches/dual-time-watch" },
//       { id: 5, name: "Digital Watch", route: "/watches/digital-watch" },
//       { id: 6, name: "Dual Strap", route: "/watches/dual-strap" },
//       { id: 7, name: "Quartz Standard", route: "/watches/quartz-standard" },
//       {
//         id: 8,
//         name: "Quartz Chronograph",
//         route: "/watches/quartz-chronograph",
//       },
//       { id: 9, name: "Quartz Calendar", route: "/watches/quartz-calendar" },
//       {
//         id: 10,
//         name: "Multi-Function Quartz",
//         route: "/watches/multi-function-quartz",
//       },
//       {
//         id: 11,
//         name: "Mechanical Watch",
//         route: "/watches/mechanical-watch",
//       },
//     ],
//   },
//   {
//     id: 6,
//     name: "Brand",
//     route: "/shop",
//     submenu: [
//       { id: 1, name: "Naviforce", route: "/brand/naviforce" },
//       { id: 2, name: "Casio", route: "/brand/casio" },
//       { id: 3, name: "Curren", route: "/brand/curren" },
//       { id: 4, name: "Poedagar", route: "/brand/poedagar" },
//       { id: 5, name: "Skmei", route: "/brand/skmei" },
//       { id: 6, name: "Colmi", route: "/brand/colmi" },
//       { id: 7, name: "Zeblaze", route: "/brand/zeblaze" },
//     ],
//   },
//   {
//     id: 7,
//     name: "Premium",
//     route: "/watches/premium-segment",
//     icon: "premium",
//   },
//   {
//     id: 8,
//     name: "Accessories",
//     route: "/shop",
//     submenu: [
//       { id: 1, name: "Watch Belt", route: "/watches/belt" },
//       { id: 2, name: "Watch Box", route: "/watches/box" },
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

export const brandData: ISideBarItems[] = [
  { name: "naviforce", label: "Naviforce", rightLabel: "(1)" },
  { name: "casio", label: "Casio", rightLabel: "(2)" },
  { name: "curren", label: "Curren", rightLabel: "(3)" },
  { name: "poedagar", label: "Poedagar", rightLabel: "(4)" },
  { name: "skmei", label: "Skmei", rightLabel: "(6)" },
  { name: "colmi", label: "Colmi", rightLabel: "(8)" },
  { name: "zeblaze", label: "Zeblaze", rightLabel: "(8)" },
];

export const sortData: ISideBarItems[] = [
  { name: "best-selling", label: "Best Selling", rightLabel: "(1)" },
  { name: "new-released", label: "New Released", rightLabel: "(2)" },
  { name: "price-asc", label: "Price - Low to High", rightLabel: "(3)" },
  { name: "price-desc", label: "Price - High to Low", rightLabel: "(4)" },
];

export const categoryData: ISideBarItems[] = [
  { name: "men", label: "Men", rightLabel: "(1)" },
  { name: "women", label: "Women", rightLabel: "(1)" },
  { name: "couple", label: "Couple", rightLabel: "(1)" },
  { name: "smart-watches", label: "Smart Watches", rightLabel: "(1)" },
  { name: "kids", label: "Kids", rightLabel: "(1)" },
  { name: "leather-strap", label: "Leather Strap", rightLabel: "(1)" },
  { name: "stainless-steel", label: "Stainless Steel", rightLabel: "(1)" },
  { name: "silicone-strap", label: "Silicone Strap", rightLabel: "(1)" },
  { name: "dual-time", label: "Dual Time Watch", rightLabel: "(1)" },
  { name: "digital-time", label: "Digital Watch", rightLabel: "(1)" },
  { name: "dual-strap", label: "Dual Strap", rightLabel: "(1)" },
];

// sidebar items

// review data checkout start
export const reviews: Review[] = [
  {
    id: 1,
    name: "Nayeem Uddin Rifat",
    date: "29 July 2025",
    comment:
      "আজ হাতে পেলাম Naviforce এর ৯২০৮ মডেলের এই ঘড়িটা।লুক যাস্ট ওয়াওঘড়িটা দেখতে যেমন সুন্দর তেমন প্রিমিয়াম।এই প্রথম এত টাকা দিয়ে অনলাইন থেকে ওয়াচ কিনলাম।একদম অথেন্টিক",
  },
  {
    id: 2,
    name: "Shamsun Nahar Sumi",
    date: "15 July 2025",
    comment:
      "I have bought 7 watches from the page of Naviforce Bangladesh. They sell good products. In a word, their products and those who are involved in this business are extraordinary. A few days ago, a watch bought from them stopped falling from my hand, I informed them about it.They asked me to send the watch to them.I sent to them.They repaired it and sent me again. In the current online age, where online business is full of cheating it is difficult to find a service that gives the Naviforce. I'm really proud of being a member of the Naviforce.",
  },
  {
    id: 3,
    name: "RI FA T",
    date: "23 May 2025",
    comment:
      "নেভিফোর্স ওয়াচ বাংলাদেশ পেজ থেকে একটি ওম্যান watch অর্ডার করেছিলাম। আলহামদুলিল্লাহ একদিন পর ঠিকঠাক ১০০% অরজিনাল প্রোডাক্টটি হাতে পেয়েছি। অসংখ্য ধন্যবাদ নেভি ফোর্স ওয়াচ বাংলাদেশ পেজকে সঠিক সময়ে অরজিনাল পণ্যটি দেওয়ার জন্য।",
  },
  {
    id: 4,
    name: "Shakib Arefin Shovon",
    date: "15 May 2025",
    comment:
      "গতকাল আপনাদের থেকে ১ টা ঘড়ি নিয়েছি ২৩৫০ টাকা দিয়ে।দাম হিসাবে কোয়ালিটি অসাধারণ সাথে প্যাকেজিং।যারা চিন্তায় থাকেন অনলাইন থেকে নিলে কি ভালো পাব তাদেরকে বলব এই পেজ থেকে একবার নিয়ে দেখতে পারেন।ভালো পন্য।",
  },
  {
    id: 5,
    name: "Naeem Islam",
    date: "07 May 2025",
    comment:
      "আসসালামু আলাইকুম আলহামদুলিল্লাহ Naviforce Bangladesh পেইজ থেকে Casio MTP-V005L-1BUDF প্রোডাক্টটি অর্ডার করেছিলাম! শুকরিয়া; তাদের কথার সঙ্গে কাজের/প্রোডাক্টের ১০০% মিল রয়েছে।",
  },
  {
    id: 6,
    name: "Sharif Ahmed Rasel",
    date: "06 May 2025",
    comment:
      "আসসালামু আলাইকুম অনেক অনেক ধন্যবাদ আপনাদের আমি এই প্রথম কোন, ওয়ান লাইন থেকে কিছু কিনে ঠিক ঠাক পেয়েছি ১০০% ঠিক এ জন্যে আপনাদের কে অনেক অনেক ধন্যবাদ, দোয়া ও শুভকামনা রইলো",
  },
  {
    id: 7,
    name: "Parvez Ahmed",
    date: "23 April 2025",
    comment:
      "আমি সম্প্রতি Naviforce Watch Bangladesh থেকে একটি ঘড়ি অর্ডার করেছিলাম। প্যাকেজিং ছিল অনেক যত্নসহকারে করা, ঘড়ির কোয়ালিটি এক কথায় চমৎকার! ডিজাইন, ফিনিশিং, আর ফিল—সব কিছুতেই আমি খুবই সন্তুষ্ট। যারা ভালো মানের ঘড়ি খুঁজছেন, তাদের জন্য এটি অবশ্যই রিকমেন্ড করবো। ধন্যবাদ Naviforce Watch Bangladesh , এমন দারুন প্রোডাক্ট আর সার্ভিস দেওয়ার জন্য!",
  },
  {
    id: 8,
    name: "Junayed Nahim",
    date: "17 April 2025",
    comment:
      "alhamdulillah products khub valo, kalka recive korchi curren-8402 model r watch ta,, apnara sbi akhan thake watch buy korte paren.",
  },
  {
    id: 9,
    name: "Md Jahidul Islam",
    date: "10 April 2025",
    comment:
      "আমি প্রথমবারের মতো Naviforce Bangladesh থেকে Naviforce 8033 - Orange মডেলটির ঘড়ি অর্ডার করেছি। আলহামদুলিল্লাহ, ঘড়ির কোয়ালিটি অসাধারণ এবং তাদের সার্ভিসও অত্যন্ত চমৎকার। ইনশাআল্লাহ, ভবিষ্যতে যদি আরও কোনো ঘড়ি কেনার প্রয়োজন হয়, তাহলে নির্দ্বিধায় এখান থেকেই নিব।",
  },
  {
    id: 10,
    name: "Raihan Ferdows",
    date: "09 April 2025",
    comment:
      "Naviforce অসংখ্য ধন্যবাদ খুলনাতে একদিনে ডেলিভারি দেওয়ার জন্য। অর্ডার গ্রহণ, নিয়মিত আপডেট এবং ডেলিভারি, প্রতিটি ধাপে আপনাদের কাজে Profesionalism স্পষ্ট। ভবিষ্যতেও Naviforce এর সাথে থাকব।",
  },
  {
    id: 11,
    name: "Nusrat Sithy",
    date: "28 March 2025",
    comment:
      "This watch is so beautiful ঘুড়িগুলো হাতে পাওয়ার পরে বুঝতে পারলাম কোয়ালিটি খুবই ভালো গিফটের জন্য বেস্ট আর ডেলিভারি টাইম এত ফাস্ট জাস্ট ভাষার বাহিরে।",
  },
  {
    id: 12,
    name: "Afran Islam Naim",
    date: "13 March 2025",
    comment:
      "মাশাআল্লাহ ঘড়িটা অনেক সুন্দর, যে রকমটা চেয়েছি ঠিক সে রকমটা পেয়েছি, Curren 8301 - Brown, ধন্যবাদ।",
  },
  {
    id: 13,
    name: "Nobel Hasan Nion",
    date: "27 February 2025",
    comment:
      "যেমন আশা করেছিলাম তার চেয়ে ভালো প্রডাক্ট দেয়ার জন্য আপনাদের ধন্যবাদ ইনশাআল্লাহ আবার লাগলে আপনাদের থেকেই ঘড়ি কিনবো",
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
