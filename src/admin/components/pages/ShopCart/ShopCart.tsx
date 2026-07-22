"use client";
import Icon from "@admin/components/core/Icon/Icon";

const ShopCart = ({ data }: any) => {
  return (
    <div className="md:min-w-64">
      <div className="flex items-center 2xl:p-4 md:p-4 p-2 dark:bg-gray-700 bg-white border dark:border dark:border-gray-700 border-gray-200 rounded-lg shadow-md  lg:space-x-8 md:space-x-4 space-x-2">
        <div>
          <Icon
            name={data?.icon}
            className={`${data?.color}`}
            size="40px "
            variant="outlined"
          />
        </div>
        <div>
          <h3 className="text-sm font-inter dark:text-gray-300">
            {data?.label}
          </h3>
          <div className="flex">
            <h4 className="text-[22px] font-normal dark:text-gray-300 text-gray-800 mt-1 font-inter">
              {data?.value}
            </h4>
            {data?.percentage && (
              <h4
                className={`text-gray-800 text-xs mt-4 ml-1 font-semibold ${data?.color}`}
              >
                {data?.percentage}
              </h4>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCart;
