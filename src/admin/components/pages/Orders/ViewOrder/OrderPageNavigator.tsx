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
    <div className="ov-nav">
      <Button
        className="ov-nav__btn"
        onClick={handlePrevOrder}
        disabled={!prevOrderId}
      >
        <Icon name="arrow_back" variant="outlined" size={18} />
        <span>Prev Order</span>
      </Button>

      <Button
        className="ov-nav__btn"
        onClick={handleNextOrder}
        disabled={!nextOrderId}
      >
        <span>Next Order</span>
        <Icon name="arrow_forward" variant="outlined" size={18} />
      </Button>
    </div>
  );
};

export default OrderPageNavigator;
