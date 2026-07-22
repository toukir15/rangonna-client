import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void;
}

export const TableCheckbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  onClick,
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={onClick}
      className="form-checkbox h-4 w-4 text-primary-500 bg-blue-900 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
    />
  );
};
