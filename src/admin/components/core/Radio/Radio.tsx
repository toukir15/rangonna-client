import React from "react";

interface TermsRadioProps {
  name: string;
  value: string;
  registerProperty: any;
  errorText?: any;
  termsLink?: string;
  className?: string;
  label?: string;
  linkLabel?: string;
}

const Radio: React.FC<TermsRadioProps> = ({
  name,
  value,
  registerProperty,
  errorText,
  termsLink,
  className = "",
  label,
  linkLabel,
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center">
        <input
          id={`${name}-${value}`}
          type="radio"
          value={value}
          {...registerProperty}
          className="mr-2"
        />
        <label
          htmlFor={`${name}-${value}`}
          className="text-sm text-gray-600 font-normal cursor-pointer dark:text-gray-300"
        >
          {label}

          <a
            href={termsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline ms-2"
          >
            {linkLabel}
          </a>
        </label>
      </div>
      {errorText && <p className="text-red-500 text-sm mt-1">{errorText}</p>}
    </div>
  );
};

export default Radio;
