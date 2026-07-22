import React, { useContext, useEffect, useRef, useState } from "react";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { hasPermission, noData } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { IProduct } from "@admin/@interfaces/productReport/allProduct.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Link from "next/link";
import { WholeSaleProductsContext } from "@/app/admin/product/wholesale/page";
import Button from "@admin/components/core/Button/Button";

const WholeSaleProductTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    productData,
    tableLoading,
    handleImageClick,
    setSortOrder,
    sortOrder,
    handleRemove,
  } = useContext(WholeSaleProductsContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  const handleSort = () => {
    if (sortOrder === "") {
      setSortOrder("inventory.stock_quantity");
    } else if (sortOrder === "inventory.stock_quantity") {
      setSortOrder("-inventory.stock_quantity");
    } else {
      setSortOrder("inventory.stock_quantity");
    }
  };

  return (
    <div>
      <TableWrapper
        isSwitchOn={true}
        className="min-h-[700px]"
        data={productData}
        isLoading={tableLoading}
        noDataViewCondition={productData?.length < 1 && "No data available"}
        colValue={10}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-24 min-w-20">
              Image
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-52 lg:min-w-44 min-w-48">
              Name
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-48 lg:min-w-48 min-w-48">
              Category
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-20 min-w-20">
              SKU
            </Th>
            {/* <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-28">
              Vip
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-28">
              Regular
            </Th> */}

            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-20 min-w-24">
              <div
                className="flex items-center cursor-pointer"
                onClick={handleSort}
              >
                <div>
                  <p>Stock</p>
                </div>
                <div className="mt-2">
                  <div className="h-1.5">
                    <Icon
                      name={"arrow_drop_up"}
                      className={`${
                        sortOrder === "inventory.stock_quantity"
                          ? "text-black"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <Icon
                      name={"arrow_drop_down"}
                      className={`${
                        sortOrder === "-inventory.stock_quantity"
                          ? "text-black"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </Th>

            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-28">
              View
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              Status
            </Th>

            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-28">
              Action
            </Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {productData?.map((item: IProduct, index: number) => {
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
                <Td className="">{item?.categories?.join(", ")}</Td>
                <Td>{item.sku}</Td>
                {/* <Td>{item?.wholesale_pricing?.wholesale_vip_price}</Td>
                <Td>{item?.wholesale_pricing?.wholesale_price}</Td> */}
                <Td>{item?.inventory.stock_quantity || noData}</Td>
                <Td>
                  <Link
                    className="bg-blue-500 px-4 py-1 rounded-lg text-white text-center w-20 cursor-pointer"
                    href={`https://naviforce.com.bd/product/${item?.slug}`}
                    target="_blank"
                  >
                    View
                  </Link>
                </Td>

                <Td className="text-base font-semibold">
                  <div
                    className={` w-28 text-center   rounded-lg py-0.5 ${
                      item?.inventory?.stock_status === "out-of-stock"
                        ? "bg-red-100 border border-red-500 text-red-600"
                        : "bg-green-100 border border-green-600 text-green-600"
                    } 
                   `}
                  >
                    {item?.inventory?.stock_status === "out-of-stock"
                      ? "Out Of Stock"
                      : "In Stock"}
                  </div>
                </Td>

                <Td className="">
                  {hasPermission(permissionList, "wholesale_product_edit") && (
                    <Button
                      className="block w-full  !px-4 !text-sm text-center !py-1 bg-red-500  rounded-lg"
                      onClick={() => handleRemove(item?._id)}
                    >
                      Remove
                    </Button>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default WholeSaleProductTable;
