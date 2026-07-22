"use client";
import Button from "@/@components/core/Button/Button";
import HTMLParser from "@/@components/core/HtmlParser/HtmlParser";
import Icon from "@/@components/core/Icon/Icon";
import React from "react";

interface DescriptionSectionProps {
  description: string;
  showMore: boolean;
  toggleShowMore: () => void;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  showMore,
  toggleShowMore,
}) => {
  return (
    <div className="rounded-lg bg-white">
      <div
        className={`p-10 ${showMore ? "h-full" : "h-[500px] overflow-hidden"}`}
      >
        <HTMLParser htmlContent={description} />
      </div>
      <div className="flex items-center justify-center pb-8">
        <Button
          onClick={toggleShowMore}
          className="mt-4 !px-6 !py-1 bg-primary text-white rounded hover:bg-primary transition cursor-pointer !flex !font-bold"
        >
          {showMore ? "View Less" : "View More"}
          <Icon name={showMore ? "keyboard_arrow_up" : "keyboard_arrow_down"} />
        </Button>
      </div>
    </div>
  );
};

export default DescriptionSection;
