"use client";

import React, { useLayoutEffect } from "react";
import {
  getPaymentMethodLabelContent,
  PAYMENT_METHOD_LOGOS,
} from "./PaymentMethodLogos";

export interface PaymentOption {
  value: string;
  label: string;
  showEmiBadge?: boolean;
  showCashbackBadge?: boolean;
}

interface PaymentMethodRadioGroupProps {
  name: string;
  options: PaymentOption[];
  value?: string | null;
  onChange?: (selected: { value: string }) => void;
  errorText?: string;
  disabled?: boolean;
}

const PaymentMethodRadioGroup: React.FC<PaymentMethodRadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  errorText,
  disabled = false,
}) => {
  useLayoutEffect(() => {
    const links: HTMLLinkElement[] = [];

    Object.values(PAYMENT_METHOD_LOGOS).forEach((logo) => {
      if (!logo) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = logo.src;
      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, []);

  const handleChange = (selectedValue: string) => {
    if (disabled) return;
    onChange?.({ value: selectedValue });
  };

  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => {
        const isSelected = value === option.value;

        return (
          <label
            key={`${name}-${option.value}-${index}`}
            htmlFor={`${name}-${option.value}`}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors ${
              isSelected
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-gray-50 hover:border-green-300"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => handleChange(option.value)}
              disabled={disabled}
              className="
                h-4 w-4 shrink-0
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
                after:w-2
                after:h-2
                after:rounded-full
                after:bg-green-500
                after:opacity-0
                checked:after:opacity-100
              "
              aria-describedby={errorText ? `${name}-error` : undefined}
            />

            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-sm font-medium text-gray-800">
              {getPaymentMethodLabelContent(option.value, option.label)}

              {option.showCashbackBadge && (
                <span className="rounded bg-primary px-1.5 py-1 text-md font-extrabold text-white">
                  10% Cashback
                </span>
              )}

              {option.showEmiBadge && (
                <span className="rounded bg-primary px-1.5 py-1 text-md font-extrabold text-white">
                  EMI Available
                </span>
              )}
            </div>
          </label>
        );
      })}

      {errorText && (
        <p id={`${name}-error`} className="text-sm text-danger">
          {errorText}
        </p>
      )}
    </div>
  );
};

export default PaymentMethodRadioGroup;
