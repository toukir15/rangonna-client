"use client";

import React from "react";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import parse from "html-react-parser";
import { useGlobalContext } from "@admin/context/GlobalContext";

interface TemplateCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  copyText: string;
  onEdit?: () => void;

  // drag and drop props
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;

  isPriorityEditMode?: boolean;
  priorityNumber?: number;
  className?: string;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  title,
  subtitle,
  copyText,
  onEdit,
  draggable,
  onDragStart,
  onDragOver,
  onDragEnd,
  isPriorityEditMode = false,
  priorityNumber,
  className = "",
}) => {
  const { permissionList } = useGlobalContext();

  const handleCopy = async () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(copyText, "text/html");

    const plainText = Array.from(doc.body.children)
      .map((el) => el.textContent?.trim())
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(plainText);
    ToastService.success("টেক্সট কপি হয়েছে 📋");
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`${isPriorityEditMode ? "cursor-move" : ""} ${className}`}
    >
      <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-500 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col dark:bg-gray-800">
        {(isPriorityEditMode || priorityNumber) && (
          <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-300">
            {isPriorityEditMode && (
              <Icon name="drag_indicator" className="cursor-grab" />
            )}
            {priorityNumber !== undefined && isPriorityEditMode && (
              <span className="text-xs font-medium">#{priorityNumber}</span>
            )}
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center text-xl">
              ⭐
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">
                {title}
              </h3>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>

          {!isPriorityEditMode &&
            permissionList.includes("content_edit") &&
            onEdit && (
              <Icon
                onClick={onEdit}
                name="edit_square"
                className="text-gray-500 cursor-pointer"
              />
            )}
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-600 border dark:border-gray-400 p-4 text-sm text-gray-800 whitespace-pre-line leading-relaxed mb-4 dark:text-gray-300">
          {parse(copyText)}
        </div>

        {!isPriorityEditMode && (
          <button
            onClick={handleCopy}
            className="mt-auto w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 active:scale-[0.98] transition"
          >
            📋 Copy Text
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
