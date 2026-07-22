"use client";
import { useGlobalContext } from "@admin/context/GlobalContext";
import React from "react";
import Select, { components } from "react-select";

// Types for props
interface Option {
  value: string;
  label: string;
}

interface SelectComponentProps {
  options: Option[] | any;
  value: Option | any;
  onChange: (selectedOption: Option | any) => void;
  placeholder?: string;
  isDisabled?: boolean;
  className?: string;
  isMulti?: boolean;
  isRequired?: boolean;
  showDropdownIndicator?: boolean;
}

const SelectComponentSetting: React.FC<SelectComponentProps> = ({
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

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      borderColor: state.isFocused
        ? isDarkMode
          ? "#10B981"
          : "#22C55E"
        : isDarkMode
        ? "#374151"
        : "#D1D5DB",
      color: isDarkMode ? "#F9FAFB" : "#111827",
      borderRadius: "8px",
      padding: "1px",
      cursor: "pointer",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
      zIndex: 9999,
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? isDarkMode
          ? "#4B5563"
          : "#E5E7EB"
        : state.isFocused
        ? isDarkMode
          ? "#374151"
          : "#F3F4F6"
        : isDarkMode
        ? "#1F2937"
        : "#FFFFFF",
      color: isDarkMode ? "#F9FAFB" : "#111827",
      cursor: "pointer",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: isDarkMode ? "#F9FAFB" : "#111827",
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

  return (
    <Select
      required={isRequired}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isDisabled={isDisabled}
      className={`${className}`}
      isMulti={isMulti}
      classNamePrefix="react-select"
      styles={customStyles}
      components={customComponents}
    />
  );
};

export default SelectComponentSetting;
