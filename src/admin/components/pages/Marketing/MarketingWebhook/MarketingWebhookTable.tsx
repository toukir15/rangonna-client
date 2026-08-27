import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { MarketingWebHookContext } from "@/app/admin/marketing/marketing-webhook/page";
import { MarketingWebhook } from "@admin/@interfaces/marketing/marketingWebhook.interface";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";

const MarketingWebhookTable: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const {
    marketingWebhookData,
    tableLoading,
    handleRemove,
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
      showCheckbox={false}
      isSwitchOn={true}
      className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
      data={marketingWebhookData}
      isLoading={tableLoading}
      noDataViewCondition={
        marketingWebhookData.length < 1 ? "No data available" : null
      }
      colValue={4}
    >
      <Thead>
        <Tr>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Webhook Url</Th>
          <Th className="2xl:min-w-32 lg:min-w-14 min-w-32">Active</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {marketingWebhookData?.map(
          (webhook: MarketingWebhook, index: number) => {
            return (
              <Tr key={index}>
                <Td>
                  <span className="data-table-primary">
                    {webhook?.webhook_url || noData}
                  </span>
                </Td>
                <Td>
                  {activeToggleLoading[webhook._id] ? (
                    <Icon
                      name="restart_alt"
                      size={28}
                      className="text-green-600 animate-spin ml-5"
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
                <Td className="is-right">
                  {hasPermission(
                    permissionList,
                    "marketing_webhook_delete"
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
                          {hasPermission(
                            permissionList,
                            "marketing_webhook_delete"
                          ) && (
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
