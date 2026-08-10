import React, { useContext } from "react";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { hasPermission } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
// import Link from "next/link";
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
    <div>
      <TableWrapper
        isSwitchOn={true}
        className="min-h-[700px]"
        data={blogData}
        isLoading={tableLoading}
        noDataViewCondition={blogData?.length < 1 && "No data available"}
        colValue={6}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300">
            <Th className="dark:text-gray-300 min-w-24">Image</Th>
            <Th className="dark:text-gray-300 min-w-56">Title</Th>
            <Th className="dark:text-gray-300 min-w-40">Category</Th>
            <Th className="dark:text-gray-300 min-w-40">Brand</Th>
            <Th className="dark:text-gray-300 min-w-40">Focus Keyword</Th>
            <Th className="dark:text-gray-300 min-w-72">Description</Th>
            <Th className="dark:text-gray-300 min-w-36">Created At</Th>
            {/* <Th className="dark:text-gray-300 min-w-24">View</Th> */}
            <Th className="dark:text-gray-300 min-w-28">Action</Th>
          </Tr>
        </Thead>

        <Tbody className="dark:bg-gray-800 bg-white">
          {blogData?.map((item: any, index: number) => (
            <Tr key={item?._id || index} className="h-16">
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

              <Td className="text-base font-bold">{item?.title || "N/A"}</Td>

              <Td>
                {item?.categories?.length ? item.categories.join(", ") : "N/A"}
              </Td>
              <Td>{item?.brand}</Td>
              <Td>{item?.focus_keyword}</Td>

              <Td>
                <p className="line-clamp-2 max-w-md text-sm text-gray-600 dark:text-gray-300">
                  {stripHtml(item?.description)}
                </p>
              </Td>

              <Td>
                {item?.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("en-GB")
                  : "N/A"}
              </Td>

              {/* <Td>
                <Link
                  href={`/blog/${item?._id}`}
                  target="_blank"
                  className="data-table-view-btn"
                >
                  View
                </Link>
              </Td> */}

              <Td>
                {hasPermission(permissionList, "blog_edit", "blog_delete") && (
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
                        className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                      >
                        {hasPermission(permissionList, "blog_edit") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() =>
                              router.push(`/admin/blog/edit/${item?._id}`)
                            }
                          >
                            Edit
                          </button>
                        )}

                        {hasPermission(permissionList, "blog_delete") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
    </div>
  );
};

export default BlogTable;
