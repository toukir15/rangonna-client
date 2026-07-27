"use client";

import { BannerContext } from "@/app/admin/customer-front/banner/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

const BannerTable = () => {
    const router = useRouter()
    const { bannerData, tableLoading, handleRemove } =
        useContext(BannerContext);

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
                data={bannerData}
                isLoading={tableLoading}
                noDataViewCondition={bannerData?.length < 1 ? "No data available" : null}
                colValue={4}
            >
                <Thead>
                    <Tr className="dark:bg-gray-700 bg-blue-100 h-[52px] shadow-sm border-b dark:border-gray-700 border-gray-300">
                        <Th className="dark:text-gray-300 min-w-[220px]">Website</Th>
                        <Th className="dark:text-gray-300 min-w-[420px]">Mobile Banner</Th>
                        <Th className="dark:text-gray-300 min-w-[420px]">Desktop Banner</Th>
                        <Th className="dark:text-gray-300 min-w-[90px]">Action</Th>
                    </Tr>
                </Thead>

                <Tbody className="dark:bg-gray-800 bg-white">
                    {bannerData?.map((item: any, index: number) => {
                        const mobileItems = item?.mobile || [];
                        const desktopItems = item?.desktop || [];

                        return (
                            <Tr
                                className="align-top border-b border-gray-200 dark:border-gray-700"
                                key={item?._id || index}
                            >
                                <Td className="py-4">
                                    <div className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-900/40">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                                <Icon name="language" className="text-blue-600" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="font-semibold text-base text-gray-800 dark:text-white">
                                                    {item?.website?.web_name || "N/A"}
                                                </p>
                                                <p className="text-sm text-blue-500 dark:text-gray-400 truncate py-1">
                                                    {item?.website?.web_url || "No URL"}
                                                </p>

                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                        {mobileItems.length} Mobile
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                        {desktopItems.length} Desktop
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Td>

                                <Td className="py-4">
                                    <div className="space-y-3">
                                        {mobileItems.length > 0 ? (
                                            mobileItems
                                                .slice()
                                                .sort((a: any, b: any) => (a?.priority || 0) - (b?.priority || 0))
                                                .map((banner: any, bannerIndex: number) => (
                                                    <div
                                                        key={bannerIndex}
                                                        className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 p-4"
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0 bg-gray-100">
                                                                {banner?.image ? (
                                                                    <Image
                                                                        src={banner.image}
                                                                        alt={banner?.title || "banner"}
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
                                                                    {banner?.title || "Untitled"}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {banner?.description || "No description"}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-2 break-all">
                                                                    Link: {banner?.link || "-"}
                                                                </p>
                                                                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    Priority: {banner?.priority ?? "-"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500">
                                                No mobile banner found
                                            </div>
                                        )}
                                    </div>
                                </Td>

                                <Td className="py-4">
                                    <div className="space-y-3">
                                        {desktopItems.length > 0 ? (
                                            desktopItems
                                                .slice()
                                                .sort((a: any, b: any) => (a?.priority || 0) - (b?.priority || 0))
                                                .map((banner: any, bannerIndex: number) => (
                                                    <div
                                                        key={bannerIndex}
                                                        className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 p-4"
                                                    >
                                                        <div className="flex gap-3">
                                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shrink-0 bg-gray-100">
                                                                {banner?.image ? (
                                                                    <Image
                                                                        src={banner?.image}
                                                                        alt={banner?.title || "banner"}
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
                                                                    {banner?.title || "Untitled"}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {banner?.description || "No description"}
                                                                </p>
                                                                <p className="text-xs text-gray-500 mt-2 break-all">
                                                                    Link: {banner?.link || "-"}
                                                                </p>
                                                                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                                    Priority: {banner?.priority ?? "-"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-sm text-gray-500">
                                                No desktop banner found
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
                                                        router.push(`/admin/customer-front/banner/edit-banner/${item?._id}`)
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

export default BannerTable;