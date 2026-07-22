import React from "react";

const SelectWebsite = () => {
  return (
    <div className="absolute inset-0 z-10 top-12 min-h-[700px]">
      <div className="relative flex items-center justify-center min-h-[700px] px-4">
        <div className="px-8 pb-6">
          <h1 className=" text-3xl sm:text-4xl font-semibold tracking-tight text-center">
            Select your website
          </h1>

          <p className="mt-2 text-base  text-center">
            Please select a website before accessing the data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectWebsite;
