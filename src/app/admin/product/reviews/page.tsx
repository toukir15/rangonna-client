"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import ReviewTable from "@admin/components/pages/Review/ReviewTable";
import ReviewModal from "@admin/components/pages/Review/ReviewModal";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import {
  IReview,
  IReviewResponse,
  ProductReviewContextType,
} from "@admin/@interfaces/review/review.interface";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";

export const ProductReviewContext = createContext(
  {} as ProductReviewContextType,
);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [productReviewData, setProductReviewData] = useState<IReview[]>([]);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [items, setItems] = useState<IReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IReview) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("ProductBrandPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchProductReview = () => {
    setTableLoading(true);
    productService
      .getProductReview({
        searchTerm: debouncedSearchTerm,
        page: currentPage,
        limit: productPerPage,
      })
      .then((res: IReviewResponse) => {
        if (res?.success) {
          setProductReviewData(res?.data);
          setTotalExpenses(res?.meta.total_record);
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

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("ProductBrandPerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
    fetchProductReview();
  }, [debouncedSearchTerm, currentPage, productPerPage]);

  const confirmRemove = async () => {
    setIsRemoveLoading(true);
    if (!remove) return;
    try {
      const res = await productService.deleteProductReview(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchProductReview();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setIsRemoveLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };
  useTableRefreshRegister(fetchProductReview);


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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Review Lists"
          action={
            permissionList.includes("product_review_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Create Review
              </Button>
            ) : undefined
          }
        />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Review records</p>
            <p className="premium-table-toolbar-meta">
              {totalExpenses.toLocaleString()} items
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
                onRefresh={fetchProductReview}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <ProductReviewContext.Provider
            value={{
              productReviewData,
              tableLoading,
              handleEditClick,
              handleRemove,
              modalMode,
              items,
              setIsModalOpen,
              isModalOpen,
              fetchProductReview,
              handleImageClick,
            }}
          >
            <ReviewTable />
            <ReviewModal />
          </ProductReviewContext.Provider>

          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalExpenses}
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
      </div>
    </AuthLayout>
  );
};

export default Page;
