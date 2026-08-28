import { ENV } from "@/@config/env.config";

export type TEmotion = {
  name: string;
  bangla: string;
  copy: string;
  href: string;
  image: string;
};

export type TGirlsEmotionContent = {
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
  mobile: TEmotion[];
  desktop: TEmotion[];
};

export async function getGirlsEmotionData(): Promise<TGirlsEmotionContent | null> {
  try {
    const response = await fetch(`${ENV.ApiEndpoint?.trim()}/girls-emotion`, {
      next: { revalidate: 10, tags: ["girls-emotion"] },
    });
    if (!response.ok) return null;

    const result = await response.json();
    const data = result?.data;
    if (!data) return null;

    const mapItems = (items: Array<Record<string, string | number>>) =>
      items
        .filter((item) => item.image && item.name)
        .sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0))
        .map((item) => ({
          name: String(item.name),
          bangla: String(item.bangla || ""),
          copy: String(item.copy || ""),
          href: String(item.href || "/churi"),
          image: String(item.image),
        }));

    const legacy = Array.isArray(data.girlsEmotion) ? data.girlsEmotion : [];
    const mobile = mapItems(data.mobile?.length ? data.mobile : legacy);
    const desktop = mapItems(data.desktop?.length ? data.desktop : legacy);
    if (!mobile.length && !desktop.length) return null;

    return {
      eyebrow: data.eyebrow || "Wear how she feels",
      heading: data.heading || "Girls Emotion",
      description: data.description || "",
      href: data.href || "/churi",
      linkLabel: data.linkLabel || "Shop all moods",
      mobile,
      desktop,
    };
  } catch {
    return null;
  }
}
