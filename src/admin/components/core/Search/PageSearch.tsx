import React from "react";
import Icon from "@admin/components/core/Icon/Icon";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  iconName?: string;
  wrapperClass?: string;
}

const PageSearch: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search",
  className = "",
  iconName = "search",
  wrapperClass = "",
}) => {
  return (
    <div className={`flex items-center flex-grow ${wrapperClass}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`px-2 py-1.5 pr-10 w-full border dark:bg-gray-700 dark:border-gray-500 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none dark:text-gray-300 ${className}`}
      />
      <Icon name={iconName} className="text-gray-400 -ml-9 mt-1" />
    </div>
  );
};

export default PageSearch;
