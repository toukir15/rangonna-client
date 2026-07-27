"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useRef, useState, useEffect, createContext } from "react";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ToastService } from "@admin/utils/toastr.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Alert from "@admin/components/core/Aleart/Aleart";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import {
  IBrandResponse,
  ICategoryResponse,
  IProductBrand,
  IProductCategory,
} from "@admin/@interfaces/productReport/allProduct.interface";
import PageSearch from "@admin/components/core/Search/PageSearch";
import ProductPriceTable from "@admin/components/pages/Product/ProductPrice/ProductPriceTable";
import {
  ProductPrice,
  ProductPriceListResponse,
} from "@admin/@interfaces/productReport/product.interface";
import Button from "@admin/components/core/Button/Button";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export type SortField =
  | "pricing.sale_price"
  | "pricing.regular_price"
  | "pricing.purchase_price"
  | "wholesale_pricing.wholesale_price"
  | "wholesale_pricing.wholesale_vip_price"
  | "wholesale_pricing.resale_price";

type SortDirection = "asc" | "desc";

export interface SortItem {
  field: SortField;
  direction: SortDirection;
}

export const ProductsPriceContext = createContext({} as any);

const Page: React.FC = () => {
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [productData, setProductData] = useState<ProductPrice[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    SelectOption[] | null
  >();
  const [selectedCategory, setSelectedCategory] = useState<SelectOption>({
    value: "all",
    label: "Category",
  });
  const [brandOptions, setBrandOptions] = useState<SelectOption[] | null>();
  const [selectedBrand, setSelectedBrand] = useState<SelectOption>({
    value: "all",
    label: "Brand",
  });
  const [selectedStatus, setSelectedStatus] = useState<SelectOption>({
    value: "all",
    label: "Status",
  });

  const [sortOrders, setSortOrders] = useState<SortItem[]>([]);

  const sortQuery = sortOrders
    .map((s) => (s.direction === "desc" ? `-${s.field}` : s.field))
    .join(",");

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

  useEffect(() => {
    fetchProduct();
  }, [
    sortOrders,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    currentPage,
    productPerPage,
    debouncedSearchTerm,
  ]);

  const fetchProduct = async () => {
    setTableLoading(true);
    productService
      .getProductPriceList({
        searchTerm: encodeURIComponent(debouncedSearchTerm),
        page: currentPage,
        limit: productPerPage,
        category: selectedCategory.value,
        brand: selectedBrand.value,
        inventory_stock_status: selectedStatus.value,
        sort: sortQuery,
      })
      .then((res: ProductPriceListResponse) => {
        if (res?.success) {
          setProductData(res.data?.data);
          setTotalProduct(res?.data?.meta?.total_record);
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
  };

  const handleDelete = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const confirmRemove = async () => {
    if (!remove) return;
    try {
      const res = await productService.deleteProduct(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchProduct();
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
    }
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  useEffect(() => {
    fetchProductCategory();
    fetchProductBrand();
  }, []);

  const fetchProductCategory = () => {
    ProductCategoryService.getProductCategorySuggestions()
      .then((res: ICategoryResponse) => {
        if (res?.success) {
          const options = res.data.map((item: IProductCategory) => ({
            label: item.key,
            value: item.value,
          }));
          setCategoryOptions([{ value: "all", label: "All" }, ...options]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchProductBrand = () => {
    ProductBrandService.getProductBrandSuggestions()
      .then((res: IBrandResponse) => {
        if (res?.success) {
          const options = res.data.map((item: IProductBrand) => ({
            label: item.key,
            value: item.value,
          }));
          setBrandOptions([{ value: "all", label: "All" }, ...options]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const stockStatusOptions = [
    { label: "In Stock", value: "in-stock" },
    { label: "Out of Stock", value: "out-of-stock" },
  ];

  useTableRefreshRegister(fetchProduct);


  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this Product?
        </h6>
        <div className="flex flex-wrap items-center items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <NoScrollLayout>
        <div className=" 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="md:flex flex-wrap items-center items-center 4xl:gap-4 gap-2">
            <div className="flex flex-wrap items-center items-center gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
                All Product Price
              </h2>
              <AllFilter
                isCategoryOptionFilter={true}
                categoryOptions={categoryOptions || []}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                isBrandOptionFilter={true}
                brandOptions={brandOptions || []}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                isStatusOptionFilter={true}
                stockStatusOptions={stockStatusOptions}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
            </div>
            <div className="4xl:w-72 md:w-64 w-full md:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
          
        </div>
      </NoScrollLayout>
      <ProductsPriceContext.Provider
        value={{
          productData,
          tableLoading,
          handleImageClick,
          togglePopup,
          popupIndex,
          popupRef,
          handleDelete,
          setSortOrders,
          sortOrders,
        }}
      >
        <div className="min-h-[70vh] 2xl:px-4 px-3">
          <div className="xl:mt-3 mt-2">
            <ProductPriceTable />
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
      </ProductsPriceContext.Provider>
    </AuthLayout>
  );
};

export default Page;
