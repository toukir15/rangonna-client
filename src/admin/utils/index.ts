/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export const noData = "--";

export const trimString = (
  str: string,
  maxLength: number = 12,
  noDot = false
) => {
  if (!str) return "";
  if (str?.length <= maxLength) {
    return str;
  } else {
    const trimmedString = str?.slice(0, maxLength) + (noDot ? "" : "...");
    return trimmedString;
  }
};

export const getWebName = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    const segments = hostname.split(".");
    const secondLevelDomains = ["com.bd", "co.uk", "gov.bd", "org.uk"];
    const lastTwoSegments = segments.slice(-2).join(".");
    if (secondLevelDomains.includes(lastTwoSegments)) {
      return segments[segments.length - 3].toUpperCase();
    } else {
      return segments[segments.length - 2].toUpperCase();
    }
  } catch {
    return "";
  }
};

type DebounceFunction<T extends any[]> = (...args: T) => void;

export const debounce = <T extends any[]>(
  func: (...args: T) => void,
  delay: number
): DebounceFunction<T> => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const calculateTotalCollectedAmount = (data: any[]) => {
  return data.reduce((total, invoice) => {
    const amount = parseFloat(invoice.collected_amount) || 0;
    return total + amount;
  }, 0);
};

export interface IQueryParams {
  page?: string | number;
  limit?: string | number;
  searchTerm?: string;
  status?: any;
  domain?: string;
  startDate?: any;
  endDate?: any;
  website_id?: string;
  dateFilter?: string;
  fields?: string;
  sort?: string;
  bookingStatus?: string;
  courierType?: string;
  courier_type?: string;
  delivery_status?: string;
  issueType?: string;
  filterStatus?: string;
  issue_title?: string;
  web_url?: string;
  payment_status?: string;
  is_error?: string;
  category?: string;
  brand?: string;
  inventory_stock_status?: string;
  source?: string;
  active_status?: string;
  tier?: string;
  wholesale_user?: string;
  customer_group?: string;
  assign_employee?: string;
  my_id?: string;
  employee?: string;
  month?: string;
  sysid?: string;
  order_id?: string;
  issue_id?: string;
  payment_method?: string;
  order_status?: string;
  account?: string;
  expense_category?: string;
  expense_sub_title?: string;
  priority?: string;
  date?: string;
  user?: string;
  warehouse_id?: string;
  warehouse?: string;
  is_seo?: string;

}

export const queryStringMapper = (params?: IQueryParams): string => {
  if (!params) return "";

  const encodedParams = new URLSearchParams();
  const rawParams: string[] = [];
  if (params.month) encodedParams.append("month", params.month);
  if (params.order_id) encodedParams.append("order_id", params.order_id);
  if (params.issue_id) encodedParams.append("issue_id", params.issue_id);
  if (params.searchTerm) encodedParams.append("searchTerm", params.searchTerm);
  if (params.is_seo) encodedParams.append("is_seo", params.is_seo);
  if (params.page) encodedParams.append("page", params.page.toString());
  if (params.limit) encodedParams.append("limit", params.limit.toString());
  if (params.status) encodedParams.append("status", params.status.toString());
  if (params.date) encodedParams.append("date", params.date.toString());
  if (params.user) encodedParams.append("user", params.user.toString());
  if (params.warehouse_id) encodedParams.append("warehouse_id", params.warehouse_id.toString());
  if (params.warehouse) encodedParams.append("warehouse", params.warehouse.toString());
  if (params.priority)
    encodedParams.append("priority", params.priority.toString());
  if (params.account)
    encodedParams.append("account", params.account.toString());
  if (params.expense_category)
    encodedParams.append(
      "expense_category",
      params.expense_category.toString()
    );
  if (params.expense_sub_title)
    encodedParams.append(
      "expense_sub_title",
      params.expense_sub_title.toString()
    );
  if (params.order_status)
    encodedParams.append("order_status", params.order_status.toString());
  if (params.startDate)
    encodedParams.append("startDate", params.startDate.toString());
  if (params.payment_method)
    encodedParams.append("payment_method", params.payment_method.toString());
  if (params.endDate)
    encodedParams.append("endDate", params.endDate.toString());
  if (params.domain) rawParams.push(`domain=${params.domain}`);
  if (params.website_id) rawParams.push(`website_id=${params.website_id}`);
  if (params.dateFilter)
    encodedParams.append("dateFilter", params.dateFilter.toString());
  if (params.employee)
    encodedParams.append("employee", params.employee.toString());
  if (params.my_id) encodedParams.append("my_id", params.my_id.toString());
  if (params.fields) encodedParams.append("fields", params.fields.toString());
  if (params.sort) encodedParams.append("sort", params.sort.toString());
  if (params.bookingStatus)
    encodedParams.append("bookingStatus", params.bookingStatus.toString());
  if (params.courierType)
    encodedParams.append("courierType", params.courierType.toString());
  if (params.courier_type)
    encodedParams.append("courier_type", params.courier_type.toString());
  if (params.delivery_status)
    encodedParams.append("delivery_status", params.delivery_status.toString());
  if (params.issueType)
    encodedParams.append("issueType", params.issueType.toString());
  if (params.issue_title)
    encodedParams.append("issue_title", params.issue_title.toString());
  if (params.sysid) encodedParams.append("sysid", params.sysid.toString());
  if (params.payment_status)
    encodedParams.append("payment_status", params.payment_status.toString());
  if (params.is_error)
    encodedParams.append("is_error", params.is_error.toString());
  if (params.assign_employee)
    encodedParams.append("assign_employee", params.assign_employee.toString());
  if (params.active_status)
    encodedParams.append("active_status", params.active_status.toString());
  if (params.tier) encodedParams.append("tier", params.tier.toString());
  if (params.wholesale_user)
    encodedParams.append("wholesale_user", params.wholesale_user.toString());
  if (params.category)
    encodedParams.append("category", params.category.toString());
  if (params.customer_group)
    encodedParams.append("customer_group", params.customer_group.toString());
  if (params.brand) encodedParams.append("brand", params.brand.toString());
  if (params.source) encodedParams.append("source", params.source.toString());
  if (params.inventory_stock_status)
    encodedParams.append(
      "inventory.stock_status",
      params.inventory_stock_status.toString()
    );
  if (params.web_url) rawParams.push(`web_url=${params.web_url}`);

  const encodedQuery = encodedParams.toString();
  const fullQuery = [encodedQuery, ...rawParams].filter(Boolean).join("&");

  return fullQuery ? `?${fullQuery}` : "";
};

export function maskPhone(phone: string | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  const last5 = digits.slice(-5);
  return `*****${last5}`;
}

export function formateDateWithMonth(date: any) {
  if (date == null || date === "") {
    return "";
  }

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return "";
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

export const getCookieeeee = (cookieName: string): string | null => {
  if (typeof document === "undefined") return null;

  const cookieArr = document.cookie.split("; ");
  for (let cookie of cookieArr) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// utils/fileToBase64.ts
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const multipleFilesToBase64 = (files: File[]): Promise<string[]> => {
  return Promise.all(files.map(fileToBase64));
};

import React from "react";

// Helpers
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

// Predefined ranges
const todayRange = () => ({
  startDate: startOfDay(new Date()),
  endDate: endOfDay(new Date()),
  label: "Today",
});
const yesterdayRange = () => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return { startDate: startOfDay(y), endDate: endOfDay(y), label: "Yesterday" };
};
const last24HoursRange = () => ({
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endDate: new Date(),
  label: "Last 24 Hours",
});
const last7DaysRange = () => {
  const t = new Date();
  const s = new Date();
  s.setDate(t.getDate() - 6);
  return {
    startDate: startOfDay(s),
    endDate: endOfDay(t),
    label: "Last 7 Days",
  };
};
const last30DaysRange = () => {
  const t = new Date();
  const s = new Date();
  s.setDate(t.getDate() - 29);
  return {
    startDate: startOfDay(s),
    endDate: endOfDay(t),
    label: "Last 30 Days",
  };
};

const maxRange = () => {
  const t = new Date();
  const s = new Date(2020, 0, 1);
  return { label: "Max", startDate: startOfDay(s), endDate: endOfDay(t) };
};

function refreshRelativeRange(range: any) {
  if (!range?.label) return range;
  switch (range.label) {
    case "Today":
      return todayRange();
    case "Yesterday":
      return yesterdayRange();
    case "Last 24 Hours":
      return last24HoursRange();
    case "Last 7 Days":
      return last7DaysRange();
    case "Last 30 Days":
      return last30DaysRange();
    case "Max":
      return maxRange();
    default:
      return range;
  }
}

export function useLocalStorageDateRange(key: string, initialValue: any) {
  const [value, setValue] = React.useState(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        return refreshRelativeRange(parsed);
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            startDate: value.startDate,
            endDate: value.endDate,
            label: value.label,
          })
        );
      } catch {}
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// permissionHelpers.js
export const hasPermission = (permissions: string[], ...required: any[]) => {
  return required.some((p) => permissions.includes(p));
};

export const getArrayFieldErrorMessage = (
  fieldError: unknown,
  index: number,
): string | undefined => {
  if (!Array.isArray(fieldError)) return undefined;
  const item = fieldError[index];
  if (
    item &&
    typeof item === "object" &&
    "message" in item &&
    typeof (item as { message?: unknown }).message === "string"
  ) {
    return (item as { message: string }).message;
  }
  return undefined;
};

export const registerWithLiveValidation = (
  register: (name: string, options?: Record<string, unknown>) => unknown,
  trigger: (name: string) => Promise<boolean>,
  name: string,
) =>
  register(name, {
    onChange: () => {
      void trigger(name);
    },
  });
