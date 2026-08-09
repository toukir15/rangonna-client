import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import React, { useState } from "react";

interface ButtonItem {
  name: string;
  icon: string;
  variant?: "filled" | "outlined";
  color: string;
  onClick: () => void | Promise<void>;
  hasBadge?: boolean;
  badgeContent?: React.ReactNode;
  size?: number;
}

interface ButtonGroupProps {
  buttons: Array<ButtonItem>;
  showClearButton?: boolean;
  onClearClick?: () => void | Promise<void>;
  className?: string;
  buttonClassName?: string;
  tooltipClassName?: string;
  isLoadingExternal?: boolean;
  loadingForExternalName?: string;
  loading?: boolean;
  isPrinting?: boolean;
}

const TopBarButtonGroup: React.FC<ButtonGroupProps> = ({
  buttons,
  className = "",
  buttonClassName = "",
  tooltipClassName = "",
  isLoadingExternal,
  loadingForExternalName,
  showClearButton,
  isPrinting,
  onClearClick,
}) => {
  const [localLoadingName, setLocalLoadingName] = useState<string | null>(null);

  const activeLoadingName =
    typeof isLoadingExternal === "boolean" && loadingForExternalName
      ? isLoadingExternal
        ? loadingForExternalName
        : null
      : localLoadingName;

  const handleClick = async (btn: ButtonItem) => {
    try {
      if (!(typeof isLoadingExternal === "boolean" && loadingForExternalName)) {
        setLocalLoadingName(btn.name);
      }

      const maybePromise = btn.onClick?.();
      if (
        maybePromise &&
        typeof (maybePromise as Promise<void>).then === "function"
      ) {
        await (maybePromise as Promise<void>);
      }
    } finally {
      if (!(typeof isLoadingExternal === "boolean" && loadingForExternalName)) {
        setLocalLoadingName(null);
      }
    }
  };

  return (
    <div
      className={`ov-actions order-4 md:mt-0 mt-6 md:w-auto w-full flex-wrap ${className}`}
    >
      {buttons.map((button, index) => {
        const isThisLoading = activeLoadingName === button.name;

        return (
          <button
            key={index}
            className={`ov-action-btn relative group disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
            onClick={() => handleClick(button)}
            disabled={!!isThisLoading}
            aria-busy={isThisLoading}
            aria-label={button.name}
            type="button"
          >
            {button.hasBadge && button.badgeContent}

            <Icon
              name={isThisLoading ? "autorenew" : button.icon}
              variant={button.variant || "outlined"}
              className={isThisLoading ? "animate-spin" : ""}
              size={button.size || 20}
            />

            <span
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-[var(--text-primary)] text-[var(--bg-surface)] font-semibold text-[10px] tracking-wide px-2.5 py-1 rounded-md whitespace-nowrap z-10 ${tooltipClassName}`}
            >
              {button.name}
            </span>
          </button>
        );
      })}

      {showClearButton && (
        <Button className="ov-clear-btn" onClick={onClearClick}>
          {isPrinting ? (
            <ButtonLoader className="!w-6 !px-2 !pt-0.5" />
          ) : (
            "Clear"
          )}
        </Button>
      )}
    </div>
  );
};

export default TopBarButtonGroup;
