"use client";
import React from "react";

interface SwitchProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  isChecked,
  onChange,
  label,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-gray-700 text-sm font-semibold dark:text-gray-300">
          {label}
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(!isChecked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
          isChecked ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            isChecked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};

export default Switch;
