"use client";

import NoInternet from "@admin/components/pages/NoInternet/NoInternet";
import { useEffect, useState } from "react";


export default function InternetWrapper({ children }: any) {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOnline) return <NoInternet />;

    return children;
}