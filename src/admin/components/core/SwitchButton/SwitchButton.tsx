"use client";
import React from "react";
import Icon from "../Icon/Icon";

interface SwitchButtonProps {
  label?: string;
  isOn: boolean | any;
  onToggle: (value: boolean) => void;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({
  label,
  isOn,
  onToggle,
}) => {
  const handleToggle = () => {
    onToggle(!isOn);
  };

  return (
    <div className="flex items-center justify-end gap-2 min-w-32">
      <div className="flex items-center">
        <Icon
          name={`${label === "Online" ? "offline_bolt" : "no_accounts"}`}
          className={`${
            label === "Online" ? "text-green-600" : "text-gray-500"
          }`}
        />
        <span
          className={` text-lg font-medium font-poppins ml-1 ${
            label === "Online" ? "text-green-600" : "text-gray-500"
          }`}
        >
          {label}
        </span>
      </div>

      <div
        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
          isOn ? "bg-green-500" : "bg-gray-300"
        }`}
        onClick={handleToggle}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
            isOn ? "translate-x-6" : "translate-x-0"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default SwitchButton;
