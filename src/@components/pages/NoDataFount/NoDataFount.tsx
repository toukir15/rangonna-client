import React, { JSX, useEffect, useState } from "react";
import Link from "next/link";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";
import PapularProduct from "./ProductNotFound";

const NoDataFound = (): JSX.Element => {
  const [productData, setProductData] = useState<any>();
  useEffect(() => {
    ProductService.getProduct({
      limit: "5",
      category: "all",
      sort: "best-selling",
    })
      .then((res: any) => {
        if (res?.success) {
          setProductData((res.data.data || []).slice(0, 5));
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, []);

  return (
    <div className="rongonaa-empty">
      <div className="rongonaa-empty__panel">
        <p className="rongonaa-empty__eyebrow">Nothing here yet</p>
        <h2 className="rongonaa-empty__title">No products found</h2>
        <p className="rongonaa-empty__desc">
          Try adjusting your filters, or explore our collections for soft luxury
          stacks she’ll love.
        </p>
        <div className="rongonaa-empty__actions">
          <Link href="/watches" className="rongonaa-empty__btn rongonaa-empty__btn--primary">
            Browse all
          </Link>
          <Link href="/watches/flash-sale" className="rongonaa-empty__btn rongonaa-empty__btn--ghost">
            Flash sale
          </Link>
        </div>
      </div>

      <PapularProduct products={productData} />
    </div>
  );
};

export default NoDataFound;
