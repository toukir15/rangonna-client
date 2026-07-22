"use client";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, useRef } from "react";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import html2pdf from "html2pdf.js";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import { StockTransferService } from "@admin/@services/apis/ProductStock/Transfer/Transfer.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { MyWarehouseService } from "@admin/@services/apis/ProductStock/MyWarehouse/MyWarehouse.service";

const Page: React.FC = () => {
  const { permissionList, userInfo } = useGlobalContext();
  const { pId } = useParams();
  const router = useRouter();
  const [singleData, setSingleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReceivingLoading, setReceivedLoading] = useState(false)


  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const getSingleTransfer = () => {
    if (!pId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    StockTransferService.getSingleStockTransfer(pId)
      .then((res: any) => {
        if (res?.success) {
          setSingleData(res?.data);
        } else {
          ToastService.error(res?.message || "Failed to load stock transfer");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err?.message || "Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getSingleTransfer();
  }, [pId]);

  const handlePdf = () => {
    if (!pdfRef.current) return;

    const element = pdfRef.current;

    const options: any = {
      margin: 0.5,
      filename: `Stock-Transfer-${singleData?._id || "details"}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };

  const handlePrint = () => {
    window.print();
  };

  const totalQuantity =
    singleData?.line_items?.reduce((sum: number, item: any) => {
      return sum + (Number(item?.quantity) || 0);
    }, 0) || 0;

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <ButtonLoader />
        </div>
      </AuthLayout>
    );
  }




  const isSender = userInfo?.id === singleData?.sender?._id;
  const isWarehouse = userInfo?.warehouse === singleData?.sender_warehouse?._id;
  const isWarehouseMatch = userInfo?.warehouse === singleData?.receiver_warehouse?._id;


  const handleReceived = async (id: string) => {
    setReceivedLoading(true);
    try {
      const res = await MyWarehouseService.receivedStockTransfer(id);

      if (res?.success) {
        ToastService.success(res?.message || "Stock received successfully");
        getSingleTransfer()
      } else {
        ToastService.error(res?.message || "Failed to receive stock");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Something went wrong");
    } finally {
      setReceivedLoading(false);
    }
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="md:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Stock Transfer Details
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isSender && !singleData?.is_received && hasPermission(permissionList, "product_stock_transfer_edit") && (
              <Button
                className="flex items-center bg-green-500 !px-4 !py-1"
                onClick={() =>
                  router.push(`/product-stock/transfer/edit/${singleData?._id}`)
                }
                disabled={isLoading || !singleData?._id}
              >
                <Icon name={"edit_document"} />
                <span className="ml-1">Edit</span>
              </Button>
            )}

            {
              permissionList.includes("stock_transfer_edit") && isSender && isWarehouse && !singleData?.is_received &&
              <div className="relative">
                <button
                  className="flex items-center bg-green-500 !px-4 !py-1 text-white rounded-lg"

                  onClick={() =>
                    router.push(
                      `/product-stock/transfer/edit-transfer/${singleData?._id}`
                    )
                  }
                >
                  <Icon name={"picture_as_pdf"} />
                  <span className="ml-1">Edit</span>
                </button>
              </div>
            }

            {isSender ? (
              !singleData?.is_received && null
            ) : (
              isWarehouseMatch && !singleData?.is_received && <div className="w-full">
                <Button
                  onClick={() => handleReceived(singleData?._id)}

                  className="flex text-center bg-blue-500 !px-4 !py-1 text-white cursor-pointer !text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Icon name={"inventory_2"} />
                  {isReceivingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <ButtonLoader />
                    </span>
                  ) : <span className="ml-1 pt-0.5">Received</span>}
                </Button>
              </div>
            )}


            <Button
              className="flex items-center bg-purple-500 !px-4 !py-1 cursor-pointer"
              onClick={handlePdf}
              disabled={isLoading}
            >
              <Icon name={"picture_as_pdf"} />
              <span className="ml-1">Pdf</span>
            </Button>

            <Button
              className="flex items-center bg-orange-500 !px-4 !py-1 cursor-pointer"
              onClick={handlePrint}
              disabled={isLoading}
            >
              <Icon name={"adf_scanner"} />
              <span className="ml-1">Print</span>
            </Button>
          </div>
        </div>
      </NoScrollLayout>

      <div className="hidden">
        <div ref={pdfRef} className="p-6 bg-white text-black">
          <h2 className="text-2xl font-bold mb-4">Stock Transfer Details</h2>
          <p>
            <strong>Sender Warehouse:</strong>{" "}
            {singleData?.sender_warehouse?.title || "N/A"}
          </p>
          <p>
            <strong>Receiver Warehouse:</strong>{" "}
            {singleData?.receiver_warehouse?.title || "N/A"}
          </p>
          <p>
            <strong>Sender:</strong> {singleData?.sender?.name || "N/A"}
          </p>
          <p>
            <strong>Receiver:</strong> {singleData?.receiver?.name || "N/A"}
          </p>
          <p>
            <strong>Note:</strong> {singleData?.note || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {singleData?.is_received ? "Received" : "Pending"}
          </p>

          <table className="w-full border-collapse border mt-4">
            <thead>
              <tr>
                <th className="border p-2">Product</th>
                <th className="border p-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {singleData?.line_items?.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border p-2">
                    {item?.product?.title || "Unnamed Product"}
                  </td>
                  <td className="border p-2">{item?.quantity || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="min-h-[72vh] 2xl:mx-4 mx-3 bg-white dark:bg-gray-700 dark:text-gray-300 mt-6 p-4 rounded-lg">
        <div className="flex flex-wrap gap-5 items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Sender Info</h3>
            <p>Name: {singleData?.sender?.name || "N/A"}</p>
            <p>Email: {singleData?.sender?.email || "N/A"}</p>
            <p>Warehouse: {singleData?.sender_warehouse?.title || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Receiver Info</h3>
            <p>Name: {singleData?.receiver?.name || "N/A"}</p>
            <p>Email: {singleData?.receiver?.email || "N/A"}</p>
            <p>Warehouse: {singleData?.receiver_warehouse?.title || "N/A"}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Transfer Info</h3>
            <p>
              Status:{" "}
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${singleData?.is_received
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {singleData?.is_received ? "Received" : "Pending"}
              </span>
            </p>
            <p>Total Quantity: {totalQuantity}</p>
            <p>Note: {singleData?.note || "N/A"}</p>
          </div>
        </div>

        <div className="overflow-x-auto mt-10">
          <h2 className="font-bold text-lg py-3">Transfer Summary</h2>

          <table className="min-w-full border-collapse border dark:border-gray-500">
            <thead className="bg-blue-100 dark:bg-gray-700 h-[55px] shadow-sm border-b border-gray-300 dark:border-gray-700">
              <tr>
                <th className="border dark:border-gray-600 px-4 py-2">Serial</th>
                <th className="border dark:border-gray-600 px-4 py-2">
                  Product Image
                </th>
                <th className="border dark:border-gray-600 px-4 py-2">
                  Product Name
                </th>
                <th className="border dark:border-gray-600 px-4 py-2 whitespace-nowrap">
                  Quantity ({totalQuantity})
                </th>
              </tr>
            </thead>

            <tbody>
              {singleData?.line_items?.length > 0 ? (
                singleData?.line_items?.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className="odd:bg-gray-100 dark:odd:bg-gray-800"
                  >
                    <td className="border dark:border-gray-600 px-4 py-2 text-center">
                      {index + 1}
                    </td>

                    <td className="border dark:border-gray-600 px-4 py-2">
                      <div className="flex justify-center">
                        <Image
                          src={
                            item?.product?.featured_image?.src || NodataImage
                          }
                          alt={item?.product?.title || "Product"}
                          width={55}
                          height={55}
                          className="rounded-md cursor-pointer"
                          onClick={() => handleImageClick(item?.product?.featured_image?.src)}
                        />
                      </div>
                    </td>

                    <td className="border dark:border-gray-600 px-4 py-2">
                      {item?.product?.title || "Unnamed Product"}
                    </td>

                    <td className="border dark:border-gray-600 px-4 py-2 text-center">
                      {item?.quantity || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 dark:text-gray-400"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </AuthLayout>
  );
};

export default Page;