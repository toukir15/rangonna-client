import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
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
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={productReviewData}
      isLoading={tableLoading}
      noDataViewCondition={
        productReviewData?.length < 1 ? "No data available" : null
      }
      colValue={10}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-52">Product Info</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-32">Customer Info</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-20">Rating</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Headline</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Description</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Image</Th>
          <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Creator</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {productReviewData?.map((review: IReview, index: number) => {
          return (
            <Tr key={index}>
              <Td>
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
                    <span className="data-table-primary">
                      {review?.product?.title}
                    </span>
                  </div>
                </div>
              </Td>
              <Td>
                <p className="data-table-primary">
                  {review?.customer?.first_name || noData}
                </p>
                {review?.customer?.phone ? (
                  <span className="table-contact-line pt-1">
                    <Icon name="call" size={14} variant="outlined" />
                    <a href={`tel:${review.customer.phone}`}>
                      {review.customer.phone}
                    </a>
                  </span>
                ) : (
                  <p className="data-table-muted pt-1">{noData}</p>
                )}
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
                  <span className="table-amount">({review?.rating})</span>
                </div>
              </Td>

              <Td>
                <span className="data-table-primary">{review?.headline}</span>
              </Td>
              <Td>
                <p className="max-w-64 data-table-muted">{review?.description}</p>
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
                <span className="max-w-64 data-table-muted">
                  {review?.user?.name}
                </span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "product_review_edit",
                  "product_review_delete"
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
                        {hasPermission(
                          permissionList,
                          "product_review_edit"
                        ) && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
                            type="button"
                            onClick={() => handleRemove(review._id)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
