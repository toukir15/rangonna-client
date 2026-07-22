import React, { useContext } from "react";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Image from "next/image";
import paperfly from "@admin/assets/curiar/paperfly.svg";
import pathao from "@admin/assets/curiar/pathao.svg";
import redx from "@admin/assets/curiar/redx.svg";
import steadfast from "@admin/assets/curiar/steadfast.svg";
import { FraudCheckContext } from "@/app/admin/fraud-check/page";

const FraudCheckTable: React.FC = () => {
  const { courierData } = useContext(FraudCheckContext);
  return (
    <div className="mt-6">
      <TableWrapper showCheckbox={false} isSwitchOn data={false}>
        <Thead>
          <Tr className="bg-blue-100 dark:bg-gray-700 h-[45px] shadow-sm border-b border-gray-300">
            <Th className="text-blue-900 dark:text-gray-300">Courier</Th>
            <Th className="text-blue-900 dark:text-gray-300">Order</Th>
            <Th className="text-blue-900 dark:text-gray-300">Delivery</Th>
            <Th className="text-blue-900 dark:text-gray-300">Return</Th>
            <Th className="text-blue-900 dark:text-gray-300">Ratio</Th>
          </Tr>
        </Thead>
        <Tbody className="bg-white dark:bg-gray-600 dark:border-none border">
          {courierData?.map((item: any, index: number) => (
            <Tr key={index}>
              <Td className="h-12">
                <Image
                  src={
                    item?.courier === "Pathao"
                      ? pathao
                      : item?.courier === "Paperfly"
                      ? paperfly
                      : item?.courier === "RedX"
                      ? redx
                      : item.courier === "SteadFast"
                      ? steadfast
                      : ""
                  }
                  alt=""
                />
              </Td>
              <Td>{item?.total}</Td>
              <Td>{item?.delivered}</Td>
              <Td>{item?.returned}</Td>
              <Td>{item?.ratio}</Td>
            </Tr>
          ))}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default FraudCheckTable;
