"use client";

import { MenuContext } from "@/app/admin/customer-front/menu/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const MenuTable = () => {
    const router = useRouter();
    const { menuData, tableLoading, handleRemove } = useContext(MenuContext);

    const [popupIndex, setPopupIndex] = useState<number | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);

    const togglePopup = (index: number) => {
        setPopupIndex((prev) => (prev === index ? null : index));
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
                data={menuData}
                isLoading={tableLoading}
                noDataViewCondition={menuData?.length < 1 ? "No data available" : null}
                colValue={4}
            >
                <Thead>
                    <Tr className="dark:bg-gray-700 h-[52px] shadow-sm border-b dark:border-gray-700 border-gray-300">
                        <Th className="dark:text-gray-300 min-w-[520px]">Menu Structure</Th>
                        <Th className="dark:text-gray-300 min-w-[90px]">Action</Th>
                    </Tr>
                </Thead>

                <Tbody className="dark:bg-gray-800 bg-white">
                    {menuData?.map((item: any, index: number) => {
                        const navItems = item?.navBarItems || [];

                        return (
                            <Tr
                                className="align-top border-b border-gray-200 dark:border-gray-700"
                                key={item?._id || index}
                            >
                                <Td className="py-4">
                                    <div className="space-y-3">
                                        {navItems.length > 0 ? (
                                            navItems.map((nav: any) => (
                                                <div
                                                    key={nav?.id}
                                                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-gray-800 dark:text-white">
                                                                    {nav?.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500 break-all mt-1">
                                                                    Route: {nav?.route || "-"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <span className="text-xs whitespace-nowrap px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                                            {nav?.submenu?.length || 0} submenu
                                                        </span>
                                                    </div>

                                                    {nav?.submenu?.length > 0 && (
                                                        <div className="mt-4 pl-4 border-l-2 border-blue-100 dark:border-gray-700 space-y-2">
                                                            {nav?.submenu?.map((sub: any) => (
                                                                <div
                                                                    key={sub?.id}
                                                                    className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Icon
                                                                            name={sub?.icon || "chevron_right"}
                                                                            className="text-gray-500"
                                                                        />
                                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                                            {sub?.name}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-1 pl-6 break-all">
                                                                        {sub?.route || "-"}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500">
                                                No menu found
                                            </div>
                                        )}
                                    </div>
                                </Td>

                                <Td className="py-4">
                                    <div className="relative flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => togglePopup(index)}
                                            className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition"
                                        >
                                            <Icon
                                                name="more_horiz"
                                                variant="outlined"
                                                className="cursor-pointer"
                                            />
                                        </button>

                                        {popupIndex === index && (
                                            <div
                                                ref={popupRef}
                                                className="absolute top-11 right-0 bg-white border shadow-lg rounded-xl p-2 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                                            >
                                                <button
                                                    className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                                    onClick={() => {
                                                        router.push(`/admin/customer-front/menu/edit-menu/${item?._id}`);
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-red-500"
                                                    onClick={() => {
                                                        handleRemove(item?._id);
                                                        setPopupIndex(null);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </TableWrapper>
        </div>
    );
};

export default MenuTable;
