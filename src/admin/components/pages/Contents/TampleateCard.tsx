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
      <div className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-sm transition hover:border-[var(--brand-border-soft)]">
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
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-bg-softer)] text-[var(--color-primary)]">
              <Icon name="article" size={20} />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
              )}
            </div>
          </div>

          {!isPriorityEditMode &&
            permissionList.includes("content_edit") &&
            onEdit && (
              <Icon
                onClick={onEdit}
                name="edit_square"
                className="cursor-pointer text-[var(--text-muted)]"
              />
            )}
        </div>

        <div className="mb-4 whitespace-pre-line rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-4 text-sm leading-relaxed text-[var(--text-secondary)]">
          {copyText ? parse(copyText) : "No description"}
        </div>

        {!isPriorityEditMode && (
          <button
            type="button"
            onClick={handleCopy}
            className="btn-primary mt-auto w-full rounded-xl py-2.5 text-sm font-semibold"
          >
            Copy text
          </button>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
