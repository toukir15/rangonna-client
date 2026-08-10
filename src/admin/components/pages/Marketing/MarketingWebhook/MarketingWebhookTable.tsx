import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import { MarketingWebHookContext } from "@/app/admin/marketing/marketing-webhook/page";
import { MarketingWebhook } from "@admin/@interfaces/marketing/marketingWebhook.interface";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";

const MarketingWebhookTable: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const {
    marketingWebhookData,
    tableLoading,
    // handleEditClick,
    handleRemove,
    // setItems,
    activeToggleLoading,
    toggleIsActive,
  } = useContext(MarketingWebHookContext);

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
      className="min-h-[600px]"
      data={marketingWebhookData}
      isLoading={tableLoading}
      noDataViewCondition={
        marketingWebhookData.length < 1 ? "No data available" : null
      }
      colValue={4}
    >
      <Thead>
        <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Webhook Url
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Active
          </Th>
          <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-14 min-w-32">
            Action
          </Th>
        </Tr>
      </Thead>
      <Tbody className="dark:bg-gray-800 bg-white">
        {marketingWebhookData?.map(
          (webhook: MarketingWebhook, index: number) => {
            return (
              <Tr className="h-14" key={index}>
                <Td className="">{webhook?.webhook_url}</Td>
                <Td className="">
                  {activeToggleLoading[webhook._id] ? (
                    <Icon
                      name="restart_alt"
                      size={28}
                      className={`text-green-600 animate-spin ml-5`}
                    />
                  ) : (
                    <ToggleSwitch
                      isChecked={webhook.is_active}
                      onToggle={() => {
                        toggleIsActive(webhook);
                      }}
                      disabled={
                        activeToggleLoading[webhook?._id] ||
                        !hasPermission(
                          permissionList,
                          "marketing_webhook_create"
                        )
                      }
                    />
                  )}
                </Td>

                <Td className="">
                  {hasPermission(
                    permissionList,
                    "marketing_webhook_delete"
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
                          className="absolute top-8 2xl:right-48 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                        >
                          {/* {hasPermission(permissionList, "mark_e") && (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                            onClick={() => {
                              handleEditClick();
                              setItems(webhook);
                            }}
                          >
                            Edit
                          </button>
                        )} */}
                          {hasPermission(
                            permissionList,
                            "marketing_webhook_delete"
                          ) && (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleRemove(webhook?._id)}
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

export default MarketingWebhookTable;
