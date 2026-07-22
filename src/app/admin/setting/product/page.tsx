"use client";

import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { useEffect, useRef, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import ProductModal from "@admin/components/pages/Settings/Product/ProductModal";

const Page = () => {
  const [websiteOptions, setWebsiteOptions] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);

  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          setWebsiteOptions(res.data.data);
        }
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    fetchWebList();
  }, []);

  const handleEditClick = (data: any) => {
    setItems(data);

    setIsModalOpen(true);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-gray-300">
            Update Product Setting
          </h2>
        </div>
      </NoScrollLayout>

      <div className="px-4 min-h-[85%]">
        <div className="bg-white dark:bg-gray-700 rounded-lg">
          <TableWrapper
            isSwitchOn={true}
            className="min-h-[650px]"
            data={websiteOptions}
            isLoading={tableLoading}
            noDataViewCondition={
              websiteOptions?.length < 1 ? "No data available" : null
            }
            colValue={10}
          >
            <Thead>
              <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                <Th className="dark:text-gray-300">Name</Th>
                <Th className="dark:text-gray-300">Url</Th>
                <Th className="dark:text-gray-300">Action</Th>
              </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
              {websiteOptions?.map((data: any, index: number) => {
                return (
                  <Tr className="h-14" key={index}>
                    <Td className="">{data?.web_name}</Td>
                    <Td>{data?.web_url}</Td>
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
                            className="absolute top-8 -left-14 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                          >
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
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
        </div>
        <ProductModal
          items={items}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
