/* eslint-disable react/jsx-no-undef */
"use client";
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
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import Image from "next/image";
import WholeSaleProductTable from "@admin/components/pages/wholesale/WholeSaleProduct/WholeSaleProcutTable";
import Button from "@admin/components/core/Button/Button";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const WholeSaleProductsContext = createContext({} as any);

const Page: React.FC = () => {
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [productData, setProductData] = useState<any[]>([]);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
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

  const [sortOrder, setSortOrder] = useState<
    "" | "inventory.stock_quantity" | "-inventory.stock_quantity"
  >("");

  // const [isSubmit, setIsSubmit] = useState<boolean>(false);
  // const [orderDetails, setOrderDetails] = useState<any>([]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchProductSearch = async (val: string) => {
    try {
      const res = await productService.getPurchaseProductSuggestion({
        searchTerm: val,
      });
      if (res?.success) {
        setFilteredProducts(res.data);
        setShowSuggestions(true);
      } else ToastService.error(res?.message);
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (productSearch.length >= 2) fetchProductSearch(productSearch);
  };

  useEffect(() => {
    fetchProduct();
  }, [
    sortOrder,
    selectedCategory,
    selectedBrand,
    selectedStatus,
    currentPage,
    productPerPage,
    debouncedSearchTerm,
  ]);

  const fetchProduct = async () => {
    setTableLoading(true);
    wholesaleOrderService
      .getWholeSaleProduct({
        searchTerm: encodeURIComponent(debouncedSearchTerm),
        page: currentPage,
        limit: productPerPage,
        category: selectedCategory.value,
        brand: selectedBrand.value,
        inventory_stock_status: selectedStatus.value,
        sort: sortOrder,
      })
      .then((res: any) => {
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

  const handleSearch = (e: any) => {
    const val = e.target.value;
    setProductSearch(val);
    if (val.length >= 2) fetchProductSearch(val);
    else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const handleDelete = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  // const confirmRemove = async () => {
  //   if (!remove) return;
  //   try {
  //     const res = await productService.deleteProduct(remove);
  //     if (res?.success) {
  //       ToastService.success(res?.message);
  //       fetchProduct();
  //     } else {
  //       ToastService.error(res?.message);
  //     }
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       ToastService.error(err.message);
  //     }
  //   } finally {
  //     setIsAlertOpen(false);
  //     setRemove(null);
  //   }
  // };

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
    { label: "All", value: "all" },
    { label: "In Stock", value: "in-stock" },
    { label: "Out of Stock", value: "out-of-stock" },
  ];

  const handleAddWholesale = (id: string) => {
    wholesaleOrderService
      .enableWholesaleProduct(id)
      .then((res: any) => {
        if (res?.success) {
          fetchProduct();
          ToastService.success(res?.message);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      });
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const confirmRemove = () => {
    if (!remove) return;
    setRemoveLoading(true);
    wholesaleOrderService
      .disableWholesaleProduct(remove)
      .then((res: any) => {
        if (res?.success) {
          fetchProduct();
          ToastService.success(res?.message);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setRemoveLoading(false);
        setIsAlertOpen(false);
        setRemove(null);
      });
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={removeLoading}
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
        <div className=" 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="md:flex items-center 4xl:gap-3 gap-2">
            <div className="flex items-center gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
                Wholesale Product
              </h2>
              <div>
                <Button
                  className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                >
                  <Icon
                    name={isFilterOpen ? "close" : "filter_alt"}
                    size={20}
                  />
                </Button>
              </div>
            </div>
            <div className="4xl:w-72  w-full md:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="md:w-72 w-full"
              />
            </div>

            <div className="relative md:pt-0 pt-2">
              <input
                ref={inputRef}
                type="text"
                value={productSearch}
                onChange={handleSearch}
                placeholder="Search for a product"
                className="w-full border rounded-lg p-1.5 pr-10 dark:bg-gray-700 dark:text-gray-300 min-w-96"
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
                onFocus={() =>
                  productSearch.length >= 2 && setShowSuggestions(true)
                }
              />
              <button
                type="button"
                className="absolute right-2 md:top-2 top-4 text-gray-400"
                onClick={handleSearchSubmit}
              >
                <Icon name="search" variant="outlined" />
              </button>

              {showSuggestions && productSearch.length >= 2 && (
                <div className="absolute left-0 w-full bg-white dark:bg-gray-600 dark:border-gray-500 border mt-1 rounded-md z-10 max-h-96 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p: any, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 hover:bg-gray-100 hover:dark:bg-gray-500 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          // setOrderDetails({
                          //   line_items: [
                          //     {
                          //       title: p.title,
                          //       product_id: { _id: p._id },
                          //       quantity: 1,
                          //       subtotal: p.pricing?.sale_price,
                          //       total: p.pricing?.sale_price,
                          //       price: p.pricing?.sale_price,
                          //       image: p.featured_image?.src || "",
                          //     },
                          //   ],
                          // });
                          handleAddWholesale(p._id);
                          setProductSearch("");
                          setFilteredProducts([]);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={p.featured_image?.src}
                            width={40}
                            height={40}
                            alt=""
                            className="rounded"
                          />
                          <span className="dark:text-gray-300">{p.title}</span>
                        </div>
                        <span className="font-semibold dark:text-gray-300 ">
                          ৳{p.pricing?.sale_price}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No products found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isFilterOpen && (
            <div className=" -mt-4 md:mt-0">
              <AllFilter
                isFilterOpen={isFilterOpen}
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
          )}
        </div>
      </NoScrollLayout>
      <WholeSaleProductsContext.Provider
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
          handleRemove,
        }}
      >
        <div className="min-h-[70vh] 2xl:px-4 px-3">
          <div className="xl:mt-3 mt-2">
            <WholeSaleProductTable />
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
      </WholeSaleProductsContext.Provider>
    </AuthLayout>
  );
};

export default Page;
