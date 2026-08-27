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
        <TableWrapper
            showCheckbox={false}
            isSwitchOn={true}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
            data={menuData}
            isLoading={tableLoading}
            noDataViewCondition={menuData?.length < 1 ? "No data available" : null}
            colValue={4}
        >
            <Thead>
                <Tr>
                    <Th className="min-w-[520px]">Menu Structure</Th>
                    <Th className="is-right">Actions</Th>
                </Tr>
            </Thead>

            <Tbody>
                {menuData?.map((item: any, index: number) => {
                    const navItems = item?.navBarItems || [];

                    return (
                        <Tr key={item?._id || index}>
                            <Td className="py-4">
                                <div className="space-y-3">
                                    {navItems.length > 0 ? (
                                        navItems.map((nav: any) => (
                                            <div
                                                key={nav?.id}
                                                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="data-table-primary">
                                                            {nav?.name}
                                                        </p>
                                                        <p className="data-table-muted break-all mt-1 text-xs">
                                                            Route: {nav?.route || "-"}
                                                        </p>
                                                    </div>

                                                    <span className="table-role-badge is-neutral whitespace-nowrap">
                                                        {nav?.submenu?.length || 0} submenu
                                                    </span>
                                                </div>

                                                {nav?.submenu?.length > 0 && (
                                                    <div className="mt-4 pl-4 border-l-2 border-[var(--border)] space-y-2">
                                                        {nav?.submenu?.map((sub: any) => (
                                                            <div
                                                                key={sub?.id}
                                                                className="rounded-lg bg-[var(--bg-hover)] px-3 py-2"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Icon
                                                                        name={sub?.icon || "chevron_right"}
                                                                        className="data-table-muted"
                                                                    />
                                                                    <p className="data-table-primary text-sm">
                                                                        {sub?.name}
                                                                    </p>
                                                                </div>
                                                                <p className="data-table-muted mt-1 pl-6 break-all text-xs">
                                                                    {sub?.route || "-"}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center data-table-muted">
                                            No menu found
                                        </div>
                                    )}
                                </div>
                            </Td>

                            <Td className="is-right py-4">
                                <div className="relative max-w-40">
                                    <button
                                        type="button"
                                        className="data-table-action-btn"
                                        aria-expanded={popupIndex === index}
                                        onClick={() => togglePopup(index)}
                                    >
                                        <Icon name="more_vert" variant="outlined" size={18} />
                                    </button>

                                    {popupIndex === index && (
                                        <div
                                            ref={popupRef}
                                            className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                                        >
                                            <button
                                                type="button"
                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                                onClick={() => {
                                                    router.push(`/admin/customer-front/menu/edit-menu/${item?._id}`);
                                                }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
    );
};

export default MenuTable;
