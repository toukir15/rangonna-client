"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContext } from "@/app/admin/pages/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { IPageItem } from "@admin/@interfaces/page/page.interface";

const STOREFRONT_BASE_URL = "https://naviforce.com.bd";

const stripHtml = (html?: string) => {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getCampaignPageViewUrl = (slug?: string) => {
  if (!slug) return "";
  return `${STOREFRONT_BASE_URL.replace(/\/$/, "")}/campaign/${encodeURIComponent(slug)}`;
};

const PageTable: React.FC = () => {
  const router = useRouter();
  const { permissionList } = useGlobalContext();
  const { pageData, tableLoading, handleRemove } = useContext(PageContext);

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
      data={pageData}
      isLoading={tableLoading}
      noDataViewCondition={pageData?.length < 1 ? "No data available" : null}
      colValue={7}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300">
          <Th className="dark:text-gray-300 min-w-56">Title</Th>
          <Th className="dark:text-gray-300 min-w-40">Slug</Th>
          <Th className="dark:text-gray-300 min-w-72">Description</Th>
          <Th className="dark:text-gray-300 min-w-28">Status</Th>
          <Th className="dark:text-gray-300 min-w-36">Created At</Th>
          <Th className="dark:text-gray-300 min-w-24">View</Th>
          <Th className="dark:text-gray-300 min-w-28">Action</Th>
        </Tr>
      </Thead>

      <Tbody className="dark:bg-gray-800 bg-white">
        {pageData?.map((item: IPageItem, index: number) => (
          <Tr className="h-14" key={item?._id || index}>
            <Td className="text-base font-bold">{item?.title || "N/A"}</Td>
            <Td>{item?.slug || "N/A"}</Td>
            <Td>
              <p className="line-clamp-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                {stripHtml(item?.description) || "N/A"}
              </p>
            </Td>
            <Td>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  item?.status
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {item?.status ? "Active" : "Inactive"}
              </span>
            </Td>
            <Td>
              {item?.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-GB")
                : "N/A"}
            </Td>
            <Td>
              {permissionList.includes("campaign_page_view") && item?.slug ? (
                <a
                  href={getCampaignPageViewUrl(item.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="data-table-view-btn"
                >
                  View
                </a>
              ) : (
                "N/A"
              )}
            </Td>
            <Td>
              {hasPermission(
                permissionList,
                "campaign_page_edit",
                "campaign_page_delete",
              ) && (
                <div className="relative">
                  <Icon
                    name="more_horiz"
                    variant="outlined"
                    onClick={() => togglePopup(index)}
                    className="cursor-pointer"
                  />

                  {popupIndex === index && (
                    <div
                      ref={popupRef}
                      className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                    >
                      {permissionList.includes("campaign_page_edit") && (
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          onClick={() => {
                            router.push(`/admin/pages/edit/${item._id}`);
                            setPopupIndex(null);
                          }}
                        >
                          Edit
                        </button>
                      )}

                      {permissionList.includes("campaign_page_delete") && (
                        <button
                          type="button"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          onClick={() => {
                            handleRemove(item?._id);
                            setPopupIndex(null);
                          }}
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
        ))}
      </Tbody>
    </TableWrapper>
  );
};

export default PageTable;
