"use client";
import { useEffect, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GlobalContext } from "../Context/GlobalContext";

export default function CampaignTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCampaignPath } = useContext(GlobalContext);

  useEffect(() => {
    const params = searchParams.toString();
    if (!params) return;

    const fullPath = `${params}`;

    setCampaignPath((prev: string[]) => {
      if (prev.includes(fullPath)) return prev;
      return [...prev, fullPath];
    });
  }, [pathname, searchParams, setCampaignPath]);

  return null;
}
