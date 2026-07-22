"use client";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import ProductReportSkeleton from "@admin/components/Skeleton/Product/ProductReport.skeleton";
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

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      width="w-full md:w-3/4"
      maxWidth="max-w-2xl"
    >
      <Modal.Header className="flex items-center justify-between">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {productStatus?.product_title || "Product Report"}
        </h3>

        <Icon
          name="close"
          onClick={() => setIsModalOpen(false)}
          className="text-gray-600 cursor-pointer dark:text-gray-300"
        />
      </Modal.Header>

      <Modal.Body>
        <div className="w-full gap-5 min-h-96">
          {loading ? (
            <ProductReportSkeleton />
          ) : (
            <div className="w-full overflow-x-auto">
              {productStatus?.data?.length > 0 ? (
                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-semibold uppercase">
                        Branch Name
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-semibold uppercase">
                        Quantity
                      </th>
                      <th className="text-left px-4 py-2 text-sm font-semibold uppercase">
                        Active Orders
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productStatus.data.map((item: any, index: number) => (
                      <tr
                        key={index}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-4 py-2">
                          {item?.warehouse_title || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {item?.remaining_stock -
                            item?.transit_quantity -
                            item?.active_orders_quantity || 0}
                        </td>
                        <td className="px-4 py-2">
                          {item?.active_orders_quantity || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No report data found
                </p>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProductReportModal;
