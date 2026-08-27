"use client";

import { CustomerLoveContext } from "@/app/admin/customer-front/customer-review/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const CustomerLoveTable = () => {
    const router = useRouter();
    const { collectionData, tableLoading, handleRemove } =
        useContext(CustomerLoveContext);

    const [popupIndex, setPopupIndex] = useState<number | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);

    const togglePopup = (index: number) => {
        setPopupIndex((prev) => (prev === index ? null : index));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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
            data={collectionData}
            isLoading={tableLoading}
            noDataViewCondition={collectionData?.length < 1 ? "No data available" : null}
            colValue={4}
        >
            <Thead>
                <Tr>
                    <Th className="min-w-[200px]">Section</Th>
                    <Th className="min-w-[360px]">Mobile</Th>
                    <Th className="min-w-[360px]">Desktop</Th>
                    <Th className="is-right">Actions</Th>
                </Tr>
            </Thead>

            <Tbody>
                {collectionData?.map((item: any, index: number) => {
                    const fallback = item?.items || [];
                    const mobileItems = [...(item?.mobile?.length ? item.mobile : fallback)].sort(
                        (a: any, b: any) => (a?.priority || 0) - (b?.priority || 0)
                    );
                    const desktopItems = [...(item?.desktop?.length ? item.desktop : fallback)].sort(
                        (a: any, b: any) => (a?.priority || 0) - (b?.priority || 0)
                    );

                    const renderCards = (list: any[], emptyLabel: string) => (
                        <div className="space-y-3">
                            {list.length > 0 ? (
                                list.map((review: any, reviewIndex: number) => (
                                    <div
                                        key={reviewIndex}
                                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                                    >
                                        <div className="flex gap-3">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] shrink-0 bg-[var(--bg-hover)]">
                                                {review?.image ? (
                                                    <Image
                                                        src={review.image}
                                                        alt={review?.name || "review"}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs data-table-muted">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="data-table-primary">
                                                    {review?.name || "Untitled"}
                                                </p>
                                                <p className="data-table-muted mt-1">
                                                    {review?.city || "-"} · {review?.product || "No product"}
                                                </p>
                                                <p className="data-table-muted mt-1 line-clamp-2">
                                                    {review?.text || "No review"}
                                                </p>
                                                <span className="table-role-badge is-neutral mt-2 inline-block">
                                                    {review?.rating ?? "-"}★ · Priority {review?.priority ?? "-"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center data-table-muted">
                                    {emptyLabel}
                                </div>
                            )}
                        </div>
                    );

                    return (
                        <Tr key={item?._id || index}>
                            <Td className="py-4">
                                <p className="data-table-muted text-xs uppercase tracking-wider">
                                    {item?.eyebrow || "-"}
                                </p>
                                <p className="data-table-primary mt-1">
                                    {item?.heading || "Loved by Her"}
                                </p>
                                <p className="data-table-muted mt-1">
                                    {item?.description || "-"}
                                </p>
                            </Td>

                            <Td className="py-4">{renderCards(mobileItems, "No mobile review found")}</Td>

                            <Td className="py-4">{renderCards(desktopItems, "No desktop review found")}</Td>

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
                                                    router.push(
                                                        `/admin/customer-front/customer-review/edit/${item?._id}`
                                                    );
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

export default CustomerLoveTable;
