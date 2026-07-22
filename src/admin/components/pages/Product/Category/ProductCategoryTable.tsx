import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { ProductCategoryContext } from "@/app/admin/product/category/page";
import { IProductCategoryData } from "@admin/@interfaces/product/productCategory.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";

const ProductCategoryTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { productCategoryData, tableLoading, handleEditClick, handleRemove } =
    useContext(ProductCategoryContext);

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

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
  return (
    <TableWrapper
      isSwitchOn={true}
      className="min-h-[650px]"
      data={productCategoryData}
      isLoading={tableLoading}
      noDataViewCondition={
        productCategoryData?.length < 1 ? "No data available" : null
      }
      colValue={10}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px]  shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300">Title</Th>
          <Th className="dark:text-gray-300">Slug</Th>

          <Th className="dark:text-gray-300">Action</Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {productCategoryData?.map(
          (data: IProductCategoryData, index: number) => {
            return (
              <Tr className="h-14" key={index}>
                <Td className="">{data?.key}</Td>
                <Td>{data?.value}</Td>

                <Td className="">
                  {hasPermission(
                    permissionList,
                    "product_category_edit",
                    "product_category_delete"
                  ) && (
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
                          className="absolute top-8 -left-14 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                        >
                          {hasPermission(
                            permissionList,
                            "product_category_edit"
                          ) && (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
                            </button>
                          )}

                          {hasPermission(
                            permissionList,
                            "product_category_delete"
                          ) && (
                            <button
                              onClick={() => handleRemove(data._id)}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Td>
              </Tr>
            );
          }
        )}
      </Tbody>
    </TableWrapper>
  );
};

export default ProductCategoryTable;
