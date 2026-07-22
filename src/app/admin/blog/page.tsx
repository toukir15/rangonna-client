"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { Suspense, useRef, useState, useEffect, createContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import Alert from "@admin/components/core/Aleart/Aleart";

import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import BlogTable from "@admin/components/pages/Blog/BlogTable/BlogTable";
import { BlogService } from "@admin/@services/apis/Blog/blog.service";

export const BlogContext = createContext({} as any);

const BlogPageContent: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [blogData, setBlogData] = useState<any[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const setOrDeleteParam = (
    params: URLSearchParams,
    key: string,
    value: string | number,
  ) => {
    if (!value || value === "all") params.delete(key);
    else params.set(key, String(value));
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    setOrDeleteParam(params, "page", currentPage);
    setOrDeleteParam(params, "limit", productPerPage);

    if (debouncedSearchTerm?.trim()) {
      params.set("searchTerm", debouncedSearchTerm.trim());
    } else {
      params.delete("searchTerm");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [productPerPage, currentPage, debouncedSearchTerm]);

  useEffect(() => {
    const qPage = searchParams.get("page");
    const qLimit = searchParams.get("limit");
    const qSearch = searchParams.get("searchTerm");

    if (qPage) setCurrentPage(Number(qPage));
    if (qLimit) setProductPerPage(Number(qLimit));
    if (qSearch) setSearchTerm(qSearch);
  }, []);

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

  const handleAddClick = () => {
    router.push("/admin/blog/add-blog");
  };

  useEffect(() => {
    fetchBlog();
  }, [currentPage, productPerPage, debouncedSearchTerm]);

  const fetchBlog = async () => {
    setTableLoading(true);
    BlogService.getBlog({
      searchTerm: debouncedSearchTerm?.trim(),
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setBlogData(res.data || []);
          setTotalProduct(res?.meta?.total_record || 0);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    setCurrentPage(1);
    localStorage.setItem("productListPerPage", newProductPerPage.toString());
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const confirmRemove = async () => {
    setIsRemoveLoading(true);
    if (!remove) return;

    try {
      const res = await BlogService.deleteBlog(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchBlog();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setIsRemoveLoading(false);
    }
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={isRemoveLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this Product?
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

      <NoScrollLayout>
        <div className="md:flex  gap-3 items-center 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center 4xl:gap-4 gap-2">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              All Blogs
            </h2>

            <div className="">
              {permissionList.includes("blog_create") && (
                <Button
                  className="flex items-center bg-green-200 !text-green-600 !px-4 !py-1.5"
                  onClick={handleAddClick}
                >
                  <span className="ml-1 text-nowrap">Add Blogs</span>
                </Button>
              )}
            </div>
          </div>
          <div className="4xl:w-72 md:w-64 w-full md:mt-0 mt-2">
            <PageSearch
              value={searchTerm}
              onChange={handleSearchChange}
              wrapperClass="w-full"
            />
          </div>
        </div>
      </NoScrollLayout>

      <BlogContext.Provider
        value={{
          blogData,
          tableLoading,
          handleImageClick,
          togglePopup,
          popupIndex,
          popupRef,
          handleDelete,
          selectedProductIds,
          setSelectedProductIds,
        }}
      >
        <div className="min-h-[70vh] 2xl:px-4 px-3">
          <div className="xl:mt-3 mt-2">
            <BlogTable />

            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />

            {isImageOpen && selectedImage && (
              <ImagePreviewModal
                selectedImage={selectedImage}
                closeModal={closeModal}
              />
            )}
          </div>
        </div>
      </BlogContext.Provider>
    </AuthLayout>
  );
};

const Page: React.FC = () => (
  <Suspense fallback={null}>
    <BlogPageContent />
  </Suspense>
);

export default Page;
