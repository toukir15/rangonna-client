import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { HolidayNoticeContext } from "@/app/admin/duty-plan/holiday-notice/page";
import HolidayQuickViewModal from "./HolidayQuickViewModal";


const HolidayNoticeTable: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const {
        holidayNoticeData,
        tableLoading,
        handleEditClick,
        handleRemove
    } = useContext(HolidayNoticeContext);

    const [popupIndex, setPopupIndex] = useState<number | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const togglePopup = (index: number) => {
        setPopupIndex(popupIndex === index ? null : index);
    };
    const [modalOpen, setModalOpen] = useState(false);
    const [holidayInfo, setHolidayInfo] = useState();

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
        <div>
            <TableWrapper
                isSwitchOn={true}
                className="min-h-[650px]"
                data={holidayNoticeData}
                isLoading={tableLoading}
                noDataViewCondition={holidayNoticeData?.length < 1 ? "No data available" : null}
                colValue={7}
            >
                <Thead>
                    <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">

                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                            Year
                        </Th>
                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
                            Note
                        </Th>
                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
                            Holidays
                        </Th>

                        <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                            Action
                        </Th>
                    </Tr>
                </Thead>
                <Tbody className="dark:bg-gray-800 bg-white">
                    {holidayNoticeData?.map((holiday: any, index: number) => {

                        return (
                            <Tr className="h-14" key={index}>
                                <Td>{holiday?.year}</Td>
                                <Td>
                                    {holiday?.note}
                                </Td>
                                <Td>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() => {
                                            setModalOpen(true);
                                            setHolidayInfo(holiday || []);
                                        }}
                                    >
                                        <Icon
                                            name="visibility"
                                            variant="outlined"
                                            className="cursor-pointer"
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            View ({holiday?.holidays?.length || 0})
                                        </span>
                                    </button>
                                </Td>
                                <Td>
                                    {hasPermission(permissionList, "team_holiday_notice_edit", "team_holiday_notice_delete") && (
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
                                                    {hasPermission(permissionList, "team_holiday_notice_edit") && (
                                                        <button
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                            onClick={() => handleEditClick(holiday)}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}

                                                    {hasPermission(permissionList, "team_holiday_notice_delete") && (
                                                        <button
                                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                            onClick={() => handleRemove(holiday?._id)}
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
            <HolidayQuickViewModal
                isModalOpen={modalOpen}
                setIsModalOpen={setModalOpen}
                holidayInfo={holidayInfo}
            />
        </div>
    );
};

export default HolidayNoticeTable;
