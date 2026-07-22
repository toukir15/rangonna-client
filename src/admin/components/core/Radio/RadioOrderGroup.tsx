import React from "react";
interface Option {
  value: string;
  label: string;
  price?: number;
  [key: string]: any;
}
interface RadioGroupProps {
  name: string;
  options: Option[];
  value?: any;
  onChange?: (selected: { value: string; price?: number }) => void;
  errorText?: string;
  className?: string;
  disabled?: boolean;
}

const RadioOrderGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  errorText,
  className = "flex flex-col",
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    if (onChange && selectedOption) {
      onChange({
        value: selectedValue,
        price: selectedOption.price,
      });
    }
  };

  return (
    <div className={className}>
      {options?.map((option, index) => (
        <label
          key={`${name}-${option.value}-${index}`}
          htmlFor={`${name}-${option.value}`}
          className={`
            flex items-center dark:border-gray-500 mb-2 border rounded-lg px-4 py-1.5 cursor-pointer
            ${
              value === option.value
                ? "bg-green-50 border-green-500 dark:bg-gray-600"
                : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 "
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-green-300"
            }
            transition-colors duration-200
          `}
        >
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={handleChange}
            disabled={disabled}
            className="
              mr-3 h-4 w-4
              appearance-none
              rounded-full
              border-2
              border-gray-300
              checked:border-green-500
              checked:bg-white
              checked:ring-2
              checked:ring-green-200
              focus:outline-none
              focus:ring-2
              focus:ring-green-300
              transition-all
              duration-200
              relative
              after:content-['']
              after:absolute
              after:top-1/2
              after:left-1/2
              after:-translate-x-1/2
              after:-translate-y-1/2
              after:w-2 p-[7px]
              after:h-2 p-[7px
              after:rounded-full
              after:bg-green-500
              after:opacity-0
              checked:after:opacity-100
            "
            aria-describedby={errorText ? `${name}-error` : undefined}
          />

          <div className="flex items-center justify-between w-full">
            <span className="text-base font-medium text-gray-800 dark:text-gray-300">
              {option.label}
            </span>
            {option.price !== undefined && (
              <span className="text-base font-semibold text-green-600">
                ৳{option.price.toFixed(2)}
              </span>
            )}
          </div>
        </label>
      ))}

      {errorText && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500">
          {errorText}
        </p>
      )}
    </div>
  );
};

export default RadioOrderGroup;
