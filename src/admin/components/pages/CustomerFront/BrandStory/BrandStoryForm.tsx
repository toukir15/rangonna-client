"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import MinimalLoader from "@admin/components/core/Loading/MinimalLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { BrandStoryService } from "@admin/@services/apis/CustomerFront/BrandStoryService/BrandStory.service";

type Value = { icon: string; label: string; text: string; priority: number };
type BrandStory = {
  _id?: string;
  image: string;
  mobileImage: string;
  desktopImage: string;
  imageAlt: string;
  badgeEyebrow: string;
  badgeTitle: string;
  eyebrow: string;
  heading: string;
  description: string;
  values: Value[];
  ctaLabel: string;
  ctaHref: string;
};

const defaultStory: BrandStory = {
  image: "/hero-bridal.png",
  mobileImage: "/hero-bridal.png",
  desktopImage: "/hero-bridal.png",
  imageAlt: "Rangonaa craftsmanship",
  badgeEyebrow: "Est. with care",
  badgeTitle: "Tradition, refined",
  eyebrow: "Our Story",
  heading: "Modern Bengali elegance, handcrafted for her",
  description: "Rangonaa is devoted solely to women's bangles — glass, bridal, daily, and luxury collections that honor tradition with a refined, contemporary finish.",
  values: [
    { icon: "auto_awesome", label: "Handcrafted", text: "Every set finished by hand", priority: 1 },
    { icon: "favorite", label: "For Her", text: "Women's bangles only", priority: 2 },
    { icon: "diamond", label: "Boutique", text: "Premium curated quality", priority: 3 },
  ],
  ctaLabel: "About Rangonaa",
  ctaHref: "/about",
};

const inputClass = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#7f1d1d] dark:border-gray-600 dark:bg-gray-950 dark:text-white";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

export default function BrandStoryForm() {
  const router = useRouter();
  const [story, setStory] = useState(defaultStory);
  const [storyId, setStoryId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    BrandStoryService.getAll()
      .then((response) => {
        const existing = response?.data?.[0];
        if (!existing) return;
        setStory({
          ...defaultStory,
          ...existing,
          mobileImage: existing.mobileImage || existing.image || defaultStory.mobileImage,
          desktopImage: existing.desktopImage || existing.image || defaultStory.desktopImage,
          values: existing.values?.length ? existing.values : defaultStory.values,
        });
        setStoryId(existing._id);
      })
      .catch((error) => ToastService.error(error?.message || "Failed to load Brand Story"))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (key: keyof BrandStory, value: string) =>
    setStory((current) => ({ ...current, [key]: value }));

  const updateValue = (index: number, key: keyof Value, value: string) =>
    setStory((current) => ({
      ...current,
      values: current.values.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: key === "priority" ? Number(value) : value } : item,
      ),
    }));

  const uploadImage = async (file: File, type: "mobileImage" | "desktopImage") => {
    try {
      setUploading(true);
      const response = await BrandStoryService.uploadFileDirect(file, "brand-story");
      const url = response?.data?.fileUrl || response?.fileUrl || response?.data?.url || response?.url;
      if (!url) throw new Error("Invalid upload response");
      updateField(type, url);
      if (storyId) await BrandStoryService.update(storyId, { [type]: url });
      ToastService.success("Brand Story image uploaded and saved");
    } catch (error: any) {
      ToastService.error(error?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = storyId
        ? await BrandStoryService.update(storyId, story)
        : await BrandStoryService.create(story);
      if (!response?.success) throw new Error(response?.message || "Failed to save Brand Story");
      if (!storyId && response?.data?._id) setStoryId(response.data._id);
      ToastService.success("Brand Story saved successfully");
    } catch (error: any) {
      ToastService.error(error?.message || "Failed to save Brand Story");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <MinimalLoader label="Loading Brand Story" />;

  return (
    <div className="w-full space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Brand Story</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the Our Story section shown on the homepage.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={() => router.back()} className="border border-gray-200 px-4 py-2 text-sm">Back</Button>
          <Button type="button" onClick={save} disabled={saving} className="bg-[#7f1d1d] px-5 py-2 text-sm text-white">{saving ? <ButtonLoader /> : "Save content"}</Button>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(["eyebrow", "heading", "description", "badgeEyebrow", "badgeTitle", "imageAlt", "ctaHref", "ctaLabel"] as const).map((key) => (
            <div key={key} className={["heading", "description"].includes(key) ? "md:col-span-2" : ""}>
              <label className={labelClass}>{key === "ctaHref" ? "CTA link" : key === "ctaLabel" ? "CTA label" : key}</label>
              {key === "heading" || key === "description" ? <textarea className={`${inputClass} h-auto py-2`} rows={key === "heading" ? 2 : 3} value={story[key]} onChange={(event) => updateField(key, event.target.value)} /> : <input className={inputClass} value={story[key]} onChange={(event) => updateField(key, event.target.value)} />}
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-700">
          <div className="grid gap-5 md:grid-cols-2">
            {(["mobileImage", "desktopImage"] as const).map((type) => (
              <div key={type}>
                <label className={labelClass}>{type === "mobileImage" ? "Mobile story image · 1080 × 1350 px" : "Desktop story image · 1600 × 2000 px"}</label>
                <div className="flex items-center gap-3">
                  <img src={story[type]} alt={story.imageAlt} className="h-24 w-20 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700" />
                  <label className="flex min-h-16 flex-1 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 hover:border-[#7f1d1d] dark:border-gray-600 dark:bg-gray-950 dark:text-gray-400">
                    {uploading ? "Uploading..." : "Replace image"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0], type)} />
                  </label>
                </div>
                <input className={`${inputClass} mt-3 text-xs`} value={story[type]} onChange={(event) => updateField(type, event.target.value)} placeholder="Or paste image URL" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Brand values</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The three trust points below the story</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{story.values.length} values</span>
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          {story.values.map((item, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-950/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Value #{index + 1}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7f1d1d] text-xs font-bold text-white">{index + 1}</span>
              </div>
              {(["icon", "label", "text", "priority"] as const).map((key) => (
                <div key={key}>
                  <label className={labelClass}>{key}</label>
                  <input className={inputClass} type={key === "priority" ? "number" : "text"} value={item[key]} onChange={(event) => updateValue(index, key, event.target.value)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
