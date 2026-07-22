import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogDescriptionParser from "@/@components/core/HtmlParser/BlogDescriptionParser";
import { ENV } from "@/@config/env.config";
import { ICampaignPage } from "@/@interfaces/Campaign/campaign.interface";

type Params = { slug: string };

async function fetchCampaignPage(slug: string): Promise<ICampaignPage | null> {
  try {
    const safeSlug = encodeURIComponent(slug.trim());
    const res = await fetch(`${ENV.ApiEndpoint?.trim()}/campaign-page/${safeSlug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();

    if (!json?.success || !json?.data) {
      return null;
    }

    return json.data as ICampaignPage;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await fetchCampaignPage(slug);

  if (!campaign) {
    return {
      title: "Campaign Not Found | Naviforce Bangladesh",
      description: "This campaign page does not exist.",
    };
  }

  const title = `${campaign.title} | Naviforce Bangladesh`;
  const description =
    campaign.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ||
    campaign.title;

  return {
    title,
    description,
    openGraph: {
      title: campaign.title,
      description,
      type: "website",
    },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const campaign = await fetchCampaignPage(slug);

  if (!campaign || campaign.status === false) {
    notFound();
  }

  return (
    <main className="py-6 md:py-8">
      <div className="mx-auto max-w-layout rounded-lg border border-primary-border bg-white px-4 py-6 md:px-8 md:py-8">
        <h1 className="pb-4 text-2xl font-bold text-gray-900 md:text-3xl">
          {campaign.title}
        </h1>

        {campaign.description ? (
          <BlogDescriptionParser htmlContent={campaign.description} />
        ) : (
          <p className="text-[#777777]">No campaign content available.</p>
        )}
      </div>
    </main>
  );
}
