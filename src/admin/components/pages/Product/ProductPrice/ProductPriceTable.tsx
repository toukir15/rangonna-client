import React, { useContext } from "react";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import {
  ProductsPriceContext,
  SortField,
  SortItem,
} from "@/app/admin/product/pricing/page";
import { ProductPrice } from "@admin/@interfaces/productReport/product.interface";
import Icon from "@admin/components/core/Icon/Icon";

const ProductPriceTable: React.FC = () => {
  const {
    productData,
    tableLoading,
    handleImageClick,
    setSortOrders,
    sortOrders,
  } = useContext(ProductsPriceContext);

  const handleSort = (field: SortField) => {
    setSortOrders((prev: any) => {
      const existing = prev.find((s: any) => s.field === field);
      if (!existing) {
        return [...prev, { field, direction: "asc" }];
      }

      if (existing.direction === "asc") {
        return prev.map((s: any) =>
          s.field === field ? { ...s, direction: "desc" } : s
        );
      }

      return prev.filter((s: any) => s.field !== field);
    });
  };

  const SortIcons = ({
    field,
    sortOrders,
  }: {
    field: SortField;
    sortOrders: SortItem[];
  }) => {
    const current = sortOrders.find((s) => s.field === field);

    return (
      <div className="mt-2">
        <div className="h-1.5">
          <Icon
            name="arrow_drop_up"
            className={
              current?.direction === "asc" ? "text-black" : "text-gray-400"
            }
          />
        </div>
        <div>
          <Icon
            name="arrow_drop_down"
            className={
              current?.direction === "desc" ? "text-black" : "text-gray-400"
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      <TableWrapper
        isSwitchOn={true}
        className="min-h-[700px]"
        data={productData}
        isLoading={tableLoading}
        noDataViewCondition={productData?.length < 1 && "No data available"}
        colValue={9}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-24 min-w-20">
              Image
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              Name
            </Th>

            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("pricing.sale_price")}
              >
                <p>Sale</p>
                <SortIcons field="pricing.sale_price" sortOrders={sortOrders} />
              </div>
            </Th>

            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("pricing.purchase_price")}
              >
                <p>Purchase</p>
                <SortIcons
                  field="pricing.purchase_price"
                  sortOrders={sortOrders}
                />
              </div>
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              <div
                className="flex items-center cursor-pointer"
                onClick={() =>
                  handleSort("wholesale_pricing.wholesale_vip_price")
                }
              >
                <p>Wholesale VIP</p>
                <SortIcons
                  field="wholesale_pricing.wholesale_vip_price"
                  sortOrders={sortOrders}
                />
              </div>
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("wholesale_pricing.wholesale_price")}
              >
                <p>Wholesale</p>
                <SortIcons
                  field="wholesale_pricing.wholesale_price"
                  sortOrders={sortOrders}
                />
              </div>
            </Th>

            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleSort("wholesale_pricing.resale_price")}
              >
                <p>Resale</p>
                <SortIcons
                  field="wholesale_pricing.resale_price"
                  sortOrders={sortOrders}
                />
              </div>
            </Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {productData?.map((item: ProductPrice, index: number) => {
            return (
              <Tr key={index} className="h-14">
                <Td>
                  <Image
                    key={index}
                    src={item?.featured_image?.src}
                    alt={item?.featured_image?.title}
                    width="70"
                    height="70"
                    className="bg-gray-300 rounded cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(item?.featured_image?.src);
                    }}
                  />
                </Td>
                <Td className="text-base font-bold">{item?.title}</Td>

                <Td>{item?.pricing?.sale_price}</Td>

                <Td>{item?.pricing?.purchase_price}</Td>
                <Td>{item?.wholesale_pricing?.wholesale_vip_price}</Td>
                <Td>{item?.wholesale_pricing?.wholesale_price}</Td>
                <Td>{item?.wholesale_pricing?.resale_price}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default ProductPriceTable;
