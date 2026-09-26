"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX } from "react";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { ContentsService } from "@admin/@services/apis/Contents/Contents";
import Alert from "@admin/components/core/Aleart/Aleart";
import ContentsModal from "@admin/components/pages/Contents/ContentsModal";
import ContentCard from "@admin/components/pages/Contents/ContentCard";
import { ContentsContext } from "@admin/components/pages/Contents/contents.context";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

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


  const visibleContents = isPriorityEditMode
    ? priorityContentsData
    : contentsData;

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

      <div className="px-3 pt-3 pb-4">
        <PageHeader
          title="Contents"
          action={
            <div className="flex flex-wrap items-center gap-2">
              {permissionList.includes("content_create") &&
                !isPriorityEditMode && (
                  <Button
                    className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                    onClick={handleAddClick}
                  >
                    <Icon name="add" variant="outlined" size={16} />
                    Add Contents
                  </Button>
                )}
              {isPriorityEditMode && (
                <Button
                  className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                  onClick={handlePriorityUpdate}
                  disabled={priorityUpdateLoading}
                >
                  <Icon name="assignment_turned_in" size={16} />
                  {priorityUpdateLoading ? "Updating..." : "Update order"}
                </Button>
              )}
            </div>
          }
        />

        <div className="data-table-card glass-card rounded-2xl">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Content records</p>
            <p className="premium-table-toolbar-meta">
              {visibleContents.length.toLocaleString()}{" "}
              {visibleContents.length === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              {permissionList.includes("setting_priority_edit") && (
                <button
                  type="button"
                  className="data-table-refresh"
                  onClick={handleTogglePriorityEditMode}
                >
                  <Icon name={isPriorityEditMode ? "close" : "drag_indicator"} size={16} />
                  {isPriorityEditMode ? "Cancel reorder" : "Reorder"}
                </button>
              )}
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={getContentsList}
                isLoading={tableLoading}
              />
            </div>
          </div>

          <ContentsContext.Provider
            value={{
              contentsData: visibleContents,
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
      </div>
    </AuthLayout>
  );
};

export default Page;
