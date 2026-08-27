import React, { useContext, useEffect, useRef, useState } from "react";
import logo from "@admin/assets/images/user.png";
import Image from "next/image";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { TeamContext } from "@/app/admin/team/member/page";
import Icon from "@admin/components/core/Icon/Icon";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, noData } from "@admin/utils";
import { useRouter } from "next/navigation";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { ToastService } from "@admin/utils/toastr.service";

const UsersTable: React.FC = () => {
  const router = useRouter();
  const { permissionList } = useGlobalContext();
  const {
    isLoading,
    teamData,
    handleRemove,
    isAlertOpen,
    confirmRemove,
    cancelRemove,
    activeToggleLoading,
    toggleIsActive
  } = useContext(TeamContext);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={isLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>

      <TableWrapper
        showCheckbox={false}
        isLoading={isLoading}
        isSwitchOn
        data={teamData}
        className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
        colValue={7}
      >
        <Thead>
          <Tr>
            <Th className="xl:min-w-24 min-w-20">Image</Th>
            <Th className="min-w-40">Name</Th>
            <Th className="xl:min-w-40 min-w-20">Phone No</Th>
            <Th className="xl:min-w-32 min-w-24">Email</Th>
            <Th className="xl:min-w-28">Role</Th>
            <Th className="xl:min-w-36">Status</Th>
            <Th className="xl:min-w-36">Active</Th>
            <Th className="is-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {teamData?.data?.map((item: any, index: number) => (
            <Tr key={index}>
              <Td>
                <Image
                  src={item?.image ? item.image : logo}
                  alt={item.name}
                  width="50"
                  height="50"
                  className={`${item.image ? "" : "bg-gray-300 rounded"}`}
                />
              </Td>

              <Td>
                <span className="data-table-primary">{item.name}</span>
              </Td>
              <Td>
                {item?.phone ? (
                  <span className="table-contact-line">
                    <Icon name="call" size={14} variant="outlined" />
                    <a href={`tel:${item.phone}`}>{item.phone}</a>
                    <button
                      type="button"
                      className="table-copy-btn"
                      aria-label="Copy phone number"
                      title="Copy phone number"
                      onClick={() => copyToClipboard(item.phone)}
                    >
                      <Icon name="content_copy" size={13} variant="outlined" />
                    </button>
                  </span>
                ) : (
                  <span className="data-table-muted">{noData}</span>
                )}
              </Td>
              <Td>
                <span className="data-table-muted">{item.email || noData}</span>
              </Td>
              <Td>
                <span className="table-role-badge is-neutral">
                  {item.role || noData}
                </span>
              </Td>
              <Td>
                <span
                  className={`table-role-badge ${
                    item?.status ? "is-approved" : "is-rejected"
                  }`}
                >
                  {item.status ? "Active" : "Inactive"}
                </span>
              </Td>
              <Td>
                {activeToggleLoading[item._id] ? (
                  <Icon
                    name="restart_alt"
                    size={28}
                    className="text-green-600 animate-spin ml-5"
                  />
                ) : (
                  <ToggleSwitch
                    isChecked={item.status}
                    onToggle={() => {
                      toggleIsActive(item);
                    }}
                    disabled={
                      activeToggleLoading[item?._id] ||
                      !hasPermission(permissionList, "team_user_edit")
                    }
                  />
                )}
              </Td>
              <Td className="is-right">
                {hasPermission(
                  permissionList,
                  "team_user_edit",
                  "team_user_delete"
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
                          {hasPermission(permissionList, "team_user_edit") && (
                            <button
                              type="button"
                              onClick={() => {
                                router.push(`/admin/team/member/edit/${item?._id}`);
                              }}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                            >
                              Edit
                            </button>
                          )}

                          {hasPermission(permissionList, "team_user_delete") && (
                            <button
                              type="button"
                              onClick={() => handleRemove(item?._id)}
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
          ))}
        </Tbody>
      </TableWrapper>
    </div>
  );
};

export default UsersTable;
