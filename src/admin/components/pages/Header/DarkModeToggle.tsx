import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React from "react";

const DarkModeToggle: React.FC = () => {
  const { toggleDarkMode, isDarkMode } = useGlobalContext();
  return (
    <>
      <button
        onClick={toggleDarkMode}
        className="p-2  rounded text-black dark:text-white md:block hidden text-3xl"
      >
        {isDarkMode ? (
          <Icon
            name={"light_mode"}
            className="md:mt-2 text-yellow-500"
            variant="outlined"
            size={35}
          />
        ) : (
          <Icon
            name={"dark_mode"}
            className="md:mt-2 text-gray-700"
            variant="outlined"
            size={35}
          />
        )}
      </button>
      <button
        onClick={toggleDarkMode}
        className=" text-black dark:text-white md:hidden block"
      >
        {isDarkMode ? (
          <Icon
            name={"light_mode"}
            className="md:mt-3 mt-1.5 text-yellow-500"
            variant="outlined"
            size={32}
          />
        ) : (
          <Icon
            name={"dark_mode"}
            className="md:mt-3 mt-1.5 text-gray-700"
            variant="outlined"
            size={32}
          />
        )}
      </button>
    </>
  );
};

export default DarkModeToggle;
