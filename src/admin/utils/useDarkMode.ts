import { useCallback, useEffect, useState } from "react";

const readDarkMode = (): boolean => {
  if (typeof window === "undefined") return false;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) return savedTheme === "dark";

  return document.documentElement.classList.contains("dark");
};

const applyDarkMode = (isDark: boolean) => {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

const useDarkMode = (): [boolean, () => void] => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => readDarkMode());

  useEffect(() => {
    const isDark = readDarkMode();
    setIsDarkMode(isDark);
    applyDarkMode(isDark);
  }, []);

  const toggleDarkMode = useCallback((): void => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      applyDarkMode(newMode);
      return newMode;
    });
  }, []);

  return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;
