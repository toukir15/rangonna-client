"use client";

import { MenuCategoryOption } from "./menuCategory";

type MenuCategorySelectProps = {
  value?: string;
  options: MenuCategoryOption[];
  onChange: (categoryId: string) => void;
};

export default function MenuCategorySelect({
  value,
  options,
  onChange,
}: MenuCategorySelectProps) {
  return (
    <select
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-600 dark:text-white"
    >
      <option value="">Custom route</option>
      {options.map((row) => (
        <option key={row._id} value={row._id}>
          {row.key}
        </option>
      ))}
    </select>
  );
}
