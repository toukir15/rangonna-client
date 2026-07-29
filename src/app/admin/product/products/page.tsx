"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
  createContext,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import { ToastService } from "@admin/utils/toastr.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import ProductTable from "@admin/components/pages/Product/AllProducts/ProductsTable";
import Button from "@admin/components/core/Button/Button";
import Alert from "@admin/components/core/Aleart/Aleart";
import SelectComponent from "@admin/components/core/Select/Select";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import {
  IProduct,
  IProductBrand,
  IProductCategory,
  IProductsContext,
  IProductsResponse,
} from "@admin/@interfaces/productReport/allProduct.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const ProductsContext = createContext({} as IProductsContext);

type ProductCardData = {
  total_products: number;
  in_stock_products: number;
  out_of_stock_products: number;
};

const ProductsPageContent: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [productData, setProductData] = useState<IProduct[]>([]);
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
  const [cardLoading, setCardLoading] = useState<boolean>(false);

  const [productCardData, setProductCardData] = useState<ProductCardData>({
    total_products: 0,
    in_stock_products: 0,
    out_of_stock_products: 0,
  });

  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkSeoModalOpen, setIsBulkSeoModalOpen] = useState<boolean>(false);
  const [bulkSeoLoading, setBulkSeoLoading] = useState<boolean>(false);
  const [selectedSeoOption, setSelectedSeoOption] = useState<SelectOption>({
    label: "Select SEO Status",
    value: "",
  });

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
    label: "All Status - 0",
  });

  const [sortOrder, setSortOrder] = useState<
    "" | "inventory.stock_quantity" | "-inventory.stock_quantity"
  >("");

  const stockStatusOptions = useMemo(
    () => [
      {
        label: `All Status - ${productCardData.total_products}`,
        value: "all",
      },
      {
        label: `In Stock - ${productCardData.in_stock_products}`,
        value: "in-stock",
      },
      {
        label: `Out of Stock - ${productCardData.out_of_stock_products}`,
        value: "out-of-stock",
      },
    ],
    [productCardData],
  );

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

    setOrDeleteParam(params, "category", selectedCategory.value);
    setOrDeleteParam(params, "brand", selectedBrand.value);
    setOrDeleteParam(params, "status", selectedStatus.value);
    params.delete("is_seo");
    setOrDeleteParam(params, "page", currentPage);
    setOrDeleteParam(params, "limit", productPerPage);

    if (debouncedSearchTerm?.trim()) {
      params.set("searchTerm", debouncedSearchTerm.trim());
    } else {
      params.delete("searchTerm");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory.value,
    selectedBrand.value,
    selectedStatus.value,
    productPerPage,
    currentPage,
    debouncedSearchTerm,
  ]);

  useEffect(() => {
    const qCategory = searchParams.get("category");
    const qBrand = searchParams.get("brand");
    const qStatus = searchParams.get("status");
    const qPage = searchParams.get("page");
    const qLimit = searchParams.get("limit");
    const qSearch = searchParams.get("searchTerm");

    if (qCategory) {
      setSelectedCategory((prev) => ({
        ...prev,
        value: qCategory,
      }));
    }

    if (qBrand) {
      setSelectedBrand((prev) => ({
        ...prev,
        value: qBrand,
      }));
    }

    if (qStatus) {
      const matchedStatus = stockStatusOptions.find(
        (item) => item.value === qStatus,
      );
      if (matchedStatus) {
        setSelectedStatus(matchedStatus);
      }
    }

    if (qPage) setCurrentPage(Number(qPage));
    if (qLimit) setProductPerPage(Number(qLimit));
    if (qSearch) setSearchTerm(qSearch);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const matched = stockStatusOptions.find(
      (item) => item.value === selectedStatus.value,
    );
    if (matched && matched.label !== selectedStatus.label) {
      setSelectedStatus(matched);
    }
  }, [stockStatusOptions, selectedStatus.value, selectedStatus.label]);

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
    router.push("/admin/product/products/add-product");
  };

  useEffect(() => {
    fetchProduct();
  }, [
    sortOrder,
    selectedCategory.value,
    selectedBrand.value,
    selectedStatus.value,
    currentPage,
    productPerPage,
    debouncedSearchTerm,
  ]);

  useEffect(() => {
    fetchProductCard();
  }, [selectedCategory.value, selectedBrand.value, debouncedSearchTerm]);

  const fetchProduct = async () => {
    setTableLoading(true);
    productService
      .getProduct({
        searchTerm: debouncedSearchTerm?.trim(),
        page: currentPage,
        limit: productPerPage,
        category: selectedCategory.value,
        brand: selectedBrand.value,
        inventory_stock_status: selectedStatus.value,
        sort: sortOrder,
      })
      .then((res: IProductsResponse) => {
        if (res?.success) {
          setProductData(res.data?.data || []);
          setTotalProduct(res?.data?.meta?.total_record || 0);        } else {
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

  const fetchProductCard = async () => {
    setCardLoading(true);
    productService
      .getProductCard({
        searchTerm: debouncedSearchTerm?.trim(),
        category: selectedCategory.value,
        brand: selectedBrand.value,
      })
      .then((res: any) => {
        if (res?.success) {
          setProductCardData({
            total_products: res?.data?.total_products || 0,
            in_stock_products: res?.data?.in_stock_products || 0,
            out_of_stock_products: res?.data?.out_of_stock_products || 0,
          });
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setCardLoading(false);
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

  const clearBulkSelection = () => {
    setSelectedProductIds([]);
    setSelectedSeoOption({ label: "Select SEO Status", value: "" });
  };

  const confirmBulkSeoUpdate = async () => {
    const isSeoSelected =
      selectedSeoOption?.value === "true" ||
      selectedSeoOption?.value === "false";

    if (!selectedProductIds.length || !isSeoSelected) return;

    const isSeo = selectedSeoOption.value === "true";

    setBulkSeoLoading(true);
    try {
      const res = await productService.bulkUpdateSeo({
        is_seo: isSeo,
        product_ids: selectedProductIds,
      });

      if (res?.success) {
        ToastService.success(res?.message || "Updated");
        fetchProduct();
        fetchProductCard();
        setIsBulkSeoModalOpen(false);
        clearBulkSelection();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) ToastService.error(err.message);
    } finally {
      setBulkSeoLoading(false);
    }
  };

  const confirmRemove = async () => {
    setIsRemoveLoading(true);
    if (!remove) return;

    try {
      const res = await productService.deleteProduct(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchProduct();
        fetchProductCard();
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

  useEffect(() => {
    fetchProductCategory();
    fetchProductBrand();

    const savedPerPage = localStorage.getItem("productListPerPage");
    if (savedPerPage) {
      setProductPerPage(Number(savedPerPage));
    }
  }, []);

  const fetchProductCategory = () => {
    ProductCategoryService.getProductCategorySuggestions()
      .then((res: any) => {
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
      .then((res: any) => {
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

  useEffect(() => {
    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      setSelectedCategory(JSON.parse(savedCategory));
    }

    const savedBrand = localStorage.getItem("selectedBrand");
    if (savedBrand) {
      setSelectedBrand(JSON.parse(savedBrand));
    }

    const savedStatus = localStorage.getItem("selectedStatus");
    if (savedStatus) {
      const parsedStatus = JSON.parse(savedStatus);
      const matchedStatus = stockStatusOptions.find(
        (item) => item.value === parsedStatus.value,
      );
      setSelectedStatus(matchedStatus || parsedStatus);
    }

    localStorage.removeItem("selectedSeoStatus");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem(
        "selectedCategory",
        JSON.stringify(selectedCategory),
      );
    }
    if (selectedBrand) {
      localStorage.setItem("selectedBrand", JSON.stringify(selectedBrand));
    }
    if (selectedStatus) {
      localStorage.setItem("selectedStatus", JSON.stringify(selectedStatus));
    }
  }, [selectedCategory, selectedBrand, selectedStatus]);

  useTableRefreshRegister(fetchProduct);


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
        <div className="md:flex flex-wrap items-center  gap-3 items-center 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex flex-wrap items-center items-center 4xl:gap-4 gap-2">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
              All Product
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
              cardLoading={cardLoading}
              setCurrentPage={setCurrentPage}
            />

            <div className="">
              {permissionList.includes("product_create") && (
                <Button
                  className="flex items-center bg-green-200 !text-green-600 !px-4 !py-1.5"
                  onClick={handleAddClick}
                >
                  <span className="ml-1 text-nowrap">Add Product</span>
                </Button>
              )}
            </div>
            {!!selectedProductIds.length && (
              <Button
                className="flex items-center !bg-blue-600 !text-white !px-4 !py-1.5"
                onClick={() => setIsBulkSeoModalOpen(true)}
              >
                <span className="ml-1 text-nowrap">Update Seo</span>
              </Button>
            )}
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

      <ProductsContext.Provider
        value={{
          productData,
          tableLoading,
          handleImageClick,
          togglePopup,
          popupIndex,
          popupRef,
          handleDelete,
          setSortOrder,
          sortOrder,
          selectedProductIds,
          setSelectedProductIds,
        }}
      >
        <div className="min-h-[70vh] 2xl:px-4 px-3">
          <div className="xl:mt-3 mt-2">
            <ProductTable />

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
      </ProductsContext.Provider>

      <Alert
        isOpen={isBulkSeoModalOpen}
        confirmLabel="Update"
        cancelLabel="Cancel"
        onConfirm={confirmBulkSeoUpdate}
        onCancel={() => {
          setIsBulkSeoModalOpen(false);
          setSelectedSeoOption({ label: "Select SEO Status", value: "" });
        }}
        isLoading={bulkSeoLoading}
        disabled={
          !selectedProductIds.length ||
          !(
            selectedSeoOption?.value === "true" ||
            selectedSeoOption?.value === "false"
          )
        }
      >
        <h3 className="text-2xl font-bold">Update SEO</h3>
        <p className="text-md my-2">
          Selected products: {selectedProductIds.length}
        </p>
        <div className="mt-4 min-h-40">
          <SelectComponent
            options={[
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ]}
            value={selectedSeoOption}
            onChange={(opt: SelectOption) => setSelectedSeoOption(opt)}
            placeholder="Select SEO Status"
            className="w-full"
          />
        </div>
      </Alert>
    </AuthLayout>
  );
};

const Page: React.FC = () => (
  <Suspense fallback={null}>
    <ProductsPageContent />
  </Suspense>
);

export default Page;
