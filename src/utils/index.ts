import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import { ENV } from "@/@config/env.config";
import { useContext } from "react";

export const trimString = (
  str: string,
  maxLength: number = 12,
  noDot = false,
) => {
  if (!str) return "";
  if (str?.length <= maxLength) {
    return str;
  } else {
    const trimmedString = str?.slice(0, maxLength) + (noDot ? "" : "...");
    return trimmedString;
  }
};

export const truncateByLines = (lines: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
});

// export const slugify = (str: string) => {
//   return str
//     .toLowerCase()
//     .trim()
//     .replace(/–/g, "-")
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-");
// };

export const GTM_SCRIPT = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ENV.GTM_CODE}');
`;

export function formateDateWithMonth(date: any) {
  const parsedDate = date instanceof Date ? date : new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date provided");
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = parsedDate.getDate();
  const month = months[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();

  return `${day} ${month} ${year}`;
}

export function useUserInfo() {
  const { userInfo } = useContext(GlobalContext);
  return userInfo;
}

export function formatTimeAgo(timestamp: string | Date): string {
  const inputDate = new Date(timestamp);
  const now = new Date();

  const diffInMs = now.getTime() - inputDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Format date as "2 Jun 2025 1:05 pm" (with proper UTC handling)
  const formatDateWithTime = (date: Date): string => {
    const day = date.getUTCDate();
    const month = date.toLocaleString("default", {
      month: "short",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();

    // Get hours in UTC
    let hours = date.getUTCHours();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours || 12;
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  };

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else {
    return formatDateWithTime(inputDate);
  }
}
