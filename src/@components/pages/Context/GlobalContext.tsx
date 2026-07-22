"use client";
import { ProductService } from "@/@services/apis/Product/Product.service";

import React, { createContext, useState, ReactNode, useEffect } from "react";

type GlobalContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (data: boolean) => void;
  isSignUpDrawer: boolean;
  setIsSignUpDrawer: (data: boolean) => void;
  isCartDrawer: boolean;
  setIsCartDrawer: (data: boolean) => void;
  isMenuDrawer: boolean;
  setIsMenuDrawer: (data: boolean) => void;
  realTimeCartItems: boolean;
  setRealTimeCartItems: (data: boolean) => void;
  isProfile: boolean;
  setIsProfile: (data: boolean) => void;
  totalCount: number;
  setTotalCount: (data: number) => void;
  // campaignPath: string;
  campaignPath: any;
  // setCampaignPath: (data: string) => void;
  setCampaignPath: any;
  userInfo: any;
  fetchUserInfo: any;
  infoLoading: boolean;
  setUserInfo: any;
};

export const GlobalContext = createContext<GlobalContextType>(
  {} as GlobalContextType
);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [isSignUpDrawer, setIsSignUpDrawer] = useState<boolean>(false);
  const [isCartDrawer, setIsCartDrawer] = useState<boolean>(false);
  const [isMenuDrawer, setIsMenuDrawer] = useState<boolean>(false);
  const [infoLoading, setInfoLoading] = useState<boolean>(true);
  const [isProfile, setIsProfile] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("isSidebarOpen");
      return storedValue ? JSON.parse(storedValue) : false;
    }
    return false;
  });
  const [realTimeCartItems, setRealTimeCartItems] = useState<boolean>(false);
  // const [campaignPath, setCampaignPath] = useState<string>("");
  // const [campaignPath, setCampaignPath] = useState<string[]>([]);
  const [campaignPath, setCampaignPath] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("campaign_paths");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [userInfo, setUserInfo] = useState<any>();

  useEffect(() => {
    fetchUserInfo();
  }, [isProfile]);

  const fetchUserInfo = () => {
    setInfoLoading(true);
    ProductService.getUser()
      .then((res: any) => {
        if (res?.success) {
          setUserInfo(res.data);
        } else {
          // ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        // ToastService.error(err.message);
      })
      .finally(() => {
        setInfoLoading(false);
      });
  };

  useEffect(() => {
    if (!campaignPath?.length) return;

    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const payload = {
      value: campaignPath,
      expiresAt: Date.now() + TWENTY_FOUR_HOURS,
    };

    localStorage.setItem("campaign_paths", JSON.stringify(payload.value));

    const timer = setTimeout(() => {
      localStorage.removeItem("campaign_paths");
    }, TWENTY_FOUR_HOURS);

    return () => clearTimeout(timer);
  }, [campaignPath]);

  return (
    <GlobalContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        isSignUpDrawer,
        setIsSignUpDrawer,
        isCartDrawer,
        setIsCartDrawer,
        isMenuDrawer,
        setIsMenuDrawer,
        realTimeCartItems,
        setRealTimeCartItems,
        userInfo,
        isProfile,
        setIsProfile,
        fetchUserInfo,
        infoLoading,
        totalCount,
        setTotalCount,
        campaignPath,
        setCampaignPath,
        setUserInfo,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
