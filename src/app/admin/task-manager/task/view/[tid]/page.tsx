"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import { useParams, useRouter } from "next/navigation";
import {
  ITask,
  ITaskResponse,
  TaskNotesData,
  TaskNotesResponse,
  TaskStatusData,
  TaskStatusResponse,
} from "@admin/@interfaces/taskManager/task/taskDetails.interface";
import TaskDetailsStatus from "@admin/components/pages/TaskManager/Task/TaskDetails/TaskDetailsStatus";
import NoteSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/NoteSkeleton";
import timeSince from "@admin/utils/hook.utils";
import Image from "next/image";
import noData from "@admin/assets/images/Image-not-found.png";
import NotesUpdateModal from "@admin/components/pages/TaskManager/Task/TaskDetails/NotesUpdateModal";
import OrderDetailsHeaderSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/OrderDetailsHeaderSkeleton";
import DetailsInfoSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/DetailsInfoSkeleton";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import TaskLogs from "@admin/components/pages/TaskManager/Task/TaskLogs";
import {
  ITaskLog,
  ITaskLogResponse,
} from "@admin/@interfaces/taskManager/task/taskLogs.interface";
import Icon from "@admin/components/core/Icon/Icon";
import HolidayParser from "@admin/components/core/HtmlParser/HolidayParser";

const Page: React.FC = () => {
  const router = useRouter();
  const { tid } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoteLoading, setIsNoteLoading] = useState<boolean>(true);
  const [taskDetails, setTaskDetails] = useState<ITask>();
  const [taskNotes, setTaskNotes] = useState<TaskNotesData | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatusData>();
  const [taskLogs, setTaskLogs] = useState<ITaskLog[]>([]);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const getSingleTask = () => {
    setIsLoading(true);
    TaskService.getTaskDetails(tid)
      .then((res: ITaskResponse) => {
        if (res?.success) {
          setTaskDetails(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const getSingleNote = () => {
    setIsNoteLoading(true);
    TaskService.getTaskNote(tid)
      .then((res: TaskNotesResponse) => {
        if (res?.success) {
          setTaskNotes(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsNoteLoading(false);
      });
  };
  const getSingleStatus = () => {
    TaskService.getTaskStatus(tid)
      .then((res: TaskStatusResponse) => {
        if (res?.success) {
          setTaskStatus(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const getTaskLogs = () => {
    TaskService.getTaskLogs(tid)
      .then((res: any) => {
        if (res?.success) {
          setTaskLogs(res?.data?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    getSingleTask();
    getSingleNote();
    getSingleStatus();
    getTaskLogs();
  }, []);

  const updateOrderStatus = async (newStatus: string) => {
    setStatusLoading(true);

    TaskService.taskStatusUpdate(tid, {
      status: newStatus,
    })
      .then((res: ITaskLogResponse) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getSingleStatus();
          getTaskLogs();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message))
      .finally(() => {
        setStatusLoading(false);
      });
  };

  const priorityStyles = (priority?: string) => {
    switch (priority) {
      case "high":
        return {
          bg: "from-red-500 via-rose-500 to-pink-500",
          text: "text-red-600",
          badge: "bg-red-100 text-red-700",
        };
      case "medium":
        return {
          bg: "from-violet-400 via-violet-400 to-teal-500",
          text: "text-orange-600",
          badge: "bg-orange-100 text-orange-700",
        };
      case "low":
        return {
          bg: "from-emerald-400 via-teal-400 to-cyan-500",
          text: "text-emerald-600",
          badge: "bg-emerald-100 text-emerald-700",
        };
      default:
        return {
          bg: "from-gray-300 to-gray-400",
          text: "text-gray-600",
          badge: "bg-gray-100 text-gray-700",
        };
    }
  };
  const styles = priorityStyles(taskDetails?.priority);
  useTableRefreshRegister(getSingleTask);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="2xl:pt-4 pt-2 2xl:px-4 px-3 w-full">
          <div className="lg:flex lg:flex-wrap items-center md:justify-between pb-2">
            <div className="md:flex items-center md:space-x-4 w-full">
              <Icon
                onClick={() => router.back()}
                name="arrow_back"
                className="text-blue-600 dark:text-blue-400 cursor-pointer"
              />

              <h1 className="2xl:text-2xl lg:text-xl text-lg font-semibold dark:text-gray-300 text-gray-800 flex text-nowrap">
                Task Details : {taskDetails?.task_no}
              </h1>
            </div>
          </div>
        </div>
      </NoScrollLayout>

      <div className="2xl:px-4 px-3 relative md:min-h-[85%] w-full ">
        {isLoading ? (
          <OrderDetailsHeaderSkeleton />
        ) : (
          <div
            className={`
    relative overflow-hidden rounded-2xl md:p-6 p-4
    bg-gradient-to-r ${styles.bg}
     transition 
  `}
          >
            {/* Glass Effect */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md" />

            <div className="relative grid grid-cols-1 md:text-start  text-center md:grid-cols-3 gap-6 text-gray-900 dark:text-gray-100">
              {/* Task Info */}
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  📝 {taskDetails?.title}
                </h2>

                <p className="mt-2 text-sm font-medium">
                  📅 Start:{" "}
                  <span className="font-semibold">
                    {taskDetails?.start_date}
                  </span>
                </p>

                <p className="text-sm font-medium ">
                  ⏳ End:{" "}
                  <span className="font-semibold ">
                    {taskDetails?.end_date}
                  </span>
                </p>
              </div>

              {/* Priority */}
              <div className="flex flex-col justify-center  md:items-start items-center">
                <h3 className="text-lg font-bold mb-2">Priority</h3>

                <span
                  className={`
          inline-flex w-fit items-center rounded-full px-4 py-1
          text-sm font-bold uppercase tracking-wide
          ${styles.badge}
        `}
                >
                  {taskDetails?.priority}
                </span>
              </div>

              {/* Project & Employees */}
              <div>
                <h3 className="text-lg font-bold">
                  📁 {taskDetails?.project?.title}
                </h3>

                <div className="mt-2 space-y-1 md:text-start text-center mx-auto w-full flex flex-col md:items-start items-center">
                  {taskDetails?.assign_employee?.map((emp) => (
                    <p
                      key={emp._id}
                      className="text-sm font-semibold flex items-center gap-2"
                    >
                      👤 {emp.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          {isLoading ? (
            <DetailsInfoSkeleton />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg md:p-6 p-4 dark:text-gray-300 ">
              <h3 className="text-lg font-bold ">Description: </h3>
              {/* <p>{taskDetails?.description}</p> */}
              <HolidayParser htmlContent={taskDetails?.description} />
            </div>
          )}
        </div>

        <div className=" mt-4 md:flex gap-4 items-start">
          <div className=" md:w-8/12 w-full h-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg md:p-4">
              <TaskDetailsStatus
                currentStep={taskStatus?.status || ""}
                updateOrderStatus={updateOrderStatus}
                statusLoading={statusLoading}
              />
            </div>
            <div className="bg-white p-6 rounded-lg !mt-6 dark:bg-gray-700">
              <h2 className="py-4 font-bold dark:text-gray-400">Documents:</h2>
              <div className="grid grid-cols-6 gap-3">
                {taskDetails?.documents?.map((doc: string, index: number) => (
                  <div key={index} className="border rounded-lg p-2">
                    <Image
                      src={doc}
                      alt={`Document ${index + 1}`}
                      className="w-full h-60 object-cover rounded"
                      width={200}
                      height={400}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof doc === "string") handleImageClick(doc);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:w-4/12 w-full md:mt-0 mt-4 h-auto">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold dark:text-gray-400">
                  Notes
                </h2>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-500 bg-blue-100 px-2 py-0.5  rounded-lg hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  + Add Note
                </button>
              </div>

              {isNoteLoading ? (
                <NoteSkeleton />
              ) : taskNotes?.notes?.length ? (
                <div className="mt-3 space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide">
                  {taskNotes.notes.map((note: any, index: number) => (
                    <div
                      key={index}
                      className="flex gap-2 items-center justify-between
        bg-green-50 dark:bg-green-900/30
        px-3 py-2 rounded-lg
        border border-green-100 dark:border-green-900"
                    >
                      <p className="text-sm text-green-700 dark:text-green-200">
                        {note.text} -
                        <span className="font-bold uppercase text-xs">
                          {" "}
                          {note.user.name}{" "}
                        </span>
                      </p>

                      <span className="text-xs text-green-600 dark:text-green-300 whitespace-nowrap">
                        {timeSince(new Date(note.createdAt))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <Image
                    src={noData}
                    alt="No notes found"
                    width={56}
                    height={56}
                    className="h-14 w-auto opacity-70"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No notes available
                  </p>
                </div>
              )}
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
              <TaskLogs logsData={taskLogs} />
            </div>
          </div>
        </div>

        {isImageOpen && selectedImage && (
          <ImagePreviewModal
            selectedImage={selectedImage}
            closeModal={closeModal}
          />
        )}
        <NotesUpdateModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          getSingleNote={getSingleNote}
          items={taskDetails}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
