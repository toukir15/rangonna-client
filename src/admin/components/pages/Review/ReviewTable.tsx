import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { ProductReviewContext } from "@/app/admin/product/reviews/page";
import { IReview } from "@admin/@interfaces/review/review.interface";
import Image from "next/image";
import { Star } from "lucide-react";

const ReviewTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    productReviewData,
    tableLoading,
    handleEditClick,
    handleRemove,
    handleImageClick,
  } = useContext(ProductReviewContext);

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
      data={productReviewData}
      isLoading={tableLoading}
      noDataViewCondition={
        productReviewData?.length < 1 ? "No data available" : null
      }
      colValue={10}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-52 dark:text-gray-300">
            Product Info
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-32 dark:text-gray-300">
            Customer Info
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-20 dark:text-gray-300">
            Rating
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-300">
            Headline
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-300">
            Description
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-300">
            Image
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40 dark:text-gray-300">
            Creator
          </Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-32 dark:text-gray-300">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {productReviewData?.map((review: IReview, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td className="">
                <div className="flex gap-4">
                  <div>
                    <Image
                      src={review?.product?.featured_image?.src || ""}
                      quality={50}
                      alt={
                        review?.product?.featured_image?.title ||
                        "Product Image"
                      }
                      className="rounded cursor-pointer"
                      title={review?.product?.featured_image?.title}
                      width={60}
                      height={14}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          typeof review?.product?.featured_image?.src ===
                          "string"
                        )
                          handleImageClick(
                            review?.product?.featured_image?.src
                          );
                      }}
                    />
                  </div>
                  <div>
                    <p>{review?.product?.title}</p>
                  </div>
                </div>
              </Td>
              <Td>
                <div>
                  <p>{review?.customer?.first_name}</p>
                  <p className="pt-1">{review?.customer?.phone}</p>
                </div>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Star
                        key={val}
                        className={`w-4 h-4 ${
                          review?.rating >= val
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    ({review?.rating})
                  </span>
                </div>
              </Td>

              <Td>
                <p>{review?.headline}</p>
              </Td>
              <Td>
                <p className="max-w-64">{review?.description}</p>
              </Td>
              <Td>
                <div className="flex gap-2">
                  {review?.images?.map((img, index) => (
                    <div key={index} className="flex">
                      <Image
                        src={img?.src || ""}
                        quality={60}
                        alt={
                          review?.product?.featured_image?.title ||
                          "Product Image"
                        }
                        className="rounded cursor-pointer"
                        title={review?.product?.featured_image?.title}
                        width={50}
                        height={14}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (typeof img?.src === "string")
                            handleImageClick(img?.src);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Td>
              <Td>
                <p className="max-w-64">{review?.user?.name}</p>
              </Td>
              <Td className="">
                {hasPermission(
                  permissionList,
                  "product_review_edit",
                  "product_review_delete"
                ) && (
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
                        className="absolute top-8 -left-14 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                      >
                        {hasPermission(
                          permissionList,
                          "product_review_edit"
                        ) && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleEditClick(review)}
                          >
                            Edit
                          </button>
                        )}

                        {hasPermission(
                          permissionList,
                          "product_review_delete"
                        ) && (
                          <button
                            onClick={() => handleRemove(review._id)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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

export default ReviewTable;
