import React, { useMemo, useState } from "react";
// import BanglaText from "./BanglaText";
import OrderSumarySkeleton from "@admin/components/Skeleton/Orders/ViewOrder/OrderSumarySkeleton";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Image from "next/image";
import NodataImage from "@admin/assets/images/noDataFound.png";
import CouponModal from "./CouponModal/CouponModal";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Button from "@admin/components/core/Button/Button";



const OrderSummary: React.FC<any> = ({
  sumary,
  isLoading,
  date,
  fetchOrderSumary,
  domain,
  handleStatusUpdate,
  orderStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { permissionList } = useGlobalContext();

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };
  const expandedItems = useMemo(() => {
    if (!sumary?.line_items) return [];
    return sumary.line_items.flatMap((item: any) =>
      Array.from({ length: item.quantity }, () => ({
        ...item,
        quantity: 1,
        total: item?.price?.toFixed(2),
        price: item?.price?.toFixed(2),
      }))
    );
  }, [sumary?.line_items]);

  const totalPrice = useMemo(() => {
    if (!sumary?.line_items) return 0;
    return sumary.line_items.reduce(
      (acc: any, item: any) => acc + parseFloat(item.subtotal || 0),
      0
    );
  }, [sumary?.line_items]);

  const totalQuantity = useMemo(() => {
    return (
      sumary?.line_items?.reduce(
        (sum: any, item: any) => sum + item.quantity,
        0
      ) || 0
    );
  }, [sumary?.line_items]);

  const hasFlashSale = (sumary?.line_items || []).some((item: any) =>
    item?.product_id?.categories?.includes("flash-sale")
  );

  if (isLoading) return <OrderSumarySkeleton />;
  if (!sumary) return <div>No order summary data available</div>;

  return (
    <div className="ov-summary">
      <div className="ov-summary__head">
        <h3 className="ov-summary__title">
          Product Summary
          {sumary?.source ? (
            <span className="opacity-60 font-medium"> · {sumary.source}</span>
          ) : null}
          <span className="ov-summary__time">{`(${formatTimeAgo(date)})`}</span>
          {hasFlashSale && <span className="text-xl ps-2">🔥</span>}
        </h3>
        {domain === "https://naviforce.com.bd" &&
          ["pending", "approved", "waiting-payment", "follow-up"].includes(
            orderStatus
          ) ? (
          <p
            className={`px-4 py-1 rounded-full text-sm font-semibold tracking-wide
${sumary?.coupon?.amount || hasFlashSale
                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none"
                : "bg-[#1a0c10] text-white cursor-pointer"
              }
`}
            onClick={() => {
              setModalOpen(true);
            }}
          >
            Apply Coupon
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Item</th>
              <th className="whitespace-nowrap">QTY ({totalQuantity})</th>
              <th className="w-28">Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {expandedItems.map((item: any, index: number) => {
              return (
                <tr key={index}>
                  <td className="text-center">
                    <Image
                      src={item?.product_id?.featured_image?.src || NodataImage}
                      width={70}
                      height={70}
                      alt={`Item ${item.name}`}
                      onClick={() =>
                        handleImageClick(item?.product_id?.featured_image?.src)
                      }
                      className="cursor-pointer rounded-lg border border-[rgba(158,120,48,0.18)]"
                      priority={index < 3}
                    />
                  </td>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="ov-summary__item-title">{item?.title}</p>
                        <p className="ov-summary__meta">
                          Sku: {item?.sku || item?.product_id?.sku || "—"}
                        </p>
                        {item?.size ? (
                          <p className="ov-summary__meta">Size: {item.size}</p>
                        ) : null}
                      </div>
                      <div>
                        {(permissionList.includes("order_label_view") ||
                          item?.stock_status === "out-of-stock") && (
                            <div>
                              {item?.stock_status === "out-of-stock" ? (
                                <Button
                                  className="!bg-red-100 !text-red-600 !px-3 !py-1 !text-xs !rounded-full"
                                  onClick={() =>
                                    handleStatusUpdate(item?.product_id?._id)
                                  }
                                >
                                  Out Of Stock
                                </Button>
                              ) : (
                                permissionList.includes("order_label_view") && (
                                  <Button
                                    className="!bg-[#1a0c10]/8 !text-white !px-3 !py-1 !text-xs !rounded-full"
                                    onClick={() =>
                                      handleStatusUpdate(item?.product_id?._id)
                                    }
                                  >
                                    Add
                                  </Button>
                                )
                              )}
                            </div>
                          )}
                      </div>
                      <div>
                        {item?.status && (
                          <span className="ml-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs uppercase">
                            {item?.status}-{item?.return_quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-center">{item?.quantity}</td>
                  <td className="text-right tabular-nums">{item?.price}</td>
                  <td className="text-right tabular-nums font-semibold">
                    {item?.total}
                  </td>
                </tr>
              );
            })}

            <tr className="ov-summary__totals">
              <td colSpan={3}></td>
              <td className="text-right">Subtotal:</td>
              <td className="text-right tabular-nums">{totalPrice}</td>
            </tr>

            <tr>
              <td colSpan={3}></td>
              <td className="text-right font-semibold opacity-70">
                Shipping:(+)
              </td>
              <td className="text-right tabular-nums">
                {sumary?.shipping_line?.total}
              </td>
            </tr>
            <tr className="ov-summary__totals">
              <td colSpan={3}></td>
              <td className="text-right">Total:</td>
              <td className="text-right tabular-nums">
                {totalPrice + sumary?.shipping_line?.total}
              </td>
            </tr>
            {sumary?.discount_total !== 0 && (
              <tr>
                <td colSpan={3}></td>
                <td className="text-right font-semibold opacity-70 text-nowrap">
                  Discount: (-)
                </td>
                <td className="text-right tabular-nums">
                  {sumary?.discount_total}
                </td>
              </tr>
            )}
            {sumary?.paid !== 0 && (
              <tr>
                <td colSpan={3}></td>
                <td className="text-right font-semibold opacity-70 text-nowrap">
                  Advance: (-)
                </td>
                <td className="text-right tabular-nums">{sumary?.paid}</td>
              </tr>
            )}
            <tr className="ov-summary__due">
              <td colSpan={3}></td>
              <td className="text-right">Due:</td>
              <td className="text-right tabular-nums">{sumary?.due}</td>
            </tr>
            {sumary?.coupon?.amount > 0 && (
              <tr>
                <td colSpan={3}></td>
                <td className="text-right font-semibold opacity-70 text-nowrap">
                  Coupon: (-)
                </td>
                <td className="text-right">Applied</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}

      <CouponModal
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        orderId={sumary?._id}
        fetchOrderSumary={fetchOrderSumary}
      />
    </div>
  );
};

export default OrderSummary;
