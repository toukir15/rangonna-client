"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import MinimalLoader from "@admin/components/core/Loading/MinimalLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { InstagramGalleryService } from "@admin/@services/apis/CustomerFront/InstagramGalleryService/InstagramGallery.service";

type GalleryItem = { src: string; label: string; prompt: string; href: string; priority: number };
type Gallery = {
  _id?: string;
  eyebrow: string;
  heading: string;
  description: string;
  href: string;
  linkLabel: string;
  items: GalleryItem[];
};

const defaultGallery: Gallery = {
  eyebrow: "@rangonaa",
  heading: "On Instagram",
  description: "Moments from her wardrobe — stacks, celebrations, and everyday elegance.",
  href: "https://instagram.com/rangonaa",
  linkLabel: "Follow @rangonaa",
  items: Array.from({ length: 5 }, (_, index) => ({
    src: "",
    label: `Rangonaa look ${index + 1}`,
    prompt: [
      "Bridal red and gold churi bangles on a bride’s hand, warm wedding lights, rich South Asian jewelry editorial, square composition, 1080x1080 px",
      "Colorful glass bangles with marigold flowers and festive fabric, vibrant celebration mood, premium product photography, square composition, 1080x1080 px",
      "Delicate pastel churi bangles on a woman’s wrist beside soft silk fabric, clean natural daylight, minimal elegant jewelry editorial, square composition, 1080x1080 px",
      "Sparkling crystal churi stack on a deep burgundy background, dramatic studio lighting, luxurious high-fashion jewelry campaign, square composition, 1080x1080 px",
      "Gold bangles arranged with artisan tools and traditional textile, rich texture, refined Bengali jewelry craftsmanship editorial, square composition, 1080x1080 px",
    ][index],
    href: "https://instagram.com/rangonaa",
    priority: index + 1,
  })),
};

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#7f1d1d] dark:border-gray-600 dark:bg-gray-950 dark:text-white";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

export default function InstagramGalleryForm() {
  const router = useRouter();
  const [gallery, setGallery] = useState(defaultGallery);
  const [galleryId, setGalleryId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    InstagramGalleryService.getAll()
      .then((response) => {
        const existing = response?.data?.[0];
        if (!existing) return;
        const distinctPrompts = existing.items?.filter((item: GalleryItem) => item.prompt).map((item: GalleryItem) => item.prompt);
        const promptsAreSame = distinctPrompts?.length > 1 && new Set(distinctPrompts).size === 1;
        setGallery({
          ...defaultGallery,
          ...existing,
          items: existing.items?.length
            ? existing.items.map((item: GalleryItem, index: number) => ({
                ...item,
                prompt: promptsAreSame ? defaultGallery.items[index].prompt : item.prompt || defaultGallery.items[index].prompt,
              }))
            : defaultGallery.items,
        });
        setGalleryId(existing._id);
      })
      .catch((error) => ToastService.error(error?.message || "Failed to load Instagram Gallery"))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = (index: number, key: keyof GalleryItem, value: string) =>
    setGallery((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: key === "priority" ? Number(value) : value } : item,
      ),
    }));

  const uploadImage = async (file: File, index: number) => {
    try {
      setUploading(index);
      const response = await InstagramGalleryService.uploadFileDirect(file, "instagram-gallery");
      const url = response?.data?.fileUrl || response?.fileUrl || response?.data?.url || response?.url;
      if (!url) throw new Error("Invalid upload response");
      updateItem(index, "src", url);
      if (galleryId) {
        await InstagramGalleryService.updateImage(galleryId, index, url);
      } else {
        const created = await InstagramGalleryService.create({
          ...gallery,
          items: gallery.items.map((item, itemIndex) => ({
            ...item,
            src: itemIndex === index ? url : item.src,
          })),
        });
        if (!created?.data?._id) throw new Error("Failed to create Instagram Gallery");
        setGalleryId(created.data._id);
      }
      ToastService.success("Image uploaded and saved");
    } catch (error: any) {
      ToastService.error(error?.message || "Image upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = galleryId
        ? await InstagramGalleryService.update(galleryId, gallery)
        : await InstagramGalleryService.create(gallery);
      if (!response?.success) throw new Error(response?.message || "Failed to save Instagram Gallery");
      if (!galleryId && response?.data?._id) setGalleryId(response.data._id);
      ToastService.success("Instagram Gallery saved successfully");
    } catch (error: any) {
      ToastService.error(error?.message || "Failed to save Instagram Gallery");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <MinimalLoader label="Loading Instagram Gallery" />;

  return (
    <div className="w-full space-y-5 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Instagram Gallery</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage the Instagram section shown on the homepage.</p>
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
              <label className={labelClass}>{key === "linkLabel" ? "View all label" : key === "href" ? "Instagram profile link" : key}</label>
              {key === "description" ? <textarea className={`${inputClass} h-auto py-2`} rows={2} value={gallery[key]} onChange={(event) => setGallery((current) => ({ ...current, [key]: event.target.value }))} /> : <input className={inputClass} value={gallery[key]} onChange={(event) => setGallery((current) => ({ ...current, [key]: event.target.value }))} />}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Gallery images</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload square images for the Instagram row</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{gallery.items.length} images</span>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {gallery.items.map((item, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-700 dark:bg-gray-950/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Image #{index + 1}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7f1d1d] text-xs font-bold text-white">{index + 1}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Label</label>
                  <input className={inputClass} value={item.label} onChange={(event) => updateItem(index, "label", event.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <input className={inputClass} type="number" value={item.priority} onChange={(event) => updateItem(index, "priority", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Instagram post link</label>
                  <input className={inputClass} value={item.href} onChange={(event) => updateItem(index, "href", event.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Image prompt name</label>
                  <textarea
                    className={`${inputClass} h-auto py-2`}
                    rows={3}
                    value={item.prompt || ""}
                    onChange={(event) => updateItem(index, "prompt", event.target.value)}
                    placeholder="Describe the image you want to generate..."
                  />
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <label className={labelClass}>Gallery image</label>
                <div className="flex items-center gap-3">
                  {item.src ? <img src={item.src} alt={item.label} className="h-16 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700" /> : null}
                  <label className="flex min-h-16 flex-1 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-xs text-gray-500 hover:border-[#7f1d1d] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">
                    {uploading === index ? "Uploading..." : item.src ? "Replace image" : "Choose image"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading === index} onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0], index)} />
                  </label>
                </div>
                <input className={`${inputClass} mt-3 text-xs`} value={item.src} onChange={(event) => updateItem(index, "src", event.target.value)} placeholder="Or paste image URL" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
