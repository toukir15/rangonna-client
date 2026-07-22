"use client";
import React, { ReactNode, useState } from "react";
import Button from "../Button/Button";

interface ViewMoreProps {
  children?: ReactNode;
}

const ViewMore: React.FC<ViewMoreProps> = ({ children }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="mt-4 p-4 rounded-lg bg-white border-primary-border border">
      <div className={`${showMore ? "h-full" : "h-40 overflow-hidden"}`}>
        {children}
      </div>

      {
        <div className="flex items-center justify-center">
          <Button
            onClick={() => setShowMore(!showMore)}
            className="mt-4 !px-6 !py-1 bg-primary text-white rounded hover:bg-primary transition cursor-pointer"
          >
            {showMore ? "View Less" : "View More"}
          </Button>
        </div>
      }
    </div>
  );
};

export default ViewMore;
