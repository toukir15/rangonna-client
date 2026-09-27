"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";
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

const sizeRank = (size: string) => {
  const value = parseFloat(String(size || "").replace(/[^\d.]/g, ""));
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { pId } = useParams();
  const router = useRouter();
  const [singleData, setSingleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pdfRef = useRef<HTMLDivElement>(null);

  const getPurchases = () => {
    setIsLoading(true);
    PurchasesService.getSinglePurchases(pId)
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
    if (!pdfRef.current) return;

    const element = pdfRef.current;

    const options = {
      margin: 0.5,
      filename: `Purchase-${singleData?.invoice || "invoice"}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(element).save();
  };
  const handlePrint = () => {
    window.print();
  };
  useTableRefreshRegister(getPurchases);

  const money = (value: unknown) =>
    `৳ ${Number(value || 0).toLocaleString("en-BD")}`;

  const totalQty = singleData?.purchase_products?.reduce(
    (sum: number, product: any) => sum + (product?.quantity || 0),
    0,
  );

  const groupedProducts = useMemo(() => {
    const lines = singleData?.purchase_products || [];
    const groups: {
      id: string;
      title: string;
      image?: { src?: string; title?: string };
      lines: any[];
    }[] = [];
    const index = new Map<string, (typeof groups)[number]>();

    lines.forEach((line: any, lineIndex: number) => {
      const id = String(line?.product?._id || line?.product || lineIndex);
      let group = index.get(id);
      if (!group) {
        group = {
          id,
          title: line?.product?.title || "Product",
          image: line?.product?.featured_image,
          lines: [],
        };
        index.set(id, group);
        groups.push(group);
      }
      group.lines.push(line);
    });

    groups.forEach((group) => {
      group.lines.sort((a, b) => {
        const diff = sizeRank(a?.size) - sizeRank(b?.size);
        if (diff !== 0) return diff;
        return String(a?.size || a?.sku || "").localeCompare(
          String(b?.size || b?.sku || ""),
        );
      });
    });

    return groups;
  }, [singleData]);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4">
        <PageHeader
          title={`Purchase Detail${singleData?.invoice ? ` · ${singleData.invoice}` : ""}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              {hasPermission(permissionList, "purchase_edit") && (
                <Button
                  className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                  onClick={() =>
                    router.push(
                      `/admin/purchase/purchase/edit-purchases/${singleData?._id}`,
                    )
                  }
                  disabled={isLoading}
                >
                  <Icon name="edit_document" size={16} />
                  Edit
                </Button>
              )}
              <Button
                className="btn-secondary inline-flex items-center gap-2"
                onClick={handlePdf}
                disabled={isLoading}
              >
                <Icon name="picture_as_pdf" size={16} />
                PDF
              </Button>
              <Button
                className="btn-secondary inline-flex items-center gap-2"
                onClick={handlePrint}
                disabled={isLoading}
              >
                <Icon name="print" size={16} />
                Print
              </Button>
            </div>
          }
        />

        <div className="hidden">
          <div ref={pdfRef}>
            <PurchasePdf data={singleData} />
          </div>
        </div>

        {isLoading ? (
          <PurchaseSkeleton />
        ) : (
          <div className="purchase-detail-grid">
            <section className="purchase-detail-card">
              <h3>Supplier</h3>
              <p className="purchase-detail-name">{singleData?.supplier?.name}</p>
              <p className="purchase-detail-meta">{singleData?.supplier?.email}</p>
              <p className="purchase-detail-meta">{singleData?.supplier?.phone}</p>
              <p className="purchase-detail-meta">{singleData?.supplier?.address}</p>
            </section>
            <section className="purchase-detail-card">
              <h3>Company</h3>
              <p className="purchase-detail-name">Naviforce</p>
              <p className="purchase-detail-meta">admin@example.com</p>
              <p className="purchase-detail-meta">01841544590</p>
              <p className="purchase-detail-meta">14, Purana Paltan, Dhaka-1000</p>
            </section>
            <section className="purchase-detail-card">
              <h3>Purchase</h3>
              <div className="purchase-detail-line">
                <span>Reference</span>
                <strong>{singleData?.invoice}</strong>
              </div>
              <div className="purchase-detail-line">
                <span>Status</span>
                <span className={getStatusStyle(singleData?.status)}>
                  {singleData?.status}
                </span>
              </div>
              <div className="purchase-detail-line">
                <span>Warehouse</span>
                <strong>{singleData?.warehouse?.title}</strong>
              </div>
              <div className="purchase-detail-line">
                <span>Payment</span>
                <span className={getStatusStyle(singleData?.payment_status)}>
                  {singleData?.payment_status}
                </span>
              </div>
            </section>
          </div>
        )}

        <div className="edit-order-products-card mt-4">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Order summary</p>
            <p className="premium-table-toolbar-meta">
              {groupedProducts.length}{" "}
              {groupedProducts.length === 1 ? "product" : "products"} ·{" "}
              {totalQty || 0} pcs
            </p>
          </div>
          {isLoading ? (
            <div className="p-4">
              <EditProductInfoSkeleton />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="edit-order-products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="is-right">Net unit cost</th>
                      <th className="is-center">Quantity</th>
                      <th className="is-right">Unit cost</th>
                      <th className="is-right">Discount</th>
                      <th className="is-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedProducts.map((group) => {
                      const groupQty = group.lines.reduce(
                        (sum, line) => sum + (Number(line?.quantity) || 0),
                        0,
                      );
                      const groupDiscount = group.lines.reduce(
                        (sum, line) => sum + (Number(line?.discount) || 0),
                        0,
                      );
                      const groupSubtotal = group.lines.reduce(
                        (sum, line) => sum + (Number(line?.subtotal) || 0),
                        0,
                      );
                      const unitCost = group.lines[0]?.unit_cost;

                      return (
                        <Fragment key={group.id}>
                          <tr className="edit-order-group-row">
                            <td>
                              <div className="edit-order-group-product">
                                {group.image?.src ? (
                                  <Image
                                    src={group.image.src}
                                    alt={group.image.title || group.title}
                                    width={44}
                                    height={44}
                                    className="rounded-lg object-cover"
                                  />
                                ) : null}
                                <div className="min-w-0">
                                  <p className="data-table-primary">{group.title}</p>
                                  <p className="purchase-detail-meta">
                                    {group.lines.length}{" "}
                                    {group.lines.length === 1 ? "size" : "sizes"} ·{" "}
                                    {groupQty} pcs
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="is-right">{money(unitCost)}</td>
                            <td className="is-center">{groupQty}</td>
                            <td className="is-right">{money(unitCost)}</td>
                            <td className="is-right">{money(groupDiscount)}</td>
                            <td className="is-right">{money(groupSubtotal)}</td>
                          </tr>
                          {group.lines.map((line, lineIndex) => (
                            <tr
                              key={`${group.id}-${line?.sku || line?.size || lineIndex}`}
                              className="edit-order-size-row"
                            >
                              <td>
                                <span className="purchase-size-tag is-row">
                                  {line?.size || line?.sku || "—"}
                                </span>
                              </td>
                              <td />
                              <td className="is-center">{line?.quantity}</td>
                              <td />
                              <td className="is-right">{money(line?.discount)}</td>
                              <td className="is-right">{money(line?.subtotal)}</td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="purchase-detail-totals">
                <div className="purchase-detail-total-row">
                  <span>Discount</span>
                  <strong>{money(singleData?.discount)}</strong>
                </div>
                <div className="purchase-detail-total-row">
                  <span>Shipping</span>
                  <strong>{money(singleData?.shipping)}</strong>
                </div>
                <div className="purchase-detail-total-row">
                  <span>Grand total</span>
                  <strong>{money(singleData?.grand_total)}</strong>
                </div>
                <div className="purchase-detail-total-row">
                  <span>Paid</span>
                  <strong>{money(singleData?.paid)}</strong>
                </div>
                <div className="purchase-detail-total-row is-due">
                  <span>Due</span>
                  <strong>{money(singleData?.due)}</strong>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
