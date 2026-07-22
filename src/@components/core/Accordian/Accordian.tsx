"use client";
import { Collapse } from "react-collapse";
import Icon from "../Icon/Icon";

interface AccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div
      className={`accordion rounded-lg  mt-4 cursor-pointer accordion-header  justify-between text-white  ${
        isOpen ? "rounded-t-lg " : "rounded-lg "
      } transition-all duration-300 ease-in-out`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <h3 className=" text-white font-bold  uppercase">{title}</h3>
        <>
          {isOpen ? (
            <div className="text-white flex justify-center items-center w-[36px] h-[36px] rounded-full ">
              <Icon
                name="keyboard_arrow_up"
                variant="outlined"
                className="text-white text-sm"
              />
            </div>
          ) : (
            <div className=" flex justify-center items-center w-[36px] h-[36px] rounded-full ">
              <Icon
                name="keyboard_arrow_down"
                variant="outlined"
                className="text-white text-sm"
              />
            </div>
          )}
        </>
      </div>
      <Collapse isOpened={isOpen}>
        <div className="accordion-content transition-all duration-300 ease-in-out  text-[#48505E] pb-[10px] ">
          {children}
        </div>
      </Collapse>
    </div>
  );
};

export default Accordion;
