"use client";

import { useParams } from "next/navigation";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { useEffect, useState } from "react";
import { LeaveApplicationService } from "@admin/@services/apis/TeamService/LeaveApplication.service";
import Icon from "@admin/components/core/Icon/Icon";
import LeaveApplicationModal from "@admin/components/pages/Team/LeaveApplication/LeaveApplicationModal";

interface ILeaveDetails {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  leave_title: string;
  leave_description: string;
  start_date: string;
  end_date: string;
  status: string;
  total_days: number;
  approved_by?: {
    _id: string;
    name: string;
  } | null;
  approved_at?: string | null;
  rejected_by?: {
    _id: string;
    name: string;
  } | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

const Page: React.FC = () => {
  const params = useParams();
  const leaveId = params?.leaveId as string;
  const [leaveDetails, setLeaveDetails] = useState<ILeaveDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchLeaveDetails = () => {
    setIsLoading(true);
    LeaveApplicationService.getLeaveById(leaveId)
      .then((res: any) => {
        if (res?.success) {
          setLeaveDetails(res.data);
        } else {
          ToastService.error(res?.message || "Failed to fetch leave details");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (leaveId) {
      fetchLeaveDetails();
    }
  }, [leaveId]);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <AuthLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Leave Application Details
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View complete leave request information
                  </p>
                </div>

                <div className="flex items-center">
                  {!isLoading && leaveDetails?.status && (
                    <p
                      className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold capitalize w-fit ${getStatusClass(
                        leaveDetails.status
                      )}`}
                    >
                      {leaveDetails.status}
                    </p>
                  )}

                  <Icon
                    onClick={() => setIsModalOpen(true)}
                    className={`inline-flex items-center px-6 ml-2 py-1 rounded-full text-sm font-semibold capitalize w-fit bg-blue-500 text-white cursor-pointer`}
                    name="edit_document"
                  />
                </div>
              </div>
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="p-6 space-y-4">
                <div className="animate-pulse space-y-4">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                  </div>
                  <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                </div>
              </div>
            ) : !leaveDetails ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                No leave application found.
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* User + Leave Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Employee Information
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Name
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.user?.name || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.user?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Leave Information
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Leave Title
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.leave_title || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Days
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.total_days || 0} Days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Start Date
                    </p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {formatDate(leaveDetails.start_date)}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      End Date
                    </p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {formatDate(leaveDetails.end_date)}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Applied At
                    </p>
                    <p className="text-base font-semibold text-gray-800 dark:text-white">
                      {formatDateTime(leaveDetails.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Leave Description
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-7">
                    {leaveDetails.leave_description ||
                      "No description available"}
                  </p>
                </div>

                {/* Approval / Rejection Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-5 border border-green-100 dark:border-green-900">
                    <h2 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4">
                      Approval Information
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Approved By
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.approved_by?.name || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Approved At
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {formatDateTime(leaveDetails.approved_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-5 border border-red-100 dark:border-red-900">
                    <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">
                      Rejection Information
                    </h2>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Rejected By
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.rejected_by?.name || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Rejected At
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {formatDateTime(leaveDetails.rejected_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Rejection Reason
                        </p>
                        <p className="text-base font-medium text-gray-800 dark:text-white">
                          {leaveDetails.rejection_reason || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last Updated: {formatDateTime(leaveDetails.updatedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <LeaveApplicationModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        leaveDetails={leaveDetails}
        fetchLeaveDetails={fetchLeaveDetails}
      />
    </AuthLayout>
  );
};

export default Page;
