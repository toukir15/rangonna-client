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
    <div className={`relative flex flex-grow items-center ${wrapperClass}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-app !py-2 pr-10 ${className}`}
      />
      <Icon name={iconName} className="pointer-events-none absolute right-3 text-app-muted" />
    </div>
  );
};

export default PageSearch;
