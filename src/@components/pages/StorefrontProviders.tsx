"use client";

import { Suspense, type ReactNode } from "react";
import { GlobalProvider } from "@/@components/pages/Context/GlobalContext";
import { ToastComponent } from "@/@components/pages/ToastComponent/ToastComponent";
import CampaignTracker from "@/@components/pages/CampaingTracker/CampainTracker";
import GlobalLoading from "@/@components/pages/GlobalLoading/GlobalLoading";

export default function StorefrontProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GlobalProvider>
      <ToastComponent />
      <Suspense fallback={<GlobalLoading />}>
        <CampaignTracker />
      </Suspense>
      {children}
    </GlobalProvider>
  );
}
