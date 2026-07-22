"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const Page = () => {
  const { sysId } = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = Array.isArray(sysId) ? sysId[0] : sysId;
    if (!id) return;
    router.replace(`/orders/view/${id}?isAssign=true`);
  }, [sysId, router]);

  return null;
};

export default Page;
