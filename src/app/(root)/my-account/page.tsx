"use client";
import Alert from "@/@components/core/Alert/Alert";
import Button from "@/@components/core/Button/Button";
import Icon from "@/@components/core/Icon/Icon";
import { GlobalContext } from "@/@components/pages/Context/GlobalContext";
import RecentActivity from "@/@components/pages/MyAccount/RecentActivity";
import { ProductService } from "@/@services/apis/Product/Product.service";
import DashboardSkeleton from "@/@skeleton/Dashboard.skeleton";
import { ToastService } from "@/utils/toaster.service";
import LogOutLogo from "@/@assets/icon/logOut.png";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import UpdateProfileModal from "@/@components/pages/MyAccount/UpdateProfileModal";
import { useRouter } from "next/navigation";
// import {
//   PackageSearch,
//   Download,
//   MapPin,
//   UserCog,
//   CreditCard,
//   Heart,
// } from "lucide-react";

export interface IOrderHistory {
  _id: string;
  sysid: string;
  total: number;
  status: "ready-for-box" | "pending" | string;
  createdAt: any;
}

const Page: React.FC = () => {
  const router = useRouter();
  const { userInfo, infoLoading, fetchUserInfo, setUserInfo } =
    useContext(GlobalContext);
  const [orderHistory, setOrderHistory] = useState<IOrderHistory[]>();
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);

  // const tiles: any[] = [
  //   {
  //     key: "orders",
  //     title: "Recent Orders",
  //     description: "View and track your recent purchases",
  //     icon: PackageSearch,
  //     iconBg: "bg-blue-50",
  //     iconColor: "text-blue-600",
  //   },
  //   {
  //     key: "downloads",
  //     title: "Downloads",
  //     description: "Access your digital purchases and files",
  //     icon: Download,
  //     iconBg: "bg-green-50",
  //     iconColor: "text-green-600",
  //   },
  //   {
  //     key: "addresses",
  //     title: "Addresses",
  //     description: "Manage shipping and billing addresses",
  //     icon: MapPin,
  //     iconBg: "bg-yellow-50",
  //     iconColor: "text-yellow-600",
  //   },
  //   {
  //     key: "account",
  //     title: "Account Details",
  //     description: "Update your personal information and preferences",
  //     icon: UserCog,
  //     iconBg: "bg-purple-50",
  //     iconColor: "text-purple-600",
  //   },
  //   {
  //     key: "payments",
  //     title: "Payment Methods",
  //     description: "Manage your cards and payment options",
  //     icon: CreditCard,
  //     iconBg: "bg-primary-light",
  //     iconColor: "text-primary",
  //   },
  //   {
  //     key: "wishlist",
  //     title: "Wishlist",
  //     description: "View and manage your saved items",
  //     icon: Heart,
  //     iconBg: "bg-pink-50",
  //     iconColor: "text-pink-600",
  //   },
  // ];

  const fetchOrderHistory = async () => {
    ProductService.getOrderHistory()
      .then((res: any) => {
        if (res?.success) {
          setOrderHistory(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        // ToastService.error(err.message);
      });
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [userInfo]);

  const handleCancel = () => {
    setIsAlertOpen(false);
  };

  const handleLogout = async () => {
    setIsAlertOpen(false);

    ProductService.logOut()
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchUserInfo();
          setUserInfo("");
          router.push("/");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };
  return (
    <div className="min-h-[70vh]">
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        onCancel={handleCancel}
      >
        <h3 className="text-2xl font-bold">Confirm Logout</h3>
        <h6 className="text-md my-4">Are you sure you want to log out?</h6>
        <div className="flex items-center justify-center my-8">
          <Image className="h-28 w-auto" src={LogOutLogo} alt={""} />
        </div>
      </Alert>
      {!userInfo && !infoLoading ? (
        <div className="max-w-layout mx-auto py-4 md:py-6 2xl:px-0 md:px-3 px-3 min-h-[60vh]">
          Log in now
        </div>
      ) : !userInfo && infoLoading ? (
        <div className="max-w-layout mx-auto py-4 md:py-6 2xl:px-0 md:px-3 px-3 min-h-[60vh]">
          <DashboardSkeleton />
        </div>
      ) : (
        <div className="max-w-layout mx-auto py-4 md:py-6 2xl:px-0 md:px-3 px-3">
          <div>
            <div>
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-2">
                  <h2 className="lg:text-2xl md:text-xl text-base font-semibold font-poppins">
                    Hello,{" "}
                    <span className="text-blue-900">
                      {userInfo?.first_name}
                    </span>
                  </h2>
                  <Button
                    className="!bg-green-600 !text-white  !font-bold border border-gray-200 !py-1 !px-3 cursor-pointer !text-xs !flex  items-center gap-1 text-nowrap"
                    onClick={() => {
                      setModalOpen(true);
                    }}
                  >
                    <Icon
                      name={"edit_square"}
                      size={18}
                      className="text-white"
                    />
                    <span className="hidden  md:block">Update profile</span>
                  </Button>
                </div>
                <div className="w-1/2 items-end justify-end flex ">
                  <div className="flex items-center gap-3">
                    <p className="text-sm hidden lg:block">
                      Not {userInfo?.first_name}?
                    </p>
                    <Button
                      className="!bg-white !text-gray-700 border  border-gray-200 !py-1 !px-3 cursor-pointer !text-xs !flex  items-center gap-1"
                      onClick={() => setIsAlertOpen(true)}
                    >
                      <Icon
                        name={"logout"}
                        size={18}
                        className="text-gray-500"
                      />
                      Log Out
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div className="lg:w-2/3 w-full">
                  <p className="text-gray-500 mt-3">
                    Welcome to your dashboard! From here you can view your
                    recent orders, manage your shipping and billing addresses,
                    edit your account details, and access all your account
                    features.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <RecentActivity orderHistory={orderHistory} />
            </div>
            {/* <div className="mt-6">
              <div className="flex flex-wrap gap-2 w-full">
                <Button className="!bg-white !text-gray-700 border border-gray-200 !py-1 !px-3 cursor-pointer !text-xs !flex items-center justify-center gap-1">
                  <Icon
                    name={"notifications"}
                    size={18}
                    className="text-gray-500"
                  />
                  Notifications
                </Button>

                <Button className="!bg-white !text-gray-700 border border-gray-200 !py-1 !px-3 cursor-pointer !text-xs !flex items-center gap-1 justify-center">
                  <Icon name={"settings"} size={18} className="text-gray-500" />
                  Settings
                </Button>

                <Button className="!bg-white !text-gray-700 border border-gray-200 !py-1 !px-3 cursor-pointer !text-xs !flex items-center gap-1 justify-center">
                  <Icon
                    name={"analytics"}
                    size={18}
                    className="text-gray-500"
                  />
                  Analytics
                </Button>

                <Button className="!bg-white !text-gray-700 border border-gray-200 !py-1 !px-3 cursor-pointer !text-xs !flex items-center gap-1 justify-center">
                  <Icon
                    name={"calendar_month"}
                    size={18}
                    className="text-gray-500"
                  />
                  Calendar
                </Button>
              </div>
            </div> */}

            {/* <div className="mt-6">
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {tiles.map(
                  ({
                    key,
                    title,
                    description,
                    icon: Icon,
                    href,
                    iconBg,
                    iconColor,
                  }) => {
                    const CardTag = href ? "a" : "div";
                    return (
                      <CardTag
                        key={key}
                        href={href}
                        className="group block rounded-2xl border border-gray-200 shadow-xs p-4 md:p-5 bg-white  hover:shadow-md hover:border-gray-300 transition cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-xl p-3 ${iconBg}`}>
                            <Icon
                              className={`h-6 w-6 ${iconColor}`}
                              aria-hidden
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold md:text-base">
                              {title}
                            </h3>
                            <p className="mt-1 text-xs md:text-sm text-gray-600">
                              {description}
                            </p>
                          </div>
                        </div>
                      </CardTag>
                    );
                  }
                )}
              </div>
            </div> */}

            <UpdateProfileModal
              isModalOpen={modalOpen}
              setIsModalOpen={setModalOpen}
              userInfo={userInfo}
              fetchUserInfo={fetchUserInfo}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
