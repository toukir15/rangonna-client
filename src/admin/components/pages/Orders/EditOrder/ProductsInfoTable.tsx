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

const formatMoney = (value: number | string | undefined | null) => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

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

  const shipping = Number(
    orderDetails?.shipping_total ?? orderDetails?.shipping_line?.total ?? 0,
  );
  const discount = Number(orderDetails?.discount_total ?? 0);
  const paid = Number(orderDetails?.paid ?? 0);
  const coupon = Number(orderDetails?.coupon?.amount ?? 0);
  const total = subtotal + shipping - discount;
  const due = total - paid;

  const remainingAmount = subtotal + shipping - discount - paid;

  type SummaryRow = {
    label: string;
    value: string;
    emphasis?: boolean;
    due?: boolean;
    success?: boolean;
  };

  const summaryRows: SummaryRow[] = [
    ...(coupon > 0
      ? [{ label: "Coupon (−)", value: formatMoney(coupon) }]
      : []),
    { label: "Subtotal", value: formatMoney(subtotal) },
    { label: "Shipping", value: formatMoney(shipping) },
    { label: "Discount (−)", value: formatMoney(discount) },
    { label: "Total", value: formatMoney(total), emphasis: true },
    { label: "Paid (−)", value: formatMoney(paid) },
    {
      label: "Due",
      value: formatMoney(due),
      due: due > 0,
      success: due <= 0,
    },
  ];

  return (
    <>
      <div className="edit-order-products-card">
        <div className="overflow-x-auto">
          <table className="edit-order-products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th className="is-center">Quantity</th>
                <th className="is-right">Price</th>
                <th className="is-right">Subtotal</th>
                <th className="is-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails?.line_items?.length > 0 ? (
                [...orderDetails.line_items]
                  .reverse()
                  .map((product: any, reversedIndex: number) => {
                    const originalIndex =
                      orderDetails.line_items.length - 1 - reversedIndex;
                    const rawSrc =
                      product?.product_id?.featured_image?.src ||
                      product?.image ||
                      "";
                    const imageSrc = rawSrc || NodataImage;
                    const canPreview = Boolean(rawSrc);

                    return (
                      <tr key={originalIndex}>
                        <td>
                          <button
                            type="button"
                            className="edit-order-product-thumb"
                            title={product?.title || "Product image"}
                            onClick={() => {
                              if (canPreview) handleImageClick(imageSrc);
                            }}
                          >
                            <Image
                              src={imageSrc}
                              width={140}
                              height={140}
                              quality={80}
                              className="object-cover"
                              alt={product?.title || "Product Image"}
                            />
                          </button>
                        </td>
                        <td>
                          <div className="edit-order-product-meta">
                            <p className="edit-order-product-title">
                              {product?.title}
                            </p>
                            {(product?.sku || product?.product_id?.sku) && (
                              <p className="edit-order-product-sub">
                                SKU: {product?.sku || product?.product_id?.sku}
                              </p>
                            )}
                            {product?.size ? (
                              <p className="edit-order-product-sub">
                                Size: {product.size}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="is-center">
                          <div className="edit-order-qty">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => decrementQuantity(originalIndex)}
                            >
                              <Icon name="remove" size={16} />
                            </button>
                            <input
                              type="number"
                              value={product.quantity}
                              readOnly
                              aria-label="Quantity"
                            />
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => incrementQuantity(originalIndex)}
                            >
                              <Icon name="add" size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="is-right">
                          <span className="edit-order-money">
                            ৳ {formatMoney(product.price)}
                          </span>
                        </td>
                        <td className="is-right">
                          <span className="edit-order-money is-strong">
                            ৳{" "}
                            {formatMoney(
                              Number(product.price) * Number(product.quantity),
                            )}
                          </span>
                        </td>
                        <td className="is-center">
                          <button
                            type="button"
                            className="edit-order-remove-btn"
                            aria-label="Remove product"
                            title="Remove product"
                            onClick={() =>
                              handleRemoveProduct(product?.product_id)
                            }
                          >
                            <Icon name="delete" variant="outlined" size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={6} className="edit-order-empty">
                    No products added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="edit-order-summary">
          <div className="edit-order-summary-card">
            {summaryRows.map((row) => (
              <div
                key={row.label}
                className={[
                  "edit-order-summary-row",
                  row.emphasis ? "is-total" : "",
                  row.due ? "is-due" : "",
                  row.success ? "is-paid" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span>{row.label}</span>
                <strong>৳ {row.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="edit-order-actions">
        <button
          type="button"
          onClick={() =>
            router.push(`/admin/orders/view/${orderDetails?._id}`)
          }
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`btn-primary ${
            remainingAmount < 0 ? "!bg-red-500 hover:!opacity-90" : ""
          }`}
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
