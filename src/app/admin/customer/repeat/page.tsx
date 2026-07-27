"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
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
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

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
  const totalPages = Math.ceil(totalOrders / ordersPerPage);  const [selectedType, setSelectedType] = useState<SelectOption>({
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
          s.field === field ? { ...s, direction: "desc" } : s
        );
      }

      return prev.filter((s: SortItem) => s.field !== field);
    });
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

      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">

          <div className="flex flex-wrap items-center items-center gap-3 mb-3">
            <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 text-nowrap">
              Repeat Customers
            </h1>
              <AllFilter
                isWebsiteFilter={true}
                websiteOptions={customerOptions}
                selectedWebsite={selectedType}
                setSelectedWebsite={setSelectedType}
              />
          </div>

          
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[84%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={customerData}
          noDataViewCondition={
            customerData?.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[700px]"
          isLoading={tableLoading}
          colValue={6}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-40 text-blue-900 dark:text-gray-200">
                Name
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Phone
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Customer Type
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                Active
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("total_orders")}
                >
                  <p>Total Orders</p>
                  <SortIcons field="total_orders" sortOrders={sortOrders} />
                </div>
              </Th>
              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200">
                <div className="flex flex-wrap items-center items-center cursor-pointer">
                  <p>Delivery Total</p>
                </div>
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {customerData?.map((customer: ICustomer, index: number) => {
              return (
                <Tr
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{customer.first_name}</Td>
                  <Td>{customer?.phone}</Td>
                  <Td>{customer?.customer_group}</Td>
                  <Td>
                    {customer?.is_active === true ? "Active" : "InActive"}
                  </Td>
                  <Td>{customer?.total_orders}</Td>
                  <Td>{customer?.total_delivery_orders}</Td>
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
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
