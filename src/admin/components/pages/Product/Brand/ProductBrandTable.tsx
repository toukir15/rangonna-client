import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { IProductCategoryData } from "@admin/@interfaces/product/productCategory.interface";
import { ProductBrandContext } from "@/app/admin/product/brand/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";

const ProductBrandTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { productBrandData, tableLoading, handleEditClick, handleRemove } =
    useContext(ProductBrandContext);

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
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={productBrandData}
      isLoading={tableLoading}
      noDataViewCondition={
        productBrandData?.length < 1 ? "No data available" : null
      }
      colValue={10}
    >
      <Thead>
        <Tr>
          <Th>Title</Th>
          <Th>Slug</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {productBrandData?.map((data: IProductCategoryData, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {data?.key || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">{data?.value || noData}</span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "product_brand_edit",
                  "product_brand_delete",
                ) && (
                  <div className="relative max-w-40">
                    <button
                      type="button"
                      className="data-table-action-btn"
                      aria-expanded={popupIndex === index}
                      onClick={() => togglePopup(index)}
                    >
                      <Icon name="more_vert" variant="outlined" size={18} />
                    </button>
                    {popupIndex === index && (
                      <div
                        ref={popupRef}
                        className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                      >
                        {hasPermission(permissionList, "product_brand_edit") && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleEditClick(data)}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(
                          permissionList,
                          "product_brand_delete",
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleRemove(data._id)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
        })}
      </Tbody>
    </TableWrapper>
  );
};

export default ProductBrandTable;
