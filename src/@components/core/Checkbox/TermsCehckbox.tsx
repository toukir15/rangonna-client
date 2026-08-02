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
    <div className={`rongonaa-check ${className}`}>
      <label htmlFor={name} className="rongonaa-check__row">
        <input
          id={name}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="rongonaa-check__input"
        />
        <span className="rongonaa-check__box" aria-hidden />
        <span className={`rongonaa-check__label ${labelClassName ?? ""}`}>
          {label}
          {/* {rightLabel && (
            <span className="text-gray-400 ms-2 text-base">{rightLabel}</span>
          )} */}
        </span>
      </label>
      {errorText && <p className="text-danger text-sm mt-1">{errorText}</p>}
    </div>
  );
};

export default TermsCheckbox;
