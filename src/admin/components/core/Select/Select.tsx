"use client";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React, { useEffect, useState } from "react";
import Select, { components, StylesConfig } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SelectComponentProps {
  options: Option[] | any;
  value: Option | Option[] | null | undefined;
  onChange: any;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  isMulti?: boolean;
  isRequired?: boolean;
  showDropdownIndicator?: boolean;
}

const SelectComponent: React.FC<SelectComponentProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  isDisabled = false,
  className = "",
  isMulti = false,
  isRequired,
  showDropdownIndicator = true,
}) => {
  const { isDarkMode } = useGlobalContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const customStyles: StylesConfig<Option, boolean> = {
    control: (base, { isFocused }) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor:
        isFocused || value?.value
          ? isDarkMode
            ? "#10B981"
            : "#22C55E"
          : isDarkMode
            ? "#374151"
            : "#D1D5DB",
      color: isDarkMode ? "#F9FAFB" : "#111827",
      borderRadius: "8px",
      padding: "1px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      boxShadow: isFocused
        ? `0 0 0 0 ${isDarkMode ? "#10B981" : "#22C55E"}`
        : undefined,
      "&:hover": {
        borderColor: isDisabled
          ? isDarkMode
            ? "#374151"
            : "#D1D5DB"
          : isFocused
            ? isDarkMode
              ? "#10B981"
              : "#22C55E"
            : isDarkMode
              ? "#4B5563"
              : "#9CA3AF",
      },
      minHeight: "38px",
      opacity: isDisabled ? 0.7 : 1,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? isDarkMode
          ? "#10B981"
          : "#22C55E"
        : isFocused
          ? isDarkMode
            ? "#374151"
            : "#F3F4F6"
          : isDarkMode
            ? "#4a5568"
            : "#FFFFFF",
      color: isSelected ? "#FFFFFF" : isDarkMode ? "#F9FAFB" : "#111827",
      marginBottom: "-4px",
      marginTop: "-4px",
      // marginBottom: "-4px",
      // marginTop: "-10px",
      "&:active": {
        backgroundColor: isDarkMode ? "#10B981" : "#22C55E",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: isDarkMode ? "#F9FAFB" : "#111827",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: isDarkMode ? "#9CA3AF" : "#6B7280",
      ":hover": {
        backgroundColor: isDarkMode ? "#EF4444" : "#FECACA",
        color: isDarkMode ? "#F9FAFB" : "#DC2626",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? "#F9FAFB" : "#111827",
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? "#F9FAFB" : "#111827",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#9CA3AF" : "#6B7280",
    }),
  };

  const customComponents = {
    DropdownIndicator: showDropdownIndicator
      ? components.DropdownIndicator
      : () => null,
    IndicatorSeparator: showDropdownIndicator
      ? components.IndicatorSeparator
      : () => null,
  };

  if (!mounted) {
    return (
      <div className={`${className} relative`}>
        <div
          className={`h-[38px] rounded-lg border 
          ${isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-300"
            }
          flex items-center px-3 py-2`}
        >
          <span
            className={`truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
          >
            {placeholder}
          </span>
          {showDropdownIndicator && (
            <div className="ml-auto">
              <svg
                className={`w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Select
      required={isRequired}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      className={className}
      isMulti={isMulti}
      classNamePrefix="react-select"
      styles={customStyles}
      components={customComponents}
      menuPortalTarget={document.body}
      menuPosition="fixed"
    />
  );
};

export default SelectComponent;
