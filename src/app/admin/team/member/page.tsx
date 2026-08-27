"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import React, { useState, useEffect, createContext } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
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
import { useRouter } from "next/navigation";
import { userStatusOptions } from "@admin/components/pages/Utilities/paymentData";
import { SelectOption } from "@admin/@interfaces/common.interface";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="All Member"
          action={
            permissionList.includes("team_user_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={() => router.push("/admin/team/member/add-member")}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Member
              </Button>
            ) : undefined
          }
        />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Member records</p>
            <p className="premium-table-toolbar-meta">
              {totalTeam.toLocaleString()} items
            </p>
          </div>

          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              <label className="data-table-search">
                <Icon name="search" variant="outlined" size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                />
              </label>
              <AllFilter
                isStatusFilter={true}
                statusOption={userStatusOptions}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchTeamList}
                isLoading={isLoading}
                className="!h-9"
              />
            </div>
          </div>

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
            showRefresh={false}
            isShowText={true}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
