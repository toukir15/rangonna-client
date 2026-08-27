"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContext } from "@/app/admin/pages/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
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
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={pageData}
      isLoading={tableLoading}
      noDataViewCondition={pageData?.length < 1 ? "No data available" : null}
      colValue={7}
    >
      <Thead>
        <Tr>
          <Th className="min-w-56">Title</Th>
          <Th className="min-w-40">Slug</Th>
          <Th className="min-w-72">Description</Th>
          <Th className="min-w-28">Status</Th>
          <Th className="min-w-36">Created At</Th>
          <Th className="min-w-24">View</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {pageData?.map((item: IPageItem, index: number) => (
          <Tr key={item?._id || index}>
            <Td>
              <span className="data-table-primary">{item?.title || noData}</span>
            </Td>
            <Td>
              <span className="data-table-muted">{item?.slug || noData}</span>
            </Td>
            <Td>
              <p className="line-clamp-2 max-w-md data-table-muted">
                {stripHtml(item?.description) || noData}
              </p>
            </Td>
            <Td>
              <span
                className={`table-role-badge ${
                  item?.status ? "is-approved" : "is-rejected"
                }`}
              >
                {item?.status ? "Active" : "Inactive"}
              </span>
            </Td>
            <Td>
              <span className="data-table-muted">
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-GB")
                  : noData}
              </span>
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
                <span className="data-table-muted">{noData}</span>
              )}
            </Td>
            <Td className="is-right">
              {hasPermission(
                permissionList,
                "campaign_page_edit",
                "campaign_page_delete",
              ) && (
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
                      {permissionList.includes("campaign_page_edit") && (
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
