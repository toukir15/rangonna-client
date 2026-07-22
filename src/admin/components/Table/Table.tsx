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

export const Table: React.FC<ITablePart> = ({ children, className }) => (
  <table className={`w-full text-left border-collapse ${className ?? ""}`}>
    {children}
  </table>
);

export const Thead: React.FC<ITablePart> = ({ children, className }) => (
  <thead className={`bg-gray-100 ${className ?? ""}`}>{children}</thead>
);

export const Tbody: React.FC<ITablePart> = ({ children, className }) => (
  <tbody className={className ?? "bg-white"}>{children}</tbody>
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
    className={`px-4 py-2 text-sm font-semibold text-gray-700 border-b dark:border-gray-700 ${
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
      noPadding ? "" : "px-4 py-2"
    } text-sm text-gray-600 dark:text-gray-300 dark:border-gray-700 border-b ${
      className ?? ""
    }`}
  >
    {children}
  </td>
);

// import React, { ReactNode } from "react";

// interface ITablePart {
//   children: ReactNode;
//   className?: string;
//   id?: string;
//   noPadding?: boolean;
//   colSpan?: any;
//   onClick?: (event: any) => void | any;
// }

// export const Table: React.FC<ITablePart> = ({ children, className }) => (
//   <table className={`w-full text-left border-collapse ${className ?? ""}`}>
//     {children}
//   </table>
// );

// export const Thead: React.FC<ITablePart> = ({ children, className }) => (
//   <thead className={`bg-gray-100 ${className ?? ""}`}>{children}</thead>
// );

// export const Tbody: React.FC<ITablePart> = ({ children, className }) => (
//   <tbody className={className ?? "bg-white"}>{children}</tbody>
// );

// export const Tr: React.FC<ITablePart> = ({
//   children,
//   className,
//   id,
//   onClick,
// }) => (
//   <tr id={id} className={className ?? ""} onClick={onClick}>
//     {children}
//   </tr>
// );

// export const Th: React.FC<ITablePart> = ({ children, className, id }) => (
//   <th
//     id={id}
//     className={`px-4 py-2 text-sm font-semibold text-gray-700 border-b dark:border-gray-700 ${
//       className ?? ""
//     }`}
//   >
//     {children}
//   </th>
// );

// export const Td: React.FC<ITablePart> = ({
//   children,
//   className,
//   id,
//   noPadding,
//   onClick,
// }) => (
//   <td
//     id={id}
//     onClick={onClick}
//     className={`${
//       noPadding ? "" : "px-4 py-2"
//     } text-sm text-gray-600 dark:text-gray-300 dark:border-gray-700 border-b ${
//       className ?? ""
//     }`}
//   >
//     {children}
//   </td>
// );

// import React, { ReactNode } from "react";

// interface ITablePart {
//   children: ReactNode;
//   className?: string;
//   id?: string;
//   noPadding?: boolean;
//   colSpan?: any;
//   onClick?: (event: any) => void | any;
// }

// export const Table: React.FC<ITablePart> = ({ children, className }) => (
//   <table className={`w-full text-left border-collapse ${className ?? ""}`}>
//     {children}
//   </table>
// );

// export const Thead: React.FC<ITablePart> = ({ children, className }) => (
//   <thead
//     className={`bg-gray-100 sticky top-0 z-10 dark:bg-gray-800 ${
//       className ?? ""
//     }`}
//   >
//     {children}
//   </thead>
// );

// export const Tbody: React.FC<ITablePart> = ({ children, className }) => (
//   <tbody className={className ?? "bg-white"}>{children}</tbody>
// );

// export const Tr: React.FC<ITablePart> = ({
//   children,
//   className,
//   id,
//   onClick,
// }) => (
//   <tr id={id} className={className ?? ""} onClick={onClick}>
//     {children}
//   </tr>
// );

// export const Th: React.FC<ITablePart> = ({ children, className, id }) => (
//   <th
//     id={id}
//     className={`px-4 py-2 text-sm font-semibold text-gray-700 border-b dark:border-gray-700 text-nowrap  ${
//       className ?? ""
//     }`}
//   >
//     {children}
//   </th>
// );

// export const Td: React.FC<ITablePart> = ({
//   children,
//   className,
//   id,
//   noPadding,
//   onClick,
// }) => (
//   <td
//     id={id}
//     onClick={onClick}
//     className={`${
//       noPadding ? "" : "px-4 py-2"
//     } text-sm text-gray-600 dark:text-gray-300 dark:border-gray-700 border-b ${
//       className ?? ""
//     }`}
//   >
//     {children}
//   </td>
// );
