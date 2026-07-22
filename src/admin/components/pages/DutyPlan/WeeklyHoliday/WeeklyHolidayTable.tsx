import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { WeeklyHolidayContext } from "@/app/admin/duty-plan/weekly-holiday/page";

const WeeklyHolidayTable: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const {
        weeklyHolidayData,
        tableLoading,
        handleEditClick,
        handleRemove
    } = useContext(WeeklyHolidayContext);

    const [popupIndex, setPopupIndex] = useState<number | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const togglePopup = (index: number) => {
        setPopupIndex(popupIndex === index ? null : index);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                setPopupIndex(null);
            }
        };

        if (popupIndex !== null) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popupIndex]);
    return (
        <TableWrapper
            isSwitchOn={true}
            className="min-h-[650px]"
            data={weeklyHolidayData}
            isLoading={tableLoading}
            noDataViewCondition={weeklyHolidayData?.length < 1 ? "No data available" : null}
            colValue={7}
        >
            <Thead>
                <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">

                    <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                        User
                    </Th>
                    <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                        Week Day
                    </Th>

                    <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                        Action
                    </Th>
                </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
                {weeklyHolidayData?.map((notice: any, index: number) => {
                    return (
                        <Tr className="h-14" key={index}>
                            <Td>
                                <p>{notice?.user?.name}</p>
                                <p className="pt-1">{notice?.user?.email}</p>
                            </Td>
                            <Td className="">{notice?.week_day}</Td>
                            <Td className="">
                                {hasPermission(permissionList, "weekly_holiday_edit", "weekly_holiday_delete") &&
                                    (
                                        <div className="relative">
                                            <Icon
                                                name={"more_horiz"}
                                                variant="outlined"
                                                onClick={() => togglePopup(index)}
                                                className="cursor-pointer"
                                            />
                                            {popupIndex === index && (
                                                <div
                                                    ref={popupRef}
                                                    className="absolute top-8  bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                                                >
                                                    {hasPermission(
                                                        permissionList,
                                                        "weekly_holiday_edit"
                                                    ) && (
                                                            <button
                                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                                onClick={() => handleEditClick(notice)}
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                    {hasPermission(
                                                        permissionList,

                                                        "weekly_holiday_delete"
                                                    ) && (
                                                            <button
                                                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                                onClick={() => handleRemove(notice?._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </Td>
                        </Tr>
                    );
                })}
            </Tbody>
        </TableWrapper>
    );
};

export default WeeklyHolidayTable;
