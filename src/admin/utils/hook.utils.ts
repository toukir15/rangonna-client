/* eslint-disable */
import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number = 100): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// export function formatDateTime(dateString: any) {
//   const date = new Date(dateString);

//   const day = String(date.getDate()).padStart(2, "0");
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const year = String(date.getFullYear()).slice(-2);
//   let hours = date.getHours();
//   const minutes = String(date.getMinutes()).padStart(2, "0");
//   const ampm = hours >= 12 ? "PM" : "AM";

//   hours = hours % 12;
//   hours = hours ? hours : 12;

//   const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
//   return formattedDateTime;
// }

export function formatDateTime(dateString: any) {
  // 👉 add 6 hours
  const date = new Date(new Date(dateString).getTime() + 6 * 60 * 60 * 1000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  return formattedDateTime;
}
export function formatDate(dateString: any) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  // let hours = date.getHours();

  // hours = hours % 12;
  // hours = hours ? hours : 12;

  const formattedDateTime = `${day}-${month}-${year} `;
  return formattedDateTime;
}

export function formatMonthYear(dateString: any) {
  const date = new Date(dateString);
  const monthName = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${monthName}-${year}`;
}

export function formatDateRange(dateString: any) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}

// export function formatTimeAgo(timestamp: string | Date): string {
//   const inputDate = new Date(timestamp);
//   const now = new Date();

//   const diffInMs = now.getTime() - inputDate.getTime();
//   const diffInSeconds = Math.floor(diffInMs / 1000);
//   const diffInMinutes = Math.floor(diffInSeconds / 60);
//   const diffInHours = Math.floor(diffInMinutes / 60);
//   // const diffInDays = Math.floor(diffInHours / 24);

//   // Format date as "2 Jun 2025 1:05 pm" (with proper UTC handling)
//   const formatDateWithTime = (date: Date): string => {
//     const day = date.getUTCDate();
//     const month = date.toLocaleString("default", {
//       month: "short",
//       timeZone: "UTC",
//     });
//     const year = date.getUTCFullYear();

//     // Get hours in UTC
//     let hours = date.getUTCHours();
//     const ampm = hours >= 12 ? "pm" : "am";
//     hours = hours % 12;
//     hours = hours || 12;
//     const minutes = date.getUTCMinutes().toString().padStart(2, "0");

//     return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
//   };

//   if (diffInSeconds < 60) {
//     return "just now";
//   } else if (diffInMinutes < 60) {
//     return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
//   } else if (diffInHours < 24) {
//     return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
//   } else {
//     return formatDateWithTime(inputDate);
//   }
// }

export function formatTimeAgo(timestamp: string | Date): string {
  const inputDate = new Date(timestamp);
  const now = new Date();

  const diffInMs = now.getTime() - inputDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);

  const formatDateWithTime = (date: Date): string => {
    const day = date.getUTCDate();
    const month = date.toLocaleString("default", {
      month: "short",
      timeZone: "UTC",
    });
    const year = date.getUTCFullYear();

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
    // 👉 add 6 hours after 24h
    const updatedDate = new Date(inputDate.getTime() + 6 * 60 * 60 * 1000);
    return formatDateWithTime(updatedDate);
  }
}

export default function timeSince(a: any) {
  let months = [
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
  let month = months[a.getMonth()];
  let date = a.getDate();
  let year = a.getFullYear();
  let hour = a.getHours();
  let min = a.getMinutes();

  var seconds = Math.floor((new Date() - a) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return `${date} ${month} ${year} ${hour}:${min}`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${date} ${month} ${year} ${hour}:${min}`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${date} ${month} ${year} ${hour}:${min}`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}


