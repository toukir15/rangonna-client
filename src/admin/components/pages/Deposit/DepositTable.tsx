"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { DepositContext } from "@/app/admin/account/deposit/page";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

type DepositTableProps = {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  range: any;
  setRange: any;
  onRefresh: () => void;
};

const formatAmount = (value: unknown) => {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? "—");
  return num.toLocaleString();
};

const DepositTable: React.FC<DepositTableProps> = ({
  searchTerm,
  onSearchChange,
  range,
  setRange,
  onRefresh,
}) => {
  const { permissionList } = useGlobalContext();
  const { deposit, tableLoading, handleEditClick } = useContext(DepositContext);

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
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  const totalCount = deposit?.length ?? 0;

  return (
    <div className="data-table-card glass-card rounded-2xl overflow-hidden flex flex-col">
      <div className="premium-table-toolbar">
        <p className="premium-table-toolbar-title">Deposit records</p>
        <p className="premium-table-toolbar-meta">
          {totalCount} {totalCount === 1 ? "deposit" : "deposits"}
        </p>
      </div>

      <div className="data-table-toolbar">
        <div className="data-table-toolbar-start">
          <label className="data-table-search">
            <Icon name="search" variant="outlined" size={18} />
            <input
              type="search"
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search deposits..."
              aria-label="Search deposits"
            />
          </label>
          <AllFilter isCalendarFilter={true} range={range} setRange={setRange} />
        </div>
        <div className="data-table-toolbar-end">
          <TableRefreshButton
            onRefresh={onRefresh}
            isLoading={tableLoading}
            className="!h-9"
          />
        </div>
      </div>

      <TableWrapper
        isSwitchOn={true}
        className="!mt-0 !min-h-[420px] !flex-1 !rounded-none !border-0 !shadow-none !bg-transparent [backdrop-filter:none]"
        data={deposit}
        isLoading={tableLoading}
        noDataViewCondition={deposit?.length < 1 ? "No data available" : null}
        colValue={8}
      >
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Amount</Th>
            <Th>Account</Th>
            <Th>Method</Th>
            <Th>Category</Th>
            <Th>Reference</Th>
            <Th>Created</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {deposit?.map((item: any, index: number) => {
            const canEdit =
              hasPermission(permissionList, "account_deposit_edit") &&
              item?.source === "courier-payment";

            return (
              <Tr key={item?._id ?? index}>
                <Td>
                  <span className="table-date-cell">
                    <Icon name="calendar_today" variant="outlined" size={14} />
                    {item?.createdAt ? formatTimeAgo(item.createdAt) : "—"}
                  </span>
                </Td>
                <Td>
                  <span className="table-amount">
                    {formatAmount(item?.amount)}
                  </span>
                </Td>
                <Td>
                  {item?.account?.account_name ? (
                    <span className="table-contact-line">
                      <Icon name="account_balance_wallet" variant="outlined" size={14} />
                      <span>{item.account.account_name}</span>
                    </span>
                  ) : (
                    <span className="table-empty-value">—</span>
                  )}
                </Td>
                <Td>
                  {item?.payment_method ? (
                    <span className="data-table-secondary">
                      {item.payment_method}
                    </span>
                  ) : (
                    <span className="table-empty-value">—</span>
                  )}
                </Td>
                <Td>
                  {item?.deposit_category?.title ? (
                    <span className="table-company-cell">
                      <Icon name="category" variant="outlined" size={14} />
                      <span>{item.deposit_category.title}</span>
                    </span>
                  ) : (
                    <span className="table-empty-value">—</span>
                  )}
                </Td>
                <Td>
                  <div className="table-user-info">
                    {item?.reference_no ? (
                      <span className="table-id-chip">{item.reference_no}</span>
                    ) : (
                      <span className="table-empty-value">—</span>
                    )}
                    {item?.note ? (
                      <p className="data-table-muted mt-1 line-clamp-2">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                </Td>
                <Td>
                  <div className="table-contact-stack">
                    <span className="table-contact-line">
                      <Icon name="person" variant="outlined" size={14} />
                      <span>{item?.user?.name || "—"}</span>
                    </span>
                    {item?.updatedAt ? (
                      <span className="table-date-cell">
                        <Icon name="schedule" variant="outlined" size={14} />
                        {formatTimeAgo(item.updatedAt)}
                      </span>
                    ) : null}
                  </div>
                </Td>
                <Td className="is-right">
                  {canEdit ? (
                    <div className="table-actions-cell relative">
                      <button
                        type="button"
                        className="data-table-action-btn"
                        aria-label="Row actions"
                        aria-expanded={popupIndex === index}
                        onClick={() => togglePopup(index)}
                      >
                        <Icon name="more_vert" variant="outlined" size={18} />
                      </button>
                      {popupIndex === index && (
                        <div ref={popupRef} className="data-table-row-menu">
                          <button
                            type="button"
                            onClick={() => {
                              handleEditClick(item);
                              setPopupIndex(null);
                            }}
                          >
                            <Icon name="edit" variant="outlined" size={16} />
                            Edit deposit
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="table-empty-value">—</span>
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

export default DepositTable;
