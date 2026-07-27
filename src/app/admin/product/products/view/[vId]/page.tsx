"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import { ReportIssueStatusStyle } from "@admin/utils/system.utils";
import WarehouseReportModal from "@admin/components/pages/Report/WarehouseReport/WarehouseReportModal";
import OrdersTab from "@admin/components/pages/Orders/Components/OrdersTab";
import { debounce } from "@admin/utils";

const Page: React.FC = () => {
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<SelectOption>({
    value: "all",
    label: "All Website",
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [reportIssueData, setReportIssueData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      // const savedFilter = localStorage.getItem("ordersFilter");
      return "sales";
    }
    return "sales";
  });

  useEffect(() => {
    fetchWebList();
  }, []);

  const fetchWebList = async () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          const options = res.data.data.map((item: any) => ({
            label: item.web_name,
            value: item.web_url,
          }));
          setWebsiteOptions([
            { value: "all", label: "All Website" },
            ...options,
          ]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const getReportIssue = () => {
    setTableLoading(true);
    ReportIssueCategoryService.getReportIssue()
      .then((res: any) => {
        if (res?.success) {
          setReportIssueData(res?.data.data);
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

  useEffect(() => {
    getReportIssue();
  }, []);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSearchQuery("");
  };

  const debouncedSearch = debounce((query: string) => {
    handleSearch(query);
  }, 1000);

  const handleSearch = (query: any) => {
    setTableLoading(true);
    setSearchQuery(query);
    setTimeout(() => {
      setTableLoading(false);
    }, 500);
  };

  const allStatuses = [
    { status: "sales", name: "Sales" },
    { status: "purchases", name: "Purchases" },
    { status: "sales_return", name: "Sales Return" },
    { status: "transfer", name: "Transfer" },
    { status: "adjustment", name: "Adjustment" },
  ];
  useTableRefreshRegister(getReportIssue);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap  items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <div className="">
                <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 md:mb-0 mb-2 flex text-nowrap">
                  View Product
                </h1>
              </div>
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-5">
                  <SelectComponent
                    options={websiteOptions}
                    value={selectedWebsite}
                    onChange={setSelectedWebsite}
                    placeholder="All Websites"
                    className="md:w-48 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <OrdersTab
              filter={filter}
              searchQuery={searchQuery}
              handleFilterChange={handleFilterChange}
              debouncedSearch={debouncedSearch}
              allStatuses={allStatuses}
              IsSearch={false}
            />
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full ">
        <TableWrapper
          showCheckbox={true}
          data={reportIssueData}
          noDataViewCondition={
            reportIssueData.length < 1 ? "No data available" : null
          }
          isSwitchOn={true}
          className="min-h-[650px]"
          isLoading={tableLoading}
          colValue={9}
        >
          <Thead>
            <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
              <Th className="2xl:min-w-32 lg:min-w-14 min-w-32 text-blue-900 dark:text-gray-200 text-nowrap">
                ID
              </Th>

              <Th className="2xl:min-w-40 lg:min-w-32 min-w-40  text-blue-900 dark:text-gray-200 text-nowrap">
                Product Name
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 ps-10 text-nowrap">
                Supplier
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200 text-nowrap">
                Warehouse
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Quantity
              </Th>
              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Date
              </Th>

              <Th className="2xl:min-w-36 lg:min-w-28 min-w-36 text-blue-900 dark:text-gray-200">
                Subtotal
              </Th>
            </Tr>
          </Thead>
          <Tbody className="dark:bg-gray-800 bg-white">
            {reportIssueData?.map((reportIssue: any, index: number) => {
              return (
                <Tr
                  className=" hover:bg-gray-100 dark:hover:bg-gray-800"
                  key={index}
                >
                  <Td>{reportIssue?.issue_title}</Td>
                  <Td>{reportIssue?.issue_sub_title}</Td>

                  <Td>
                    <div
                      className={`w-40 text-center ${ReportIssueStatusStyle(
                        reportIssue?.status
                      )}`}
                    >
                      {reportIssue?.status === "product-sent-to-supplier"
                        ? "S-SUP"
                        : reportIssue?.status === "received-from-supplier"
                          ? "R-SUP"
                          : reportIssue?.status}
                    </div>
                  </Td>

                  <Td>{formatTimeAgo(reportIssue?.createdAt)}</Td>
                  <Td>{formatTimeAgo(reportIssue?.createdAt)}</Td>
                  <Td>{formatTimeAgo(reportIssue?.createdAt)}</Td>
                  <Td>{formatTimeAgo(reportIssue?.createdAt)}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </TableWrapper>

        <WarehouseReportModal
          isModalOpen={modalOpen}
          setIsModalOpen={setModalOpen}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
