"use client";

import dynamic from "next/dynamic";

const CampaignPageForm = dynamic(
  () => import("@admin/components/pages/Page/CampaignPageForm"),
  { ssr: false },
);

const Page = () => <CampaignPageForm mode="add" />;

export default Page;
