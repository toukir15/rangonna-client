import React from "react";

interface ToggleSwitchProps {
  isChecked: boolean;
  onToggle: () => void;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isChecked,
  onToggle,

  disabled = false,
}) => {
  return (
    <div
      className={`flex items-center space-x-2 cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={() => {
        if (!disabled) onToggle();
      }}
    >
      <span
        className={`text-sm font-medium ${
          isChecked ? "text-green-600" : "text-gray-500"
        }`}
      >
        {/* {isChecked ? onLabel : offLabel} */}
      </span>

      <div
        className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${
          isChecked ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute left-0 top-0 w-6 h-6 bg-white border border-gray-300 rounded-full shadow transform transition-transform duration-200 ease-in-out ${
            isChecked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
};

export default ToggleSwitch;
