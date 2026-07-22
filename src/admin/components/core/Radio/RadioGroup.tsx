import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  register: any;
  errorText?: string;
  className?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  register,
  errorText,
  className,
}) => {
  return (
    <div className={`${className ? className : "flex flex-col"}`}>
      {options.map((option, index) => (
        <div key={index} className="flex items-center mb-2">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            value={option.value}
            {...register(name)}
            className="mr-2 h-5 w-5"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="text-sm text-gray-600 font-normal cursor-pointer dark:text-gray-300"
          >
            {option.label}
          </label>
        </div>
      ))}
      {errorText && <p className="text-red-500 text-sm mt-1">{errorText}</p>}
    </div>
  );
};

export default RadioGroup;
