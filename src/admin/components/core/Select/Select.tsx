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
  /** Compact control height for toolbars / filter rows */
  size?: "default" | "sm";
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
  size = "default",
}) => {
  const { isDarkMode } = useGlobalContext();
  const [mounted, setMounted] = useState(false);
  const isSm = size === "sm";

  useEffect(() => {
    setMounted(true);
  }, []);

  const surface = "var(--bg-surface)";
  const text = "var(--text-primary)";
  const muted = "var(--text-muted)";
  const border = "var(--border)";
  const hover = "var(--bg-hover)";
  const accent = "var(--color-primary)";
  const accentSoft = "var(--accent-soft)";
  const brandBorder = "var(--brand-border-medium)";

  const customStyles: StylesConfig<Option, boolean> = {
    control: (base, { isFocused }) => ({
      ...base,
      backgroundColor: surface,
      borderColor: isFocused ? brandBorder : border,
      color: text,
      borderRadius: isSm ? "0.625rem" : "0.75rem",
      padding: isSm ? "0 2px" : "2px 4px",
      cursor: isDisabled ? "not-allowed" : "pointer",
      minHeight: isSm ? "2.25rem" : "46px",
      height: isSm ? "2.25rem" : undefined,
      fontSize: isSm ? "0.875rem" : undefined,
      boxShadow: isFocused
        ? `0 0 0 3px ${accentSoft}`
        : isDarkMode
          ? "none"
          : "0 1px 2px rgba(15, 23, 42, 0.04)",
      "&:hover": {
        borderColor: isDisabled
          ? border
          : isFocused
            ? brandBorder
            : "var(--brand-border-soft)",
      },
      opacity: isDisabled ? 0.7 : 1,
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: isSm ? "0 8px" : base.padding,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: isSm ? "2.25rem" : undefined,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: isSm ? "0 8px" : base.padding,
      color: muted,
      "&:hover": { color: accent },
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? accent
        : isFocused
          ? hover
          : surface,
      color: isSelected ? "#FFFFFF" : text,
      borderRadius: "0.5rem",
      margin: "2px 6px",
      width: "calc(100% - 12px)",
      cursor: "pointer",
      fontSize: isSm ? "0.875rem" : undefined,
      "&:active": {
        backgroundColor: accent,
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      backgroundColor: surface,
      border: `1px solid ${border}`,
      borderRadius: "0.75rem",
      overflow: "hidden",
      boxShadow: isDarkMode
        ? "0 8px 32px rgba(0, 0, 0, 0.3)"
        : "0 8px 32px rgba(15, 23, 42, 0.08)",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: accentSoft,
      borderRadius: "0.5rem",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: accent,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: muted,
      ":hover": {
        backgroundColor: isDarkMode ? "#EF4444" : "#FECACA",
        color: isDarkMode ? "#F9FAFB" : "#DC2626",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: text,
      fontSize: isSm ? "0.875rem" : undefined,
    }),
    input: (base) => ({
      ...base,
      color: text,
      margin: isSm ? 0 : base.margin,
      padding: isSm ? 0 : base.padding,
    }),
    placeholder: (base) => ({
      ...base,
      color: muted,
      fontSize: isSm ? "0.875rem" : undefined,
    }),
    indicatorSeparator: () => ({
      display: "none",
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
          className={`input-app flex items-center !py-0 ${
            isSm ? "h-9 !rounded-[0.625rem]" : "h-[46px]"
          }`}
        >
          <span className="truncate text-app-muted">{placeholder}</span>
          {showDropdownIndicator && (
            <div className="ml-auto">
              <svg
                className="h-4 w-4 text-app-muted"
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
