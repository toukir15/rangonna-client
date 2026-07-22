/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
"use client";
import React, {
  ChangeEvent,
  JSX,
  MouseEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
export const generateId = () => Math.floor(100000 + Math.random() * 900000);

type Type =
  | "text"
  | "textarea"
  | "email"
  | "password"
  | "number"
  | "phone"
  | "date"
  | "time";
type Variant = "outlined" | "filled" | "none";

interface IInputProps {
  label?: string | JSX.Element;
  placeholder?: string;
  onChange?: Function;
  onBlur?: Function;
  onClick?: Function;
  onFocus?: Function;
  type?: Type;
  variant?: Variant;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
  isDisabled?: boolean;
  errorText?: string | any;
  min?: number;
  max?: number;
  maxLength?: number;
  defaultValue?: string | number;
  value?: string | number;
  registerProperty?: any;
  leftHelpText?: string | JSX.Element;
  helpText?: string | JSX.Element;
  ref?: React.Ref<HTMLInputElement>;
  id?: string;
  classNames?: string;
  isRequired?: boolean;
  noMargin?: boolean;
  noBorder?: boolean;
  inputClass?: string;
  staticText?: string;
  handleIconClick?: any;
  leftDisabledText?: string;
}

const Input: React.FC<IInputProps> = ({
  label,
  placeholder,
  onChange,
  onBlur,
  onClick,
  onFocus,
  type = "text",
  iconRight,
  defaultValue = "",
  value,
  min,
  max,
  maxLength,
  errorText,
  isDisabled,
  ref,
  registerProperty,
  leftHelpText,
  helpText,
  id,
  classNames,
  isRequired = false,
  noMargin = false,
  noBorder = false,
  staticText,
  inputClass = "py-2 px-4 h-[45px]",
  handleIconClick,
  leftDisabledText,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(
    defaultValue?.toString()
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handleClick = (
    e: MouseEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onClick && onClick(e);
  };

  const handleFocus = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setIsFocused(false);
    onBlur && onBlur(e);
    registerProperty && registerProperty.onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setInputValue(value);
    onChange && onChange(e);
    registerProperty && registerProperty.onChange(e);
  };

  const myRef: any = useRef(null);

  useLayoutEffect(() => {
    if (registerProperty && myRef?.current?.value) {
      setInputValue(myRef.current.value);
    }
  }, [registerProperty]);

  return (
    <div
      className={`relative ${classNames ? classNames : ""} ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        }  w-full ${!noMargin ? "md:mt-3 sm:mt-4 xs:mt-4 md:mb-3" : ""}`}
    >
      <div className="relative">
        {label ? (
          <label
            htmlFor={
              id
                ? id
                : registerProperty?.name
                  ? registerProperty.name
                  : generateId()
            }
            className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1"
          >
            {label}{" "}
            {isRequired ? (
              <span className="text-red-400 font-inter text-[12px] font-semibold">
                *
              </span>
            ) : null}
          </label>
        ) : null}

        {/* Container for input and left disabled text */}
        <div className="flex items-center">
          {leftDisabledText && (
            <div className="bg-gray-100 text-gray-500 px-3 py-2 h-[45px] flex items-center border border-r-0 rounded-l-lg border-neutral-300 dark:border-gray-500">
              {leftDisabledText}
            </div>
          )}

          {/* input start*/}
          {type !== "textarea" && (
            <input
              type={
                type === "password"
                  ? isPasswordVisible
                    ? "text"
                    : "password"
                  : type
              }
              id={
                id
                  ? id
                  : registerProperty?.name
                    ? registerProperty.name
                    : generateId()
              }
              className={`relative bg-white dark:bg-gray-800 dark:text-gray-300 dark:border-gray-500 ${!noBorder ? "border" : ""
                } font-inter font-medium text-sm ${!errorText && !isFocused && inputValue
                  ? "border-green-500 bg-white"
                  : errorText
                    ? "border-red-400 bg-white"
                    : isFocused
                      ? "border-cyan-500 bg-white"
                      : "border-neutral-300 bg-white"
                } outline-none bg-white rounded-lg w-full xs:placeholder:text-[14px] ${inputClass} ${leftDisabledText ? "rounded-l-none" : ""
                }`}
              ref={(el) => {
                myRef.current = el;
                registerProperty && registerProperty.ref(el);
              }}
              name={registerProperty ? registerProperty.name : ""}
              min={min}
              max={max}
              key={registerProperty}
              maxLength={maxLength}
              placeholder={placeholder}
              defaultValue={defaultValue}
              value={value && value}
              onClick={(e: MouseEvent<HTMLInputElement>) => handleClick(e)}
              onFocus={(e: ChangeEvent<HTMLInputElement>) => handleFocus(e)}
              onBlur={(e: ChangeEvent<HTMLInputElement>) => handleBlur(e)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
              onWheel={handleWheel}
            />
          )}
        </div>

        {staticText && (
          <span
            className={`absolute inset-y-0 top-6 right-0 flex items-center pr-5 text-sm  ${isFocused ? "text-text-primary" : " text-[#B9BDC7]"
              }   font-medium font-inter`}
          >
            {staticText}
          </span>
        )}

        {type === "textarea" && (
          <textarea
            id={
              id
                ? id
                : registerProperty?.name
                  ? registerProperty.name
                  : generateId()
            }
            className={`relative min-h-[100px] ${!noBorder ? "border" : ""
              } font-inter font-medium text-sm ${!errorText && !isFocused && inputValue
                ? "border-green-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                : errorText
                  ? "border-red-400 bg-white dark:bg-gray-700 dark:text-gray-300"
                  : isFocused
                    ? "border-cyan-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                    : "border-neutral-300 bg-white dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300"
              } outline-none px-6 py-2 rounded-lg w-full placeholder:text-neutral-200`}
            placeholder={placeholder}
            ref={registerProperty ? registerProperty.ref : ref}
            name={registerProperty ? registerProperty.name : name}
            defaultValue={defaultValue}
            value={value && value}
            onClick={(e: MouseEvent<HTMLTextAreaElement>) => handleClick(e)}
            onFocus={(e: ChangeEvent<HTMLTextAreaElement>) => handleFocus(e)}
            onBlur={(e: ChangeEvent<HTMLTextAreaElement>) => handleBlur(e)}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(e)}
          ></textarea>
        )}

        {type !== "textarea" && (iconRight || type) ? (
          <div className="flex items-center absolute right-4 top-9 cursor-pointer">
            {type === "password" ? (
              isPasswordVisible ? (
                <span
                  onClick={togglePasswordVisibility}
                  className="material-icons-outlined text-neutral-400"
                >
                  visibility
                </span>
              ) : (
                <span
                  onClick={togglePasswordVisibility}
                  className="material-icons-outlined text-neutral-400"
                >
                  visibility_off
                </span>
              )
            ) : (
              <div className="-mt-6" onClick={handleIconClick}>
                {iconRight}
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
      {errorText && <h3 className="text-red-400 text-xs mt-1">{errorText}</h3>}

      {leftHelpText && helpText && (
        <div className="flex justify-between items-center mt-5">
          <div className="flex items-center gap-2">
            {leftHelpText && <div>{leftHelpText}</div>}
          </div>
          <div className="flex justify-end font-inter hover:text-primary-500 text-sm text-dark-500 cursor-pointer ">
            {helpText === "string" ? <h4>{helpText}</h4> : helpText}
          </div>
        </div>
      )}
    </div>
  );
};

export default Input;
