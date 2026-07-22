"use client";
import { useState, KeyboardEvent, ChangeEvent } from "react";

interface MultiValueInputProps {
  onValuesChange?: (values: string[]) => void;
  initialValues?: string[];
  placeholder?: string;
  label?: string;
  isRequired?: boolean;
  id?: string;
  registerProperty?: { name: string };
}

const generateId = () => `input-${Math.random().toString(36).substr(2, 9)}`;

const MultiValueInput = ({
  onValuesChange,
  initialValues = [],
  placeholder = "Type and press Enter to add",
  label,
  isRequired = false,
  id,
  registerProperty,
}: MultiValueInputProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [values, setValues] = useState<string[]>(initialValues);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      addValue();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addValue = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !values.includes(trimmedValue)) {
      const newValues = [...values, trimmedValue];
      setValues(newValues);
      setInputValue("");
      onValuesChange?.(newValues);
    }
  };

  const removeValue = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
    onValuesChange?.(newValues);
  };

  return (
    <div className="w-full">
      {label ? (
        <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
          {label}{" "}
          {isRequired ? (
            <span className="text-red-400 font-inter text-[12px] font-semibold">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="multi-value-input rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
        <div className="value-container p-0.5">
          {values.map((value, index) => (
            <span
              key={index}
              className="value-tag bg-gray-100 dark:bg-gray-700 rounded-md px-2 py-1"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(index)}
                aria-label={`Remove ${value}`}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={addValue}
            placeholder={placeholder}
            aria-label="Add multiple values"
            className="flex-1 min-w-[100px] bg-transparent outline-none px-2 py-0.5"
            id={
              id
                ? id
                : registerProperty?.name
                ? registerProperty.name
                : generateId()
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MultiValueInput;
