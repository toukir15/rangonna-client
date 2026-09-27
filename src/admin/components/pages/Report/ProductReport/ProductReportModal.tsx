"use client";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { ToastService } from "@admin/utils/toastr.service";
import { useEffect, useState } from "react";

const ProductReportModal = ({
  isModalOpen,
  setIsModalOpen,
  productId,
}: any) => {
  const [productStatus, setProductReportStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getProductReportStatus = async () => {
    if (!productId) return;

    try {
      setLoading(true);

      const res: any = await productService.getProductReportStatus(productId);

      if (res?.success) {
        setProductReportStatus(res?.data);
      } else {
        ToastService.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && productId) {
      getProductReportStatus();
    }
  }, [isModalOpen, productId]);

  const sizeRows = productStatus?.sizes ?? [];
  const branchRows = productStatus?.data ?? [];
  const usingSizes = sizeRows.length > 0;

  const rows = usingSizes
    ? sizeRows.map((item: any) => ({
        key: item?.sku || item?.size,
        label: item?.size || "N/A",
        quantity: Number(item?.quantity || 0),
        active: Number(item?.active_orders_quantity || 0),
      }))
    : branchRows.map((item: any, index: number) => ({
        key: item?.warehouse_title || index,
        label: item?.warehouse_title || "N/A",
        quantity: Number(
          item?.remaining_stock -
            item?.transit_quantity -
            item?.active_orders_quantity || 0,
        ),
        active: Number(item?.active_orders_quantity || 0),
      }));

  const totalQty = rows.reduce(
    (sum: number, row: { quantity: number }) => sum + row.quantity,
    0,
  );
  const totalActive = rows.reduce(
    (sum: number, row: { active: number }) => sum + row.active,
    0,
  );

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      width="w-full"
      maxWidth="max-w-xl"
      className="stock-report-modal"
    >
      <Modal.Header className="stock-report-head">
        <div>
          <p className="stock-report-kicker">Stock by size</p>
          <h3 className="stock-report-title">
            {productStatus?.product_title || "Product Report"}
          </h3>
        </div>
        <button
          type="button"
          className="stock-report-close"
          onClick={() => setIsModalOpen(false)}
          aria-label="Close"
        >
          <Icon name="close" size={18} />
        </button>
      </Modal.Header>

      <Modal.Body className="!px-5 !pb-5 !pt-4">
        {loading ? (
          <div className="stock-report-loading" role="status">
            <span className="page-loader-spin" />
            <p>Loading</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="stock-report-empty">No report data found</p>
        ) : (
          <>
            <div className="stock-report-stats">
              <div>
                <span>{usingSizes ? "Sizes" : "Branches"}</span>
                <strong>{rows.length}</strong>
              </div>
              <div>
                <span>Quantity</span>
                <strong>{totalQty}</strong>
              </div>
              <div>
                <span>Active orders</span>
                <strong>{totalActive}</strong>
              </div>
            </div>

            <div className="stock-report-table">
              <div className="stock-report-row is-head">
                <span>{usingSizes ? "Size" : "Branch"}</span>
                <span>Quantity</span>
                <span>Active orders</span>
              </div>
              {rows.map((row: { key: string; label: string; quantity: number; active: number }) => (
                <div className="stock-report-row" key={row.key}>
                  <span className="purchase-size-tag is-report">{row.label}</span>
                  <strong>{row.quantity}</strong>
                  <span className={row.active > 0 ? "is-active" : "is-quiet"}>
                    {row.active}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProductReportModal;
