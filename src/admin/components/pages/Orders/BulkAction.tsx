import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import SelectComponent from "@admin/components/core/Select/Select";
import React from "react";

const BulkAction = ({
  selectedAction,
  setSelectedAction,
  handleBulkAction,
  statusSubmitting,
}: any) => {
  const selectOptions = [
    {
      label: "Transit",
      value: "in-transit",
    },
    {
      label: "Printed",
      value: "printed",
    },
  ];

  return (
    <div className="flex items-center lg:space-x-3 space-x-2 z-50">
      <SelectComponent
        options={selectOptions}
        value={selectedAction?.value}
        onChange={(e: any) => setSelectedAction(e.value)}
        placeholder="Select Bulk Action"
        className="md:w-52 w-full md:mt-0 mt-3"
      />

      <div className="flex items-end justify-end md:mt-0 mt-3 min-w-[120px]">
        <Button
          onClick={handleBulkAction}
          disabled={selectedAction?.value === ""}
          className="py-1.5 px-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          {statusSubmitting ? <ButtonLoader /> : "Apply Status"}
        </Button>
      </div>
    </div>
  );
};

export default BulkAction;
