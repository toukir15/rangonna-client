"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { Suspense, useRef, useState, useEffect, createContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import Alert from "@admin/components/core/Aleart/Aleart";

import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
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

  useTableRefreshRegister(fetchBlog);


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

      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="All Blogs"
          action={
            permissionList.includes("blog_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Blogs
              </Button>
            ) : undefined
          }
        />

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
          <div className="data-table-card glass-card rounded-2xl orders-table-shell">
            <div className="premium-table-toolbar">
              <p className="premium-table-toolbar-title">Blog records</p>
              <p className="premium-table-toolbar-meta">
                {totalProduct.toLocaleString()} items
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
              </div>
              <div className="data-table-toolbar-end">
                <TableRefreshButton
                  onRefresh={fetchBlog}
                  isLoading={tableLoading}
                  className="!h-9"
                />
              </div>
            </div>

            <BlogTable />

            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              showRefresh={false}
              isShowText={true}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          </div>

          {isImageOpen && selectedImage && (
            <ImagePreviewModal
              selectedImage={selectedImage}
              closeModal={closeModal}
            />
          )}
        </BlogContext.Provider>
      </div>
    </AuthLayout>
  );
};

const Page: React.FC = () => (
  <Suspense fallback={null}>
    <BlogPageContent />
  </Suspense>
);

export default Page;
