import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { TransfersMoneyContext } from "@/app/admin/account/transfer-money/page";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";

const TransfersMoneyTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    transfersMoneyData,
    tableLoading,
    handleEditClick,
    // handleRemove,
    setItems,
  } = useContext(TransfersMoneyContext);

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
      data={transfersMoneyData}
      isLoading={tableLoading}
      noDataViewCondition={
        transfersMoneyData.length < 1 ? "No data available" : null
      }
      colValue={7}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            <div className="flex items-center ">
              <div>
                <p>From Account</p>
              </div>
              <div className="mt-2">
                {" "}
                <div className="h-1.5">
                  <Icon name={"arrow_drop_up"} className=" cursor-pointer" />
                </div>
                <div className="">
                  <Icon name={"arrow_drop_down"} className=" cursor-pointer" />{" "}
                </div>
              </div>
            </div>
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            To Account
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Amount
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Create Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-40">
            Update Date
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Note
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {transfersMoneyData?.map((item: any, index: number) => {
          return (
            <Tr className="h-14" key={index}>
              <Td>{item?.from_account?.account_name}</Td>
              <Td className="text-base font-bold">
                {item?.to_account?.account_name}
              </Td>
              <Td className="">{item?.amount}</Td>
              <Td>{formatTimeAgo(item?.createdAt)}</Td>
              <Td>{formatTimeAgo(item?.updatedAt)}</Td>

              <Td>{item?.note}</Td>

              <Td className="">
                {hasPermission(
                  permissionList,
                  "account_transfer_money_edit"
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
                          className="absolute top-8 right-0 bg-white border shadow-md rounded-lg p-4 z-20 min-w-40 dark:bg-gray-700 dark:border-gray-500"
                        >
                          {hasPermission(
                            permissionList,
                            "account_transfer_money_edit"
                          ) && (
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                onClick={() => {
                                  handleEditClick();
                                  setItems(item);
                                }}
                              >
                                Edit
                              </button>
                            )}
                          {/* {hasPermission(
                          permissionList,

                          "tran_mone_d"
                        ) && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => handleRemove(item?._id)}
                          >
                            Delete
                          </button>
                        )} */}
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

export default TransfersMoneyTable;
