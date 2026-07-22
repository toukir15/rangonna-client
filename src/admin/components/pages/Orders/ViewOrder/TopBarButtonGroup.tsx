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
    <div className={`order-4 md:mt-0 mt-10 md:w-auto w-full ${className}`}>
      <div className="flex items-center md:justify-normal justify-between md:space-x-6">
        {buttons.map((button, index) => {
          const isThisLoading = activeLoadingName === button.name;

          return (
            <button
              key={index}
              className={`rounded-md relative group disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
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
                className={`text-${button.color} ${
                  isThisLoading ? "animate-spin" : ""
                }`}
                size={button.size}
              />

              <span
                className={`absolute dark:bg-gray-600 dark:text-gray-300 bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-200 text-black font-semibold text-xs px-4 py-1 rounded-md ${tooltipClassName}`}
              >
                {button.name}
              </span>
            </button>
          );
        })}
      </div>

      {showClearButton && (
        <div className="flex items-end justify-end">
          <Button
            className="bg-blue-500 text-white !px-2 !py-0.5 rounded-lg !text-xs cursor-pointer"
            onClick={onClearClick}
          >
            {isPrinting ? (
              <ButtonLoader className="!w-6 !px-2 !pt-0.5" />
            ) : (
              "Clear"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopBarButtonGroup;
