"use client";
import React, { useContext, useState } from "react";
import { ContentsContext } from "./contents.context";
import TemplateCard from "./TampleateCard";

const ContentCard = () => {
  const {
    contentsData,
    tableLoading,
    handleEditClick,
    isPriorityEditMode,
    setPriorityContentsData,
  } = useContext(ContentsContext);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!isPriorityEditMode) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    hoverIndex: number,
  ) => {
    e.preventDefault();

    if (
      !isPriorityEditMode ||
      draggedIndex === null ||
      draggedIndex === hoverIndex
    ) {
      return;
    }

    const updatedRows = [...contentsData];
    const draggedRow = updatedRows[draggedIndex];

    updatedRows.splice(draggedIndex, 1);
    updatedRows.splice(hoverIndex, 0, draggedRow);

    setPriorityContentsData(updatedRows);
    setDraggedIndex(hoverIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (tableLoading) {
    return (
      <div className="px-5 py-10 text-sm font-medium text-[var(--text-muted)]">
        Loading contents...
      </div>
    );
  }

  if (!contentsData?.length) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          No contents yet
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Add a content block to show it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {contentsData.map((item: any, index: number) => (
        <TemplateCard
          key={item?._id || index}
          title={item?.title}
          subtitle={item?.sub_title || item?.subtitle}
          copyText={item?.description || item?.copyText || ""}
          onEdit={() => handleEditClick(item)}
          draggable={isPriorityEditMode}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          isPriorityEditMode={isPriorityEditMode}
          priorityNumber={index + 1}
          className={draggedIndex === index ? "opacity-60" : ""}
        />
      ))}
    </div>
  );
};

export default ContentCard;
