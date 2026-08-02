import Image from "next/image";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import EditProductInfoSkeleton from "@admin/components/Skeleton/Orders/EditOrder/EditProductInfoSkeleton";
import Icon from "@admin/components/core/Icon/Icon";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";

interface OrderDetailsTableProps {
  isLoading: boolean;
  orderDetails: any;
  subtotal: number;
  isSubmitting: boolean;
  handleImageClick: (image: string) => void;
  decrementQuantity: (index: number) => void;
  incrementQuantity: (index: number) => void;
  handleRemoveProduct: (productId: string) => void;
  router: any;
}

export const ProductsInfoTable = ({
  isLoading,
  orderDetails,
  subtotal,
  isSubmitting,
  handleImageClick,
  decrementQuantity,
  incrementQuantity,
  handleRemoveProduct,
  router,
}: OrderDetailsTableProps) => {
  if (isLoading) {
    return <EditProductInfoSkeleton />;
  }

  const remainingAmount =
    subtotal +
    Number(
      orderDetails?.shipping_total
        ? orderDetails?.shipping_total
        : orderDetails?.shipping_line?.total
    ) -
    orderDetails?.discount_total -
    orderDetails?.paid;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border dark:border-gray-500">
          <thead className="bg-blue-100 dark:bg-gray-800  dark:text-gray-300 h-[50px] shadow-sm border-b border-gray-300 dark:border-gray-500">
            <tr>
              <th className="border dark:border-gray-600 px-4 py-2 min-w-40">
                Product Image
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 min-w-60">
                Product Name
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 min-w-40">
                Quantity
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 min-w-32">
                Price
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 min-w-32">
                Subtotal
              </th>
              <th className="border dark:border-gray-600 px-4 py-2 min-w-20">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orderDetails?.line_items?.length > 0 ? (
              [...orderDetails.line_items]
                .reverse()
                .map((product: any, reversedIndex: number) => {
                  const originalIndex =
                    orderDetails.line_items.length - 1 - reversedIndex;
                  return (
                    <tr
                      key={originalIndex}
                      className="odd:bg-gray-100 dark:odd:bg-gray-700 dark:border-gray-600 border"
                    >
                      <td className="flex items-center justify-center my-2 cursor-pointer">
                        {product?.product_id?.featured_image?.src && (
                          <Image
                            src={
                              product?.product_id?.featured_image?.src
                                ? product?.product_id?.featured_image?.src
                                : NodataImage
                            }
                            width={80}
                            height={80}
                            className="rounded-md"
                            alt="Product Image"
                            onClick={() =>
                              handleImageClick(
                                product?.product_id?.featured_image?.src
                              )
                            }
                          />
                        )}
                      </td>
                      <td className="border dark:border-gray-600 text-lg font-semibold px-4 py-2 dark:text-gray-400">
                        <div>
                          <p>{product?.title}</p>
                          {(product?.sku || product?.product_id?.sku) && (
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                              Sku: {product?.sku || product?.product_id?.sku}
                            </p>
                          )}
                          {product?.size ? (
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                              Size: {product.size}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(originalIndex)}
                            className="bg-gray-300 dark:bg-gray-600 dark:text-gray-300 px-3 py-1 rounded-l"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={product.quantity}
                            readOnly
                            className="w-16 text-center py-1 border-t border-b dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => incrementQuantity(originalIndex)}
                            className="bg-gray-300 dark:bg-gray-600 px-3 py-1 rounded-r dark:text-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="border dark:border-gray-600 px-4 font-semibold text-md py-2 dark:text-gray-400">
                        BDT: {Number(product.price).toFixed(2)}
                      </td>
                      <td className="border dark:border-gray-600 px-4 font-semibold text-md py-2 dark:text-gray-400">
                        BDT: {(product.price * product.quantity).toFixed(2)}
                      </td>
                      <td className="border px-4 py-2 text-center dark:border-gray-600">
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveProduct(product?.product_id)
                          }
                          className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                        >
                          <Icon name="delete" variant="filled" />
                        </button>
                      </td>
                    </tr>
                  );
                })
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 dark:text-gray-400">
                  No products added yet
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            {orderDetails?.coupon?.amount > 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-right font-semibold px-4 py-2 dark:text-gray-300"
                >
                  Coupon(-):
                </td>
                <td className="px-4 py-2 dark:text-gray-300 text-end">
                  {orderDetails?.coupon?.amount}
                </td>
                <td></td>
              </tr>
            )}

            <tr>
              <td
                colSpan={5}
                className="text-right font-semibold px-4 py-2 dark:text-gray-300 "
              >
                Subtotal:
              </td>
              <td className="px-4 py-2 dark:text-gray-300 text-end">
                {subtotal}
              </td>
              <td></td>
            </tr>
            <tr>
              <td
                colSpan={5}
                className="text-right font-semibold px-4 py-2 dark:text-gray-300 "
              >
                Shipping:
              </td>
              <td className="px-4 py-2 dark:text-gray-300 text-end">
                {orderDetails?.shipping_total
                  ? orderDetails?.shipping_total
                  : orderDetails?.shipping_line?.total}
              </td>
              <td></td>
            </tr>
            <tr>
              <td
                colSpan={5}
                className="text-right font-semibold px-4 py-2 dark:text-gray-300"
              >
                Discount(-):
              </td>
              <td className="px-4 py-2 dark:text-gray-300 text-end">
                {orderDetails?.discount_total}
              </td>
              <td></td>
            </tr>
            <tr>
              <td
                colSpan={5}
                className="text-right font-semibold px-4 py-2 dark:text-gray-300"
              >
                Total:
              </td>
              <td className="px-4 py-2 dark:text-gray-300 text-end">
                {subtotal +
                  orderDetails?.shipping_line?.total -
                  orderDetails?.discount_total || 0}
              </td>
              <td></td>
            </tr>
            <tr>
              <td
                colSpan={5}
                className="text-right font-semibold px-4 py-2 dark:text-gray-300"
              >
                Paid(-):
              </td>
              <td className="px-4 py-2 dark:text-gray-300 text-end">
                {orderDetails?.paid}
              </td>
              <td></td>
            </tr>
            <tr>
              <td
                colSpan={5}
                className="text-right font-semibold px-4 py-2 dark:text-gray-300"
              >
                Due:
              </td>
              <td className="px-4 py-2 dark:text-gray-300 text-end">
                {subtotal +
                  Number(
                    orderDetails?.shipping_total
                      ? orderDetails?.shipping_total
                      : orderDetails?.shipping_line?.total
                  ) -
                  orderDetails?.discount_total -
                  orderDetails?.paid}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-end justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={() => router.push(`/admin/orders/view/${orderDetails?._id}`)}
          className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2 rounded-md transition text-white
            ${
              remainingAmount < 0
                ? "bg-red-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }
          `}
          disabled={isSubmitting || remainingAmount < 0}
        >
          {isSubmitting ? (
            <ButtonLoader />
          ) : remainingAmount < 0 ? (
            "Paid order not eligible"
          ) : (
            "Update Order"
          )}
        </button>
      </div>
    </>
  );
};
