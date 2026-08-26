"use client";

import { FeaturedCollectionContext } from "@/app/admin/customer-front/featured-collection/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const FeaturedCollectionTable = () => {
    const router = useRouter();
    const { collectionData, tableLoading, handleRemove } =
        useContext(FeaturedCollectionContext);

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
        <div>
            <TableWrapper
                isSwitchOn={true}
                className="min-h-[650px]"
                data={collectionData}
                isLoading={tableLoading}
                noDataViewCondition={collectionData?.length < 1 ? "No data available" : null}
                colValue={4}
            >
                <Thead>
                    <Tr className="dark:bg-gray-700 h-[52px] shadow-sm border-b dark:border-gray-700 border-gray-300">
                        <Th className="dark:text-gray-300 min-w-[200px]">Section</Th>
                        <Th className="dark:text-gray-300 min-w-[360px]">Mobile</Th>
                        <Th className="dark:text-gray-300 min-w-[360px]">Desktop</Th>
                        <Th className="dark:text-gray-300 min-w-[90px]">Action</Th>
                    </Tr>
                </Thead>

                <Tbody className="dark:bg-gray-800 bg-white">
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
                                    list.map((collection: any, collectionIndex: number) => (
                                        <div
                                            key={collectionIndex}
                                            className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 p-4"
                                        >
                                            <div className="flex gap-3">
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0 bg-gray-100">
                                                    {collection?.image ? (
                                                        <Image
                                                            src={collection.image}
                                                            alt={collection?.title || "collection"}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {collection?.title || "Untitled"}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {collection?.description || "No description"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2 break-all">
                                                        Link: {collection?.link || "-"}
                                                    </p>
                                                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        Priority: {collection?.priority ?? "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500">
                                        {emptyLabel}
                                    </div>
                                )}
                            </div>
                        );

                        return (
                            <Tr
                                className="align-top border-b border-gray-200 dark:border-gray-700"
                                key={item?._id || index}
                            >
                                <Td className="py-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-500">
                                        {item?.eyebrow || "-"}
                                    </p>
                                    <p className="font-semibold text-gray-800 dark:text-white mt-1">
                                        {item?.heading || "Featured Collections"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {item?.description || "-"}
                                    </p>
                                </Td>

                                <Td className="py-4">{renderCards(mobileItems, "No mobile collection found")}</Td>

                                <Td className="py-4">{renderCards(desktopItems, "No desktop collection found")}</Td>

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
                                                        router.push(
                                                            `/admin/customer-front/featured-collection/edit/${item?._id}`
                                                        );
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

export default FeaturedCollectionTable;
