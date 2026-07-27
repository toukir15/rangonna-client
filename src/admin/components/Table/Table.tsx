import React, { ReactNode } from "react";

interface ITablePart {
  children: ReactNode;
  className?: string;
  id?: string;
  noPadding?: boolean;
  colSpan?: number;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>) => void;
}

/** Shared row/cell classes for pages that opt in */
export const tableHeaderRowClass =
  "border-b border-black/10 bg-green-50/95 dark:border-white/10 dark:bg-gray-900/95";
export const tableHeaderCellClass =
  "whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-green-800/90 dark:text-green-300/90";
export const tableBodyRowClass =
  "border-b border-black/5 transition-colors hover:bg-gray-50/80 dark:border-white/5 dark:hover:bg-gray-800/45";

export const Table: React.FC<ITablePart> = ({ children, className }) => (
  <table className={`w-full border-collapse text-left ${className ?? ""}`}>
    {children}
  </table>
);

export const Thead: React.FC<ITablePart> = ({ children, className }) => (
  <thead
    className={`sticky top-0 z-[2] bg-green-50/95 backdrop-blur-sm dark:bg-gray-900/95 ${
      className ?? ""
    }`}
  >
    {children}
  </thead>
);

export const Tbody: React.FC<ITablePart> = ({ children, className }) => (
  <tbody
    className={`divide-y divide-black/5 bg-white dark:divide-white/5 dark:bg-gray-900/20 ${
      className ?? ""
    }`}
  >
    {children}
  </tbody>
);

export const Tr: React.FC<ITablePart> = ({
  children,
  className,
  id,
  onClick,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => (
  <tr
    id={id}
    className={className ?? ""}
    onClick={onClick}
    draggable={draggable}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
  >
    {children}
  </tr>
);

export const Th: React.FC<ITablePart> = ({
  children,
  className,
  id,
  colSpan,
}) => (
  <th
    id={id}
    colSpan={colSpan}
    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 border-b border-black/10 dark:border-white/10 dark:text-gray-300 ${
      className ?? ""
    }`}
  >
    {children}
  </th>
);

export const Td: React.FC<ITablePart> = ({
  children,
  className,
  id,
  noPadding,
  onClick,
  colSpan,
}) => (
  <td
    id={id}
    colSpan={colSpan}
    onClick={onClick}
    className={`${
      noPadding ? "" : "px-4 py-3"
    } align-middle text-sm text-gray-700 dark:text-gray-300 ${
      className ?? ""
    }`}
  >
    {children}
  </td>
);
