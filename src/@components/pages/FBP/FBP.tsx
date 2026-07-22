"use client";
import { useEffect } from "react";

const setFbpCookieIfNotExists = () => {
  if (typeof document === "undefined") return;

  const cookies = document.cookie.split(";");
  const fbpExists = cookies.some((cookie) => cookie.trim().startsWith("_fbp="));

  if (!fbpExists) {
    const fbpValue = `fb.1.${Date.now()}.${Math.floor(Math.random() * 1e10)}`;
    document.cookie = `_fbp=${fbpValue}; path=/; max-age=${
      60 * 60 * 24 * 90
    }; SameSite=Lax`;
  }
};

export default function FbpProvider() {
  useEffect(() => {
    setFbpCookieIfNotExists();
  }, []);

  return null;
}
