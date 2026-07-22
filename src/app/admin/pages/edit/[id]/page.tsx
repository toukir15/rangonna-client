"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const CampaignPageForm = dynamic(
  () => import("@admin/components/pages/Page/CampaignPageForm"),
  { ssr: false },
);

const Page = () => {
  const params = useParams();
  const pageId = typeof params?.id === "string" ? params.id : params?.id?.[0];

  return <CampaignPageForm mode="edit" pageId={pageId} />;
};

export default Page;
