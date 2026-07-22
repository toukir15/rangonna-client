"use client";
import Icon from "@admin/components/core/Icon/Icon";

const CurrentValueCart = ({ data }: any) => {
    return (
        <div>
            <div className="flex items-center 2xl:p-4 md:p-4 p-2 dark:bg-gray-700 bg-white border dark:border dark:border-gray-700 border-gray-200 rounded-lg shadow-md space-x-8">
                <div>
                    <Icon
                        name={data?.icon}
                        className={`${data?.color}`}
                        size="44px"
                        variant="outlined"
                    />
                </div>

                <div className="w-full">
                    <h3 className="text-sm font-inter dark:text-gray-300">
                        {data?.label}
                    </h3>

                    <div className="flex items-center">
                        {data?.isInput ? (
                            <input
                                type="number"
                                value={data?.value ?? ""}
                                onChange={(e) => data?.onChange?.(e.target.value)}
                                className="mt-1 w-full max-w-[220px] rounded-md border border-gray-300 px-3 py-1 text-[18px] dark:bg-gray-800 dark:text-gray-300 outline-none"
                                placeholder="Enter value"
                            />
                        ) : (
                            <h4 className="text-[22px] font-normal dark:text-gray-300 text-gray-800 mt-1 font-inter">
                                {data?.value}
                            </h4>
                        )}

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

export default CurrentValueCart;