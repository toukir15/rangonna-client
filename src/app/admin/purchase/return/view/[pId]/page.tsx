"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, useRef } from "react";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useParams, useRouter } from "next/navigation";
import { getStatusStyle } from "@admin/utils/system.utils";
import Image from "next/image";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import html2pdf from "html2pdf.js";
import PurchasePdf from "@admin/components/pdf/PurchasePdf";
import PurchaseSkeleton from "@admin/components/Skeleton/Purchase/purchase.skeleton";
import EditProductInfoSkeleton from "@admin/components/Skeleton/Orders/EditOrder/EditProductInfoSkeleton";
import { PurchasesReturnService } from "@admin/@services/apis/PurchasesService/PurchasesReturn.service";

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { pId } = useParams();
  const router = useRouter();
  const [singleData, setSingleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  const getPurchases = () => {
    setIsLoading(true);
    PurchasesReturnService.getSinglePurchases(pId)
      .then((res: any) => {
        if (res?.success) {
          setSingleData(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
        // setSingleData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getPurchases();
  }, [pId]);

  const handlePdf = () => {
    console.log("pdf a click korci");
    if (!pdfRef.current) return;

    const element = pdfRef.current;

    const options: any = {
      margin: 0.5,
      filename: `Purchase-${singleData?.invoice || "invoice"}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };
  const handlePrint = () => {
    console.log("print a click korci");
  };
  useTableRefreshRegister(getPurchases);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="md:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2 ">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Purchase Return Detail : {singleData?.invoice}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {hasPermission(permissionList, "purchase_return_edit") && (
              <Button
                className="flex items-center bg-green-500 !px-4 !py-1"
                onClick={() =>
                  router.push(
                    `/admin/purchase/return/edit-purchases/${singleData?._id}`
                  )
                }
                disabled={isLoading}
              >
                <Icon name={"edit_document"} />
                <span className="ml-1">Edit</span>
              </Button>
            )}

            <Button
              className="flex items-center bg-purple-500 !px-4 !py-1"
              onClick={handlePdf}
              disabled={isLoading}
            >
              <Icon name={"picture_as_pdf"} />
              <span className="ml-1">Pdf</span>
            </Button>
            <Button
              className="flex items-center bg-orange-500 !px-4 !py-1"
              onClick={handlePrint}
            >
              <Icon name={"adf_scanner"} />
              <span className="ml-1">Print</span>
            </Button>
            {/* <Button
              className="flex items-center bg-red-500 !px-4 !py-1"
              //   onClick={handleAddClick}
            >
              <Icon name={"auto_delete"} />
              <span className="ml-1">Delete</span>
            </Button> */}
          </div>
        </div>
      </NoScrollLayout>
      <div className="hidden">
        <div ref={pdfRef}>
          <PurchasePdf data={singleData} />
        </div>
      </div>

      <div className="min-h-[72vh] 2xl:mx-4 mx-3 bg-white dark:bg-gray-700 dark:text-gray-300 mt-6 p-4 rounded-lg">
        {isLoading ? (
          <PurchaseSkeleton />
        ) : (
          <div className=" flex flex-wrap gap-5 items-center justify-between pr-20">
            <div>
              <h3 className="text-lg font-semibold">Supplier Info</h3>
              <p>{singleData?.supplier?.name}</p>
              <p>{singleData?.supplier?.email}</p>
              <p>{singleData?.supplier?.phone}</p>
              <p>{singleData?.supplier?.address}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Company Info</h3>
              <p>Naviforce</p>
              <p>admin@example.com</p>
              <p>01841544590</p>
              <p>14, Purana Paltan, Dhaka-1000</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Purchase Info</h3>
              <p>Reference : {singleData?.invoice}</p>
              <p>
                Status:{" "}
                <span
                  className={`${getStatusStyle(
                    singleData?.status
                  )} px-2 text-xs`}
                >
                  {singleData?.status}
                </span>
              </p>
              <p>Warehouse : {singleData?.warehouse?.title}</p>
              <p>
                Payment Status :{" "}
                <span className=" uppercase">{singleData?.payment_status}</span>
              </p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto mt-10">
          <h2 className="font-bold text-lg py-3">Order Summary:</h2>
          {isLoading ? (
            <EditProductInfoSkeleton />
          ) : (
            <table className="min-w-full border-collapse border dark:border-gray-500">
              <thead className="bg-blue-100 dark:bg-gray-700 h-[55px] shadow-sm border-b border-gray-300 dark:border-gray-700 p-20">
                <tr>
                  <th className="dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Product
                  </th>
                  <th className="border dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Net Unit Cost
                  </th>
                  <th className="border dark:border-gray-600 px-4 py-2 whitespace-nowrap dark:text-gray-300">
                    Quantity
                  </th>
                  <th className="border dark:border-gray-600 px-4 py-2 w-28 dark:text-gray-300">
                    Unit cost
                  </th>
                  <th className="border dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Discount
                  </th>

                  <th className="border dark:border-gray-600 px-4 py-2 dark:text-gray-300">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {singleData?.return_products?.map(
                  (productData: any, index: string) => (
                    <tr key={index}>
                      <td className="border dark:border-gray-600 px-4 py-2 text-center min-w-52">
                        <div className="flex items-center gap-4">
                          <Image
                            src={productData?.product?.featured_image?.src}
                            alt={productData?.product?.featured_image?.title}
                            width={50}
                            height={50}
                            className=" rounded-lg "
                          />
                          <p>{productData?.product?.title}</p>
                        </div>
                      </td>
                      <td className="border dark:border-gray-600 dark:text-gray-300 px-4 py-2 font-medium min-w-36">
                        {productData?.unit_cost}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-center dark:text-gray-400">
                        {productData?.quantity}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                        {productData?.unit_cost}
                      </td>
                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                        {productData?.discount}
                      </td>

                      <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                        {productData?.subtotal}
                      </td>
                    </tr>
                  )
                )}

                <tr>
                  <td colSpan={4}></td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400">
                    Discount:
                  </td>

                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {singleData?.discount}
                  </td>
                </tr>

                <tr>
                  <td colSpan={4}></td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400">
                    Shipping:
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {singleData?.shipping}
                  </td>
                </tr>

                <tr>
                  <td colSpan={4}></td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400 text-nowrap">
                    Grand Total :
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {singleData?.grand_total}
                  </td>
                </tr>

                <tr>
                  <td colSpan={4}></td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400">
                    Paid:
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {singleData?.paid}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4}></td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right font-semibold dark:text-gray-400 text-nowrap">
                    Due:
                  </td>
                  <td className="border dark:border-gray-600 px-4 py-2 text-right dark:text-gray-400">
                    {singleData?.due}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
