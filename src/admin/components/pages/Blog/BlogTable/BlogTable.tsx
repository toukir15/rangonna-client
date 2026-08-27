import React, { useContext } from "react";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { hasPermission, noData } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { BlogContext } from "@/app/admin/blog/page";

const BlogTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();

  const {
    blogData,
    tableLoading,
    handleImageClick,
    togglePopup,
    popupIndex,
    popupRef,
    handleDelete,
  } = useContext(BlogContext);

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  return (
    <TableWrapper
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={blogData}
      isLoading={tableLoading}
      noDataViewCondition={blogData?.length < 1 && "No data available"}
      colValue={6}
    >
      <Thead>
        <Tr>
          <Th className="min-w-24">Image</Th>
          <Th className="min-w-56">Title</Th>
          <Th className="min-w-40">Category</Th>
          <Th className="min-w-40">Brand</Th>
          <Th className="min-w-40">Focus Keyword</Th>
          <Th className="min-w-72">Description</Th>
          <Th className="min-w-36">Created At</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {blogData?.map((item: any, index: number) => (
          <Tr key={item?._id || index}>
            <Td>
              <Image
                src={item?.featured_image?.src || "/placeholder.png"}
                alt={item?.featured_image?.alt || item?.title || "Blog Image"}
                width={70}
                height={70}
                className="h-[70px] w-[70px] rounded bg-gray-200 object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick(item?.featured_image?.src);
                }}
              />
            </Td>

            <Td>
              <span className="data-table-primary">{item?.title || noData}</span>
            </Td>

            <Td>
              <span className="data-table-muted">
                {item?.categories?.length ? item.categories.join(", ") : noData}
              </span>
            </Td>
            <Td>
              <span className="data-table-muted">{item?.brand || noData}</span>
            </Td>
            <Td>
              <span className="data-table-muted">{item?.focus_keyword || noData}</span>
            </Td>

            <Td>
              <p className="line-clamp-2 max-w-md data-table-muted">
                {stripHtml(item?.description)}
              </p>
            </Td>

            <Td>
              <span className="data-table-muted">
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-GB")
                  : noData}
              </span>
            </Td>

            <Td className="is-right">
              {hasPermission(permissionList, "blog_edit", "blog_delete") && (
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
                      {hasPermission(permissionList, "blog_edit") && (
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                          onClick={() =>
                            router.push(`/admin/blog/edit/${item?._id}`)
                          }
                        >
                          Edit
                        </button>
                      )}

                      {hasPermission(permissionList, "blog_delete") && (
                        <button
                          type="button"
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                          onClick={() => handleDelete(item?._id)}
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

export default BlogTable;
