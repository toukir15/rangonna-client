export type WebsiteSuggestion = {
  _id?: string;
  web_url: string;
  web_name: string;
};

export type WebsiteSelectOption = {
  label: string;
  value: string;
  urls: string[];
};

const WEBSITE_GROUPS = [
  {
    label: "Watch",
    urls: [
      "https://naviforce.com.bd",
      "https://timeverse.com.bd",
      "https://olevs.com.bd",
    ],
  },
  {
    label: "Sunglass & Perfume",
    urls: ["https://navorabd.com"],
  },
] as const;

export const normalizeWebUrl = (url: string) => {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
    return `${parsed.protocol}//${host}`.toLowerCase();
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, "");
  }
};

export const buildGroupedWebsiteOptions = (
  suggestions: WebsiteSuggestion[] = [],
): WebsiteSelectOption[] => {
  const apiByUrl = new Map<string, WebsiteSuggestion>();
  suggestions.forEach((item) => {
    apiByUrl.set(normalizeWebUrl(item.web_url), item);
  });

  const groupedUrls = new Set<string>();
  const options: WebsiteSelectOption[] = [];

  WEBSITE_GROUPS.forEach((group) => {
    const matched = group.urls
      .map((url) => apiByUrl.get(normalizeWebUrl(url)))
      .filter(Boolean) as WebsiteSuggestion[];

    if (matched.length === 0) return;

    matched.forEach((item) => groupedUrls.add(normalizeWebUrl(item.web_url)));
    options.push({
      label: group.label,
      value: `group:${group.label.toLowerCase().replace(/\s+/g, "-")}`,
      urls: matched.map((item) => item.web_url),
    });
  });

  suggestions.forEach((item) => {
    const norm = normalizeWebUrl(item.web_url);
    if (groupedUrls.has(norm)) return;

    options.push({
      label: item.web_name,
      value: item.web_url,
      urls: [item.web_url],
    });
  });

  return options;
};

export const expandWebsiteSelections = (
  selections: WebsiteSelectOption[] = [],
): string[] => {
  const urls = selections.flatMap((item) => item.urls ?? [item.value]);
  return [...new Set(urls)];
};

export const mapUrlsToWebsiteSelections = (
  urls: string[] = [],
  options: WebsiteSelectOption[] = [],
): WebsiteSelectOption[] => {
  const selectedSet = new Set(urls.map(normalizeWebUrl));
  const picked: WebsiteSelectOption[] = [];
  const claimed = new Set<string>();

  options
    .filter((opt) => opt.urls.length > 1)
    .forEach((opt) => {
      const normalized = opt.urls.map(normalizeWebUrl);
      if (normalized.every((url) => selectedSet.has(url))) {
        normalized.forEach((url) => claimed.add(url));
        picked.push(opt);
      }
    });

  options
    .filter((opt) => opt.urls.length === 1)
    .forEach((opt) => {
      const norm = normalizeWebUrl(opt.urls[0]);
      if (selectedSet.has(norm) && !claimed.has(norm)) {
        claimed.add(norm);
        picked.push(opt);
      }
    });

  return picked;
};
