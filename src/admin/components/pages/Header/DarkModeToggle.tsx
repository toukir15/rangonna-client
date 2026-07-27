import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React from "react";

const DarkModeToggle: React.FC = () => {
  const { toggleDarkMode, isDarkMode } = useGlobalContext();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/5 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      <Icon
        name={isDarkMode ? "light_mode" : "dark_mode"}
        variant="outlined"
        size={20}
        className={isDarkMode ? "text-amber-400" : "text-gray-600 dark:text-gray-300"}
      />
    </button>
  );
};

export default DarkModeToggle;
