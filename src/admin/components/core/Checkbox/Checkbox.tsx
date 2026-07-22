import React from "react";

interface CheckboxProps {
  label?: string;
  value: string;
  register: any;
  name?: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps | any> = ({
  label,
  value,
  register,
  name,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center space-x-2 cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        value={value}
        disabled={disabled}
        {...register(name || value)}
        className="form-checkbox h-4 w-4 text-blue-600 "
      />
      <span className="text-gray-800 dark:text-gray-300">{label}</span>
    </label>
  );
};

export default Checkbox;
