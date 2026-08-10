import React, { useContext, useState } from "react";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Image from "next/image";
import { hasPermission } from "@admin/utils";
import Icon from "@admin/components/core/Icon/Icon";
import { ProductsContext } from "@/app/admin/product/products/page";
import { useRouter } from "next/navigation";
import ProductReportModal from "../../Report/ProductReport/ProductReportModal";
import { IProduct } from "@admin/@interfaces/productReport/allProduct.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Link from "next/link";

const getTotalStock = (item: IProduct) => {
  if (Array.isArray(item?.variants) && item.variants.length > 0) {
    return item.variants.reduce(
      (sum, v) => sum + (Number(v?.inventory?.stock_quantity) || 0),
      0,
    );
  }
  return Number(item?.inventory?.stock_quantity) || 0;
};

const isOutOfStock = (item: IProduct) => {
  if (Array.isArray(item?.variants) && item.variants.length > 0) {
    return item.variants.every((v) => {
      const status = v?.inventory?.stock_status;
      return (
        status === "out_of_stock" ||
        status === "out-of-stock" ||
        (Number(v?.inventory?.stock_quantity) || 0) <= 0
      );
    });
  }
  const status = item?.inventory?.stock_status;
  return status === "out_of_stock" || status === "out-of-stock";
};

const ProductTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const {
    productData,
    tableLoading,
    handleImageClick,
    togglePopup,
    popupIndex,
    popupRef,
    handleDelete,
    setSortOrder,
    sortOrder,
    selectedProductIds,
    setSelectedProductIds,
  } = useContext(ProductsContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [productId, setProductId] = useState<string>();

  const allVisibleIds = (productData || [])
    .map((p: IProduct) => p?._id)
    .filter(Boolean) as string[];

  const isAllVisibleSelected =
    !!allVisibleIds.length &&
    allVisibleIds.every((id) => selectedProductIds?.includes(id));

  const toggleSelectAllVisible = () => {
    if (!setSelectedProductIds) return;

    setSelectedProductIds((prev: string[]) => {
      if (isAllVisibleSelected) {
        const visibleSet = new Set(allVisibleIds);
        return prev.filter((id) => !visibleSet.has(id));
      }

      const merged = new Set([...(prev || []), ...allVisibleIds]);
      return Array.from(merged);
    });
  };

  const toggleRowSelection = (id: string) => {
    if (!setSelectedProductIds) return;
    setSelectedProductIds((prev: string[]) => {
      if (prev?.includes(id)) return prev.filter((x) => x !== id);
      return [...(prev || []), id];
    });
  };

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
        colValue={11}
      >
        <Thead>
          <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
            <Th className="dark:text-gray-300 2xl:min-w-14 lg:min-w-12 min-w-12">
              <input
                type="checkbox"
                checked={isAllVisibleSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelectAllVisible();
                }}
                className="h-4 w-4 cursor-pointer"
              />
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-28">
              Quick View
            </Th>
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
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-28 min-w-28">
              Sale Price
            </Th>

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
              Is Seo
            </Th>
            <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
              Action
            </Th>
          </Tr>
        </Thead>
        <Tbody className="dark:bg-gray-800 bg-white">
          {productData?.map((item: IProduct, index: number) => {
            const isSelected = selectedProductIds?.includes(item?._id);
            const outOfStock = isOutOfStock(item);

            return (
              <Tr key={item?._id || index} className="h-14">
                <Td>
                  <input
                    type="checkbox"
                    checked={!!isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (!item?._id) return;
                      toggleRowSelection(item._id);
                    }}
                    className="h-4 w-4 cursor-pointer"
                  />
                </Td>
                <Td className="">
                  <div
                    className="bg-lime-500 px-2 py-0.5 rounded-lg text-white text-center w-20 cursor-pointer"
                    onClick={() => {
                      setModalOpen(true);
                      setProductId(item?._id);
                    }}
                  >
                    Report
                  </div>
                </Td>
                <Td>
                  {item?.featured_image?.src ? (
                    <Image
                      key={index}
                      src={item.featured_image.src}
                      alt={item?.featured_image?.title || "Product Image"}
                      width="70"
                      height="70"
                      className="bg-gray-300 rounded cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(item.featured_image.src);
                      }}
                    />
                  ) : (
                    <div className="h-[70px] w-[70px] bg-gray-200 rounded" />
                  )}
                </Td>
                <Td className="text-base font-bold">{item?.title}</Td>
                <Td className="">{item?.categories?.join(", ")}</Td>
                <Td>{item.sku}</Td>
                <Td>{item?.pricing?.sale_price}</Td>
                <Td>{getTotalStock(item)}</Td>
                <Td>
                  <Link
                    href={`https://naviforce.com.bd/product/${item?.slug}`}
                    target="_blank"
                    className="data-table-view-btn"
                  >
                    View
                  </Link>
                </Td>

                <Td className="text-base font-semibold">
                  <div
                    className={` w-28 text-center text-white  rounded-lg py-0.5 ${
                      outOfStock ? "bg-red-600" : "bg-green-600"
                    } 
                   `}
                  >
                    {outOfStock ? "Out Of Stock" : "In Stock"}
                  </div>
                </Td>

                <Td>
                  {(item?.featured_product || item?.is_seo) && (
                    <div className="rounded-full">
                      <Icon
                        name="check_circle"
                        className="h-5 w-5 text-green-600"
                      />
                    </div>
                  )}
                </Td>

                <Td className="">
                  <div className="relative">
                    <Icon
                      name={"more_horiz"}
                      variant="outlined"
                      onClick={() => togglePopup(index)}
                      className="cursor-pointer"
                    />
                    {popupIndex === index && (
                      <div
                        ref={popupRef}
                        className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                      >
                        {hasPermission(permissionList, "product_edit") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => {
                              router.push(
                                `/admin/product/products/edit/${item?._id}`,
                              );
                            }}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(permissionList, "product_delete") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleDelete(item?._id)}
                          >
                            Delete
                          </button>
                        )}

                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          onClick={() => {
                            router.push(
                              `/admin/product/products/duplicate/${item?._id}`,
                            );
                          }}
                        >
                          Duplicate
                        </button>
                      </div>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </TableWrapper>
      <ProductReportModal
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        productId={productId}
      />
    </div>
  );
};

export default ProductTable;
