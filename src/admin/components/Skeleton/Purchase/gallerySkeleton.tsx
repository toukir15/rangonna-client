import React from "react";
import Skeleton from "../Skeleton";

const GallerySkeleton: React.FC = () => {
  return (
    <div className="w-full  dark:bg-gray-700 rounded-lg grid grid-cols-4  ">
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 ">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 ">
        <Skeleton type="text" count={1} height={230} />
      </div>

      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
      <div className="opacity-70 dark:opacity-50 rounded-2xl p-2 w-full">
        <Skeleton type="text" count={1} height={230} />
      </div>
    </div>
  );
};

export default GallerySkeleton;
