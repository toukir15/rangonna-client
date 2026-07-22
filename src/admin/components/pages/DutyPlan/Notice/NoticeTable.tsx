import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, trimString } from "@admin/utils";
import { NoticeContext } from "@/app/admin/duty-plan/notice/page";
import CustomHTMLParser from "@admin/components/core/HtmlParser/HtmlParser";

const NoticeTable: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const {
        noticeData,
        tableLoading,
        handleEditClick,
        handleRemove
    } = useContext(NoticeContext);

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
            data={noticeData}
            isLoading={tableLoading}
            noDataViewCondition={noticeData?.length < 1 ? "No data available" : null}
            colValue={7}
        >
            <Thead>
                <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">

                    <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-14 min-w-40">
                        User
                    </Th>
                    <Th className="dark:text-gray-300 2xl:min-w-44 lg:min-w-14 min-w-40">
                        Date
                    </Th>
                    <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-14 min-w-32">
                        title
                    </Th>
                    <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-24">
                        Description
                    </Th>
                    <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
                        Action
                    </Th>
                </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
                {noticeData?.map((notice: any, index: number) => {
                    return (
                        <Tr className="h-14" key={index}>
                            <Td>
                                <p>{notice?.user?.name}</p>
                                <p className="pt-1">{notice?.user?.email}</p>
                            </Td>
                            <Td>
                                <p>{notice?.updatedAt && formatTimeAgo(notice?.updatedAt)}</p>
                                <p>{formatTimeAgo(notice?.createdAt)}</p>
                            </Td>
                            <Td className="">{notice?.title}</Td>

                            <Td>
                                <CustomHTMLParser htmlContent={trimString(notice?.description, 1000, true)} />
                            </Td>

                            <Td className="">
                                {hasPermission(permissionList, "notice_edit", "notice_delete") &&
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
                                                    className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                                                >
                                                    {hasPermission(
                                                        permissionList,
                                                        "notice_edit"
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

                                                        "notice_delete"
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

export default NoticeTable;
