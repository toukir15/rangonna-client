import { IMimSms } from "@admin/@interfaces/setting/mimSms/mimSms.interface";
import { MimSmsContext } from "@/app/admin/setting/mim-sms/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { useContext, useEffect, useRef, useState } from "react";

const MimSmsTable = () => {
    const { permissionList } = useGlobalContext();
    const {
        mimSmsData,
        tableLoading,
        handleEditClick,
        handleRemove,
    } = useContext(MimSmsContext);
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
            data={mimSmsData}
            isLoading={tableLoading}
            noDataViewCondition={
                mimSmsData?.length < 1 ? "No data available" : null
            }
            colValue={3}
        >
            <Thead>
                <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                    <Th className="dark:text-gray-300">
                        Title
                    </Th>
                    <Th className="dark:text-gray-300">Message</Th>
                    <Th className="dark:text-gray-300">Action</Th>
                </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
                {mimSmsData?.map((mimSms: IMimSms, index: number) => {
                    return (
                        <Tr className="h-14" key={index}>
                            <Td>{mimSms?.title}</Td>
                            <Td className="text-base font-bold">{mimSms?.message}</Td>
                            <Td className="">
                                {hasPermission(permissionList, "mim_sms_template_edit", "mim_sms_template_delete") && (
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
                                                {hasPermission(permissionList, "mim_sms_template_edit") && (
                                                    <button
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                        onClick={() => handleEditClick(mimSms)}
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {hasPermission(permissionList, "mim_sms_template_delete") && (
                                                    <button
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                        onClick={() => handleRemove(mimSms?._id)}
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

export default MimSmsTable;
