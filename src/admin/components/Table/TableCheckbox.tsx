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
      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-green-600 focus:ring-green-500/30 dark:border-gray-600 dark:bg-gray-800"
    />
  );
};
