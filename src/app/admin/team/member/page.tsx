"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import React, { useState, useEffect, createContext } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import {
  FormValues,
  IItems,
  ITeamData,
} from "@admin/@interfaces/team/team.interface";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { teamSchema } from "@admin/@schema/teamSchema/teamSchema";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import UsersTable from "@admin/components/pages/Team/Users/UsersTable";
import TeamModal from "@admin/components/pages/Team/Users/TeamDrawer";
import { useGlobalContext } from "@admin/context/GlobalContext";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import PageSearch from "@admin/components/core/Search/PageSearch";
import { useRouter } from "next/navigation";
import { userStatusOptions } from "@admin/components/pages/Utilities/paymentData";
import { SelectOption } from "@admin/@interfaces/common.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const TeamContext = createContext({} as any);

const Page: React.FC = () => {
  const router = useRouter();
  const { permissionList } = useGlobalContext();
  const [items, setItems] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<"Add" | "Edit">("Add");
  const [teamData, setTeamData] = useState<ITeamData[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [teamPerPage, setTeamPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTeam, setTotalTeam] = useState<number>(0);
  const totalPages = Math.ceil(totalTeam / teamPerPage);
  const [modalOpen, setModalOpen] = useState(false);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [selectedStatus, setSelectedStatus] = useState<SelectOption>({
    value: "active",
    label: "Active",
  });
  const [activeToggleLoading, setActiveToggleLoading] = useState<
    Record<string, boolean>
  >({});
  const handleTeamPerPageChange = (newProductPerPage: number) => {
    setTeamPerPage(newProductPerPage);
    localStorage.setItem("teamListPerPage", newProductPerPage.toString());
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<any>({
    resolver: yupResolver(teamSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      permission: "",
      base_salary: "",
      status: false,
      password: "",
    },
  });

  useEffect(() => {
    fetchTeamList();
  }, [selectedStatus, currentPage, teamPerPage, debouncedSearchTerm]);

  const fetchTeamList = async () => {
    setIsLoading(true);
    TeamService.getUsers({
      page: currentPage,
      limit: teamPerPage,
      searchTerm: debouncedSearchTerm,
      status: selectedStatus.value === "active" ? "true" : "false",
    })
      .then((res: any) => {
        if (res?.success) {
          setTeamData(res.data);
          setTotalTeam(res?.data?.meta?.total_record || 1);
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


  const handleEditClick = (item: IItems) => {
    setDrawerMode("Edit");
    setItems(item);
    setOpenDrawer(true);
  };

  const handleDrawerSubmit = async (data: FormValues, mode: string) => {
    setIsSubmit(true);
    if (mode === "Edit" && items?._id) {
      TeamService.updateTeam(items?._id, data)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            fetchTeamList();
            setOpenDrawer(false);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: any) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
        });
    } else {
      TeamService.createTeam(data)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            fetchTeamList();
            setOpenDrawer(false);
            reset();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: any) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
        });
    }
  };

  const handleRemove = (index: any) => {
    setRemove(index);
    setIsAlertOpen(true);
  };

  const confirmRemove = async () => {
    setIsLoading(true);
    TeamService.teamDelete(remove)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);

          fetchTeamList();
          setIsAlertOpen(false);
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

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleIsActive = (item: any) => {
    setActiveToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    TeamService.updateTeamStatus(item?._id, {
      status: !item.status,
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);

          fetchTeamList()
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setActiveToggleLoading((prev) => ({ ...prev, [item._id]: false }));
      });
  };
  useTableRefreshRegister(fetchTeamList);


  return (
    <AuthLayout>
      <NoScrollLayout>
        {" "}
        <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-1">
          <div className="sm:flex flex-wrap items-center items-center gap-3">
            <div className="flex flex-wrap items-center items-center gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
                All Member
              </h2>
              <AllFilter
                isStatusFilter={true}
                statusOption={userStatusOptions}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
              {permissionList.includes("team_user_create") && (
                <Button
                  className="flex items-center !bg-green-200 !text-green-600 !py-1.5 !px-4 text-nowrap"
                  onClick={() => router.push("/admin/team/member/add-member")}
                >
                  Add Member
                </Button>
              )}
            </div>
            <div className="sm:w-80 w-full md:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>

          </div>

          
        </div>
      </NoScrollLayout>

      <div className="min-h-[70vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <TeamContext.Provider
            value={{
              isLoading,
              teamData,
              handleEditClick,
              handleRemove,
              openDrawer,
              setOpenDrawer,
              items,
              drawerMode,
              handleDrawerSubmit,
              handleSubmit,
              register,
              setValue,
              watch,
              reset,
              errors,
              isSubmit,
              isAlertOpen,
              confirmRemove,
              cancelRemove,
              setModalOpen,
              modalOpen,
              control,
              activeToggleLoading,
              toggleIsActive

            }}
          >
            <UsersTable />
            <TeamModal />
          </TeamContext.Provider>

          <PaginationComponent
            ordersPerPage={teamPerPage}
            handleOrdersPerPageChange={handleTeamPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalTeam}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
