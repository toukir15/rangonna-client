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
export const tableHeaderRowClass = "";
export const tableHeaderCellClass = "";
export const tableBodyRowClass = "";

export const Table: React.FC<ITablePart> = ({ children, className }) => (
  <table className={`data-table admin-data-table ${className ?? ""}`}>
    {children}
  </table>
);

export const Thead: React.FC<ITablePart> = ({ children, className }) => (
  <thead className={className ?? ""}>{children}</thead>
);

export const Tbody: React.FC<ITablePart> = ({ children, className }) => (
  <tbody className={className ?? ""}>{children}</tbody>
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
  <th id={id} colSpan={colSpan} className={className ?? ""}>
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
    className={`${noPadding ? "!p-0" : ""} ${className ?? ""}`}
  >
    {children}
  </td>
);
