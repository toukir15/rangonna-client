import React, { useMemo, useState } from "react";

import OrderSumarySkeleton from "@admin/components/Skeleton/Orders/ViewOrder/OrderSumarySkeleton";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import Image from "next/image";
import NodataImage from "@admin/assets/images/noDataFound.png";
import BanglaText from "../../Orders/ViewOrder/BanglaText";

interface OrderSummaryProps {
  sumary: any;
  isLoading: boolean;
  date?: any;
}

const WholeSaleOrderSumary: React.FC<OrderSummaryProps> = ({
  sumary,
  isLoading,
  date,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg md:p-6 p-3">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-400">
        Order Summary {`(${formatTimeAgo(date)})`}
        {hasFlashSale && <span className="text-4xl ps-4">🔥</span>}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border dark:border-gray-500">
          <thead className="bg-blue-100 dark:bg-gray-700 h-[55px] shadow-sm border-b border-gray-300 dark:border-gray-700 p-20">
            <tr>
              <th className="dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                Image
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                Item
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 whitespace-nowrap dark:text-gray-300">
                QTY ({totalQuantity})
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 w-28 dark:text-gray-300">
                Price
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {expandedItems.map((item: any, index: number) => {
              return (
                <tr key={index}>
                  <td className="border dark:border-gray-600 px-4 py-2 text-center">
                    <Image
                      src={item?.product_id?.featured_image?.src || NodataImage}
                      width={70}
                      height={70}
                      alt={`Item ${item.name}`}
                      onClick={() =>
                        handleImageClick(item?.product_id?.featured_image?.src)
                      }
                      className="cursor-pointer rounded-md"
                      priority={index < 3}
                    />
                  </td>
                  <td className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2 font-medium">
                    <BanglaText unicodeString={item?.title} />
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-center dark:text-gray-400">
                    {item?.quantity}
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {item?.price}
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {item?.total}
                  </td>
                </tr>
              );
            })}

            <tr>
              <td colSpan={3}></td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right  dark:text-gray-400 bg-red-100 text-red-600 font-bold">
                Subtotal:
              </td>

              <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400 bg-red-100 text-red-600 font-bold">
                {totalPrice}
              </td>
            </tr>

            <tr>
              <td colSpan={3}></td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400">
                Shipping:(+)
              </td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                {sumary?.shipping_line?.total}
              </td>
            </tr>
            <tr>
              <td colSpan={3}></td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right  dark:text-gray-400 bg-red-100 text-red-600 font-bold">
                Total:
              </td>

              <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400 bg-red-100 text-red-600 font-bold">
                {totalPrice + sumary?.shipping_line?.total}
              </td>
            </tr>
            {sumary?.discount_total !== 0 && (
              <tr>
                <td colSpan={3}></td>
                <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400 text-nowrap">
                  Discount: (-)
                </td>
                <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                  {sumary?.discount_total}
                </td>
              </tr>
            )}

            {/* <tr>
              <td colSpan={3}></td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400">
                Total:
              </td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                {sumary?.total}
              </td>
            </tr> */}
            {sumary?.paid !== 0 && (
              <tr>
                <td colSpan={3}></td>
                <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400 text-nowrap">
                  Advance: (-)
                </td>
                <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                  {sumary?.paid}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={3}></td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right  dark:text-gray-400 bg-red-100 text-red-600 font-bold">
                Due:
              </td>
              <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400 bg-red-100 text-red-600 font-bold">
                {sumary?.due}
              </td>
            </tr>
            {sumary?.coupon?.amount > 0 && (
              <tr>
                <td colSpan={3}></td>
                <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400 text-nowrap">
                  Coupon: (-)
                </td>
                <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                  {/* {sumary?.coupon?.amount} */}
                  Applied
                </td>
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
    </div>
  );
};

export default WholeSaleOrderSumary;
