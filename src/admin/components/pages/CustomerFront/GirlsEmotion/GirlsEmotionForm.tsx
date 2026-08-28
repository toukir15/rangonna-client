"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import MinimalLoader from "@admin/components/core/Loading/MinimalLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { GirlsEmotionService } from "@admin/@services/apis/CustomerFront/GirlsEmotionService/GirlsEmotion.service";

type Emotion = {
  name: string;
  bangla: string;
  copy: string;
  href: string;
  image: string;
  prompt: string;
  priority: number;
};

type Section = {
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
};

type Content = {
  _id?: string;
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
  mobile: Emotion[];
  desktop: Emotion[];
};

const mobileSize = "4:5 · 1080 × 1350 px";
const desktopSize = "3:4 · 1200 × 1600 px";
const basePrompts = [
  "Colorful festive churi bangles, joyful feminine styling, premium product photography",
  "Elegant glass bangles in soft colors, graceful luxury jewelry photography",
  "Romantic bridal churi set, warm soft light, luxurious South Asian jewelry photography",
  "Bold crystal churi stack, confident fashion styling, dramatic premium product photo",
  "Couture gold bangles, rich dark background, cinematic luxury jewelry photography",
];

const makeItems = (size: string): Emotion[] =>
  ["Joy", "Grace", "Romance", "Confidence", "Desire"].map((name, index) => ({
    name,
    bangla: ["আনন্দ", "লাবণ্য", "প্রেম", "আত্মবিশ্বাস", "আকর্ষণ"][index],
    copy: [
      "Bright stacks for her happiest days",
      "Soft glass for quiet elegance",
      "Bridal heirloom for forever vows",
      "Statement crystal she can’t ignore",
      "Couture gold for nights that linger",
    ][index],
    href: ["/churi/festival", "/churi/glass-bangles", "/churi/bridal", "/churi/premium-churi", "/churi/luxury"][index],
    image: "",
    prompt: `${basePrompts[index]}, ${size}`,
    priority: index + 1,
  }));

const defaultContent: Content = {
  eyebrow: "Wear how she feels",
  heading: "Girls Emotion",
  description: "Shop by mood — every churi set named for the feeling she carries.",
  href: "/churi",
  linkLabel: "Shop all moods",
  mobile: makeItems(mobileSize),
  desktop: makeItems(desktopSize),
};

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#7f1d1d] dark:border-gray-600 dark:bg-gray-950 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

export default function GirlsEmotionForm() {
  const router = useRouter();
  const [content, setContent] = useState(defaultContent);
  const [contentId, setContentId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    GirlsEmotionService.getAll()
      .then((response) => {
        const item = response?.data?.[0];
        if (!item) return;
        const section = item.girlsEmotionSection || item;
        const legacy = item.girlsEmotion || [];
        const normalize = (items: Emotion[], size: string) =>
          items.map((emotion, index) => ({
            ...emotion,
            prompt: emotion.prompt || `${basePrompts[index % basePrompts.length]}, ${size}`,
          }));
        setContent({
          ...defaultContent,
          ...section,
          mobile: normalize(item.mobile?.length ? item.mobile : legacy.length ? legacy : defaultContent.mobile, mobileSize),
          desktop: normalize(item.desktop?.length ? item.desktop : legacy.length ? legacy : defaultContent.desktop, desktopSize),
        });
        setContentId(item._id);
      })
      .catch((error) => ToastService.error(error?.message || "Failed to load Girls Emotion"))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (type: "mobile" | "desktop", index: number, key: keyof Emotion, value: string) =>
    setContent((current) => ({
      ...current,
      [type]: current[type].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: key === "priority" ? Number(value) : value } : item,
      ),
    }));

  const buildPayload = (
    uploadedType?: "mobile" | "desktop",
    uploadedIndex?: number,
    uploadedUrl?: string
  ) => {
    const mapItems = (items: Emotion[], type: "mobile" | "desktop") =>
      items.map((item, index) => ({
        ...item,
        image: type === uploadedType && index === uploadedIndex ? uploadedUrl : item.image,
        priority: Number(item.priority),
      }));
    return {
      eyebrow: content.eyebrow,
      heading: content.heading,
      description: content.description,
      href: content.href,
      linkLabel: content.linkLabel,
      mobile: mapItems(content.mobile, "mobile"),
      desktop: mapItems(content.desktop, "desktop"),
    };
  };

  const uploadImage = async (file: File, type: "mobile" | "desktop", index: number) => {
    const key = `${type}-${index}`;
    try {
      setUploading(key);
      const response = await GirlsEmotionService.uploadFileDirect(file, "girls-emotion");
      const url = response?.data?.fileUrl || response?.fileUrl || response?.data?.url || response?.url;
      if (!url) throw new Error("Invalid upload response");
      updateItem(type, index, "image", url);
      if (contentId) {
        await GirlsEmotionService.updateImage(String(contentId), {
          type,
          index,
          image: url,
        });
        ToastService.success("Image uploaded and saved");
      } else {
        const created = await GirlsEmotionService.create(buildPayload(type, index, url));
        if (!created?.data?._id) throw new Error("Failed to create Girls Emotion content");
        setContentId(created.data._id);
        ToastService.success("Image uploaded and saved");
      }
    } catch (error: any) {
      ToastService.error(error?.message || "Image upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      const response = contentId
        ? await GirlsEmotionService.update(contentId, payload)
        : await GirlsEmotionService.create(payload);
      if (!response?.success) throw new Error(response?.message || "Failed to save Girls Emotion");
      ToastService.success("Girls Emotion saved successfully");
      if (!contentId && response?.data?._id) setContentId(response.data._id);
    } catch (error: any) {
      ToastService.error(error?.message || "Failed to save Girls Emotion");
    } finally {
      setSaving(false);
    }
  };

  const renderItems = (type: "mobile" | "desktop", title: string, size: string) => (
    <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Recommended: {size}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">5 cards</span>
      </div>
      <div className="space-y-4">
        {content[type].map((item, index) => (
          <div key={`${type}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-950/40">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Card #{index + 1}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7f1d1d] text-xs font-bold text-white">{index + 1}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(["name", "bangla", "copy", "href"] as const).map((key) => (
                <div key={key} className={key === "copy" ? "md:col-span-2" : ""}>
                  <label className={labelClass}>{key === "copy" ? "Short description" : key}</label>
                  <input className={inputClass} value={item[key]} onChange={(event) => updateItem(type, index, key, event.target.value)} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Priority</label>
                <input className={inputClass} type="number" value={item.priority} onChange={(event) => updateItem(type, index, "priority", event.target.value)} />
              </div>
            </div>
            <label className={`${labelClass} mt-3`}>Image prompt</label>
            <textarea className={`${inputClass} h-auto py-2`} rows={3} value={item.prompt || ""} onChange={(event) => updateItem(type, index, "prompt", event.target.value)} placeholder={`Describe the image... ${size}`} />
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <label className={labelClass}>Card image</label>
              <div className="flex items-center gap-3">
                {item.image ? <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700" /> : null}
                <label className="flex min-h-16 flex-1 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-xs text-gray-500 hover:border-[#7f1d1d] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                  {uploading === `${type}-${index}` ? "Uploading..." : "Choose image"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading === `${type}-${index}`} onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0], type, index)} />
                </label>
              </div>
              <input className={`${inputClass} mt-3 text-xs`} value={item.image} onChange={(event) => updateItem(type, index, "image", event.target.value)} placeholder="Or paste Cloudinary image URL" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  if (loading) return <MinimalLoader label="Loading Girls Emotion" />;

  return (
    <div className="w-full space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Girls Emotion</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage separate mobile and desktop homepage cards.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => router.back()} className="border border-gray-200 px-4 py-2 text-sm">Back</Button>
          <Button type="button" onClick={save} disabled={saving} className="bg-[#7f1d1d] px-5 py-2 text-sm text-white">{saving ? <ButtonLoader /> : "Save content"}</Button>
        </div>
      </div>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(["eyebrow", "heading", "description", "href", "linkLabel"] as const).map((key) => (
            <div key={key} className={key === "description" ? "md:col-span-2" : ""}>
              <label className={labelClass}>{key === "linkLabel" ? "View all label" : key === "href" ? "View all link" : key}</label>
              {key === "description" ? <textarea className={`${inputClass} h-auto py-2`} rows={2} value={content[key]} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} /> : <input className={inputClass} value={content[key]} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} />}
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-2">
        {renderItems("mobile", "Mobile cards", mobileSize)}
        {renderItems("desktop", "Desktop cards", desktopSize)}
      </div>
    </div>
  );
}
