"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { CustomersService } from "@admin/@services/apis/Customers/Customer.service";
import {
  ICustomer,
  ICustomerListResponse,
} from "@admin/@interfaces/customers/customers.interface";
import SortIcons from "@admin/components/core/SortIcon/SortIcon";
import { SelectOption } from "@admin/@interfaces/common.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import Icon from "@admin/components/core/Icon/Icon";
import PageHeader from "@admin/components/layout/PageHeader";
import { noData, trimString } from "@admin/utils";

export type SortField = "total_orders";

type SortDirection = "asc" | "desc";

export interface SortItem {
  field: SortField;
  direction: SortDirection;
}

const Page: React.FC = () => {
  const [customerData, setCustomerData] = useState<ICustomer[]>([]);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  const [selectedType, setSelectedType] = useState<SelectOption>({
    value: "all",
    label: "All Types",
  });
  const [sortOrders, setSortOrders] = useState<SortItem[]>([]);
  const sortQuery = sortOrders
    .map((s) => (s.direction === "desc" ? `-${s.field}` : s.field))
    .join(",");

  const handleLogsPerPageChange = (newLogsPerPage: number) => {
    setOrdersPerPage(newLogsPerPage);
    localStorage.setItem("ordersLogsPerPage", newLogsPerPage.toString());
  };

  useEffect(() => {
    fetchCustomerLists();
  }, [sortOrders, currentPage, ordersPerPage, selectedType]);

  const fetchCustomerLists = async () => {
    setTableLoading(true);
    CustomersService.getCustomersLists({
      page: currentPage,
      limit: ordersPerPage,
      sort: sortQuery,
      customer_group: selectedType.value,
    })
      .then((res: ICustomerListResponse) => {
        if (res?.success) {
          setCustomerData(res.data.data);
          setTotalOrders(res?.data?.meta?.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const handleSort = (field: SortField) => {
    setSortOrders((prev: SortItem[]) => {
      const existing = prev.find((s: SortItem) => s.field === field);
      if (!existing) {
        return [...prev, { field, direction: "asc" }];
      }

      if (existing.direction === "asc") {
        return prev.map((s: SortItem) =>
          s.field === field ? { ...s, direction: "desc" } : s,
        );
      }

      return prev.filter((s: SortItem) => s.field !== field);
    });
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      ToastService.success("Number copied to clipboard!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      }
    }
  };

  const customerOptions = [
    {
      label: "All Types",
      value: "all",
    },
    {
      label: "General",
      value: "general",
    },
    {
      label: "Premium",
      value: "premium",
    },
  ];
  useTableRefreshRegister(fetchCustomerLists);

  return (
    <AuthLayout>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader title="Repeat Customers" />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Repeat records</p>
            <p className="premium-table-toolbar-meta">
              {totalOrders.toLocaleString()}{" "}
              {totalOrders === 1 ? "customer" : "customers"}
            </p>
          </div>

          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              <AllFilter
                isStatusFilter={true}
                statusOption={customerOptions}
                selectedStatus={selectedType}
                setSelectedStatus={setSelectedType}
              />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchCustomerLists}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <TableWrapper
            showCheckbox={false}
            data={customerData}
            noDataViewCondition={
              customerData?.length < 1 ? "No data available" : null
            }
            isSwitchOn={true}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
            isLoading={tableLoading}
            colValue={6}
          >
            <Thead>
              <Tr>
                <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Name</Th>
                <Th className="2xl:min-w-40 lg:min-w-32 min-w-40">Phone</Th>
                <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                  Customer Type
                </Th>
                <Th className="min-w-28">Active</Th>
                <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort("total_orders")}
                  >
                    <p>Total Orders</p>
                    <SortIcons field="total_orders" sortOrders={sortOrders} />
                  </div>
                </Th>
                <Th className="2xl:min-w-36 lg:min-w-28 min-w-36">
                  Delivery Total
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {customerData?.map((customer: ICustomer) => {
                const fullName = [customer.first_name, customer.last_name]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <Tr key={customer._id}>
                    <Td>
                      <span className="data-table-primary">
                        {trimString(fullName, 50) || noData}
                      </span>
                    </Td>
                    <Td>
                      {customer?.phone ? (
                        <span className="table-contact-line">
                          <Icon name="call" size={14} variant="outlined" />
                          <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                          <button
                            type="button"
                            className="table-copy-btn"
                            aria-label="Copy phone number"
                            title="Copy phone number"
                            onClick={() => copyToClipboard(customer.phone)}
                          >
                            <Icon
                              name="content_copy"
                              size={13}
                              variant="outlined"
                            />
                          </button>
                        </span>
                      ) : (
                        <span className="data-table-muted">{noData}</span>
                      )}
                    </Td>
                    <Td>
                      <span className="table-role-badge is-neutral">
                        {customer?.customer_group || noData}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={`table-role-badge ${
                          customer?.is_active ? "is-approved" : "is-rejected"
                        }`}
                      >
                        {customer?.is_active ? "Active" : "Inactive"}
                      </span>
                    </Td>
                    <Td>
                      <span className="table-amount">
                        {customer?.total_orders ?? 0}
                      </span>
                    </Td>
                    <Td>
                      <span className="table-amount">
                        {customer?.total_delivery_orders ?? 0}
                      </span>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableWrapper>

          <PaginationComponent
            ordersPerPage={ordersPerPage}
            handleOrdersPerPageChange={handleLogsPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalOrders}
            isShowText={true}
            onRefresh={fetchCustomerLists}
            isLoading={tableLoading}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
