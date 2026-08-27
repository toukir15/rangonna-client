import { IMimSms } from "@admin/@interfaces/setting/mimSms/mimSms.interface";
import { MimSmsContext } from "@/app/admin/setting/mim-sms/page";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { useContext, useEffect, useRef, useState } from "react";

const MimSmsTable = () => {
  const { permissionList } = useGlobalContext();
  const { mimSmsData, tableLoading, handleEditClick, handleRemove } =
    useContext(MimSmsContext);
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
      data={mimSmsData}
      isLoading={tableLoading}
      noDataViewCondition={
        mimSmsData?.length < 1 ? "No data available" : null
      }
      colValue={3}
    >
      <Thead>
        <Tr>
          <Th>Title</Th>
          <Th>Message</Th>
          <Th className="is-right">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {mimSmsData?.map((mimSms: IMimSms, index: number) => {
          return (
            <Tr key={index}>
              <Td>
                <span className="data-table-primary">
                  {mimSms?.title || noData}
                </span>
              </Td>
              <Td>
                <span className="data-table-muted">
                  {mimSms?.message || noData}
                </span>
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "mim_sms_template_edit",
                  "mim_sms_template_delete"
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
                          "mim_sms_template_edit"
                        ) && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleEditClick(mimSms)}
                          >
                            Edit
                          </button>
                        )}
                        {hasPermission(
                          permissionList,
                          "mim_sms_template_delete"
                        ) && (
                          <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            onClick={() => handleRemove(mimSms?._id)}
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

export default MimSmsTable;
