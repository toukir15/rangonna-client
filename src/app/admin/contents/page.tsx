"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import dynamic from "next/dynamic";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { ContentsService } from "@admin/@services/apis/Contents/Contents";

const Alert = dynamic(() => import("@admin/components/core/Aleart/Aleart"), {
  ssr: false,
});
const ContentsModal = dynamic(
  () => import("@admin/components/pages/Contents/ContentsModal"),
  { ssr: false },
);
const ContentCard = dynamic(
  () => import("@admin/components/pages/Contents/ContentCard"),
  { ssr: false },
);

export const ContentsContext = createContext<any>({});

type IPriorityPayload = {
  _id: string;
  priority: number;
};

const Page = (): JSX.Element => {
  const { permissionList } = useGlobalContext();

  const [tableLoading, setTableLoading] = useState(false);
  const [priorityUpdateLoading, setPriorityUpdateLoading] = useState(false);

  const [contentsData, setContentsData] = useState<any[]>([]);
  const [priorityContentsData, setPriorityContentsData] = useState<any[]>([]);

  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [isPriorityEditMode, setIsPriorityEditMode] = useState(false);

  useEffect(() => {
    if (!isPriorityEditMode) {
      getContentsList();
    }
  }, [isPriorityEditMode]);

  const getContentsList = async () => {
    try {
      setTableLoading(true);

      const res = await ContentsService.getContents({
        page: 1,
        limit: 500,
      });

      if (res?.success) {
        const list = res?.data?.data ?? [];
        setContentsData(list);
        setPriorityContentsData(list);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  const getAllContentsForPriority = async () => {
    try {
      setTableLoading(true);

      const res = await ContentsService.getContents({
        page: 1,
        limit: 500,
      });

      if (res?.success) {
        const list = res?.data?.data ?? [];
        setPriorityContentsData(list);
        setIsPriorityEditMode(true);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setItems(item);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setItems(null);
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    if (!remove) return;

    try {
      setTableLoading(true);

      const res = await ContentsService.deleteContents(remove);

      if (res?.success) {
        ToastService.success(res?.message);
        getContentsList();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  const handleTogglePriorityEditMode = async () => {
    if (isPriorityEditMode) {
      setIsPriorityEditMode(false);
      setPriorityContentsData(contentsData);
      getContentsList();
    } else {
      await getAllContentsForPriority();
    }
  };

  const handlePriorityUpdate = async () => {
    const payload: IPriorityPayload[] = priorityContentsData.map(
      (item, index) => ({
        _id: item._id,
        priority: index + 1,
      }),
    );

    try {
      setPriorityUpdateLoading(true);

      const res = await ContentsService.updateContentsPriority(payload);

      if (res?.success) {
        ToastService.success(res?.message || "Priority updated successfully");
        setIsPriorityEditMode(false);
        getContentsList();
      } else {
        ToastService.error(res?.message || "Failed to update priority");
      }
    } catch (err: any) {
      ToastService.error(err.message || "Unexpected error occurred");
    } finally {
      setPriorityUpdateLoading(false);
    }
  };
  useTableRefreshRegister(getContentsList);


  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this content?
        </h6>
        <div className="flex justify-center my-6">
          <Icon
            name="delete"
            variant="outlined"
            size={120}
            className="text-red-400"
          />
        </div>
      </Alert>

      <NoScrollLayout>
        <div className="flex items-center px-3 pt-3 mb-2 flex-wrap gap-2">
          <h2 className="text-xl font-semibold dark:text-gray-400">Contents</h2>

          <div className="flex gap-2 flex-wrap">
            {permissionList.includes("setting_priority_edit") && (
              <Button
                className={`flex items-center !py-1.5 !px-2 ${
                  isPriorityEditMode ? "bg-orange-500" : "bg-indigo-500"
                }`}
                onClick={handleTogglePriorityEditMode}
              >
                <Icon name="filter_list" />
                <span className="">{isPriorityEditMode ? "Cancel" : ""}</span>
              </Button>
            )}

            {permissionList.includes("content_create") &&
              !isPriorityEditMode && (
                <Button
                  className="flex items-center !bg-green-200 !text-green-600 !py-1.5 !px-4"
                  onClick={handleAddClick}
                >
                  <span className="ml-1">Add Contents</span>
                </Button>
              )}

            {isPriorityEditMode && (
              <Button
                className="flex items-center bg-green-600 !px-4"
                onClick={handlePriorityUpdate}
                disabled={priorityUpdateLoading}
              >
                <Icon name="assignment_turned_in" className="me-1" />{" "}
                {priorityUpdateLoading ? "Updating..." : "Update"}
              </Button>
            )}
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] px-3">
        <ContentsContext.Provider
          value={{
            contentsData: isPriorityEditMode
              ? priorityContentsData
              : contentsData,
            tableLoading,
            handleEditClick,
            handleRemove,
            isModalOpen,
            setIsModalOpen,
            modalMode,
            items,
            getContentsList,
            setItems,
            isPriorityEditMode,
            setPriorityContentsData,
          }}
        >
          <ContentsModal />
          <ContentCard />
        </ContentsContext.Provider>
      </div>
    </AuthLayout>
  );
};

export default Page;
