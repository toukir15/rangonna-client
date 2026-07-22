import React, { JSX, useEffect, useState } from "react";
import Icon from "@/@components/core/Icon/Icon";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";
import PapularProduct from "./ProductNotFound";

const NoDataFound = (): JSX.Element => {
  const [productData, setProductData] = useState<any>();
  useEffect(() => {
    ProductService.getProduct({
      limit: "20",
      category: "all",
      sort: "best-selling",
    })
      .then((res: any) => {
        if (res?.success) {
          setProductData(res.data.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, []);

  return (
    <div className="w-full px-4 bg-white rounded-lg mt-4">
      <div className="md:h-[50vh] h-[60vh] flex flex-col justify-center items-center  ">
        <div className="text-center w-full">
          <div className="flex items-center justify-center">
            <Icon
              name="production_quantity_limits"
              size={200}
              variant="outlined"
            />
          </div>

          <p className="pt-4 text-lg font-semibold text-gray-700">
            Sorry! We couldn’t find any products. 😔
          </p>
          <p className="pt-2 text-sm text-gray-500">
            Try adjusting your filters or browse our categories to discover more
            amazing items.
          </p>
        </div>
      </div>
      <PapularProduct products={productData} />
    </div>
  );
};

export default NoDataFound;
