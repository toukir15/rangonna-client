interface TermsCheckboxProps {
  name: string;
  checked?: boolean;
  onChange?: (name: string, checked: boolean) => void;
  errorText?: any;
  className?: string;
  label?: string;
  rightLabel?: string;
  labelClassName?: string;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  name,
  checked,
  onChange,
  errorText,
  className = "",
  label,
  rightLabel,
  labelClassName,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(name, e.target.checked);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center">
        <input
          id={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="mr-2 w-4.5 h-4.5 border-gray-300"
        />
        <div
          className={`${labelClassName} text-sm text-gray-600 font-normal cursor-pointer `}
        >
          <label
            htmlFor={name}
            className="text-base cursor-pointer text-nowrap"
          >
            {label}
          </label>
          {/* {rightLabel && (
            <span className="text-gray-400 ms-2 text-base">{rightLabel}</span>
          )} */}
        </div>
      </div>
      {errorText && <p className="text-danger text-sm mt-1">{errorText}</p>}
    </div>
  );
};

export default TermsCheckbox;
