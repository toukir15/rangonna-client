import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";

interface PrevNextButtonsProps {
  prevOrderId?: any;
  nextOrderId?: any;
  handlePrevOrder: () => void;
  handleNextOrder: () => void;
}

const OrderPageNavigator: React.FC<PrevNextButtonsProps> = ({
  prevOrderId,
  nextOrderId,
  handlePrevOrder,
  handleNextOrder,
}) => {
  return (
    <div className="flex justify-center mb-2 sm:gap-8 gap-4">
      <Button
        className="bg-indigo-600 dark:bg-gray-700 hover:bg-indigo-700 text-white  px-4 rounded flex  !py-1 gap-2 items-center"
        onClick={handlePrevOrder}
        disabled={!prevOrderId}
      >
        <Icon
          name="arrow_back"
          variant="outlined"
          className="mt-1 dark:text-gray-300"
        />
        <p className="font-bold dark:text-gray-300">Prev Order</p>
      </Button>

      <Button
        className="bg-blue-500 dark:bg-gray-700 hover:bg-blue-600 text-white  px-4 rounded flex  !py-1 gap-2 items-center"
        onClick={handleNextOrder}
        disabled={!nextOrderId}
      >
        <p className="font-bold dark:text-gray-300">Next Order</p>
        <Icon
          name="arrow_forward"
          variant="outlined"
          className="mt-1 dark:text-gray-300"
          size={22}
        />
      </Button>
    </div>
  );
};

export default OrderPageNavigator;
