"use client";
import React, { useContext, useState } from "react";
import { ContentsContext } from "@/app/admin/contents/page";
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
    return <div>Loading...</div>;
  }

  return (
    <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
      {contentsData?.map((item: any, index: number) => (
        <TemplateCard
          key={item?._id || index}
          title={item?.title}
          subtitle={item?.subtitle}
          copyText={item?.copyText || item?.description || ""}
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
