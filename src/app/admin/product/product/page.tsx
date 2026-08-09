"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ToastService } from "@admin/utils/toastr.service";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Icon from "@admin/components/core/Icon/Icon";
import ProductSkeleton from "@admin/components/Skeleton/Product/Product.skeleton";
import NoDataFoundTable from "@admin/components/pages/Orders/NoDataFoundTable";
import { IProduct, IWebsite } from "@admin/@interfaces/product/product.interface";

const Page: React.FC = () => {
  const [selectedWebsite, setSelectedWebsite] = useState<any>();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const productsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { baseAPI } = useGlobalContext();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    const fetchWebsites = async () => {
      const response = await fetch(`${baseAPI}/websiteList`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        ToastService.error("Failed to fetch websites");
        console.error("HTTP error:", response.statusText);
        setLoading(false);
        return;
      }

      const text = await response.text();
      try {
        const data = JSON.parse(text) as IWebsite[];
        const enabledWebsites = data.filter((website) => website.isEnabled);
        if (enabledWebsites.length > 0) {
          const defaultWebsite = enabledWebsites[0].url;
          setSelectedWebsite(defaultWebsite);
          fetchProducts(defaultWebsite, 1, searchTerm);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        ToastService.error("Error parsing websites");
      } finally {
        setLoading(false);
      }
    };

    fetchWebsites();
  }, [token]);

  const fetchProducts = async (
    webURL: string,
    page: number,
    searchTerm: string = "",
  ) => {
    setLoading(true);

    try {
      const response = await fetch(`${baseAPI}/getProducts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ webURL, page, productsPerPage, searchTerm }),
      });

      if (!response.ok) throw new Error("Failed to fetch products.");
      const data = await response.json();

      if (data.error) {
        setProducts([]);

        setTotalPages(1);
      } else {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch {
      ToastService.error("Failed to fetch products");
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProducts(selectedWebsite, newPage, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(selectedWebsite, 1, searchTerm);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="md:pt-6 pt-4 md:px-6 px-3">
          {/* Dropdown and Search Input - Side by Side */}
          <div className="md:flex items-center gap-4 ">
            <h1 className="text-2xl font-bold mb-3 dark:text-gray-300">
              Products
            </h1>
            <div className="sm:flex w-full items-center justify-between gap-4 mb-3">
              <div className="md:w-96 w-full md:mt-0">
                <div className="flex items-center flex-grow">
                  <input
                    type="text"
                    placeholder="Search products"
                    className="px-2 py-1.5 pr-10 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                  <button
                    className="bg-blue-600 text-white px-4 py-1.5 ml-2 rounded-lg"
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NoScrollLayout>
      {isImageOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-65">
          <div className="relative">
            <Image
              src={selectedImage}
              alt="High-Resolution Preview"
              width={600}
              height={600}
              className="rounded-lg"
            />
            <Icon
              onClick={closeModal}
              name={"close"}
              variant="outlined"
              className="absolute top-2 right-2 text-white text-xl bg-gray-800 rounded-full p-1 cursor-pointer"
            />
          </div>
        </div>
      )}
      <div className="mx-auto md:px-6 px-3   rounded-md md:min-h-[66%] min-h-[20vh] ">
        {(isLoading && products.length === 0) || loading ? (
          <ProductSkeleton />
        ) : !loading && products.length === 0 && selectedWebsite ? (
          <div className="flex items-center justify-center mt-28 min-h-[20%]">
            <NoDataFoundTable />
          </div>
        ) : (
          <div>
            {products.length > 0 && (
              <div>
                <div className="grid grid-cols-1 gap-4">
                  {products.map((product: any, index: number) => {
                    const { processing, unpaid } = product.statusCounts;
                    const rd = product.statusCounts["r-d"];
                    const onHold = product.statusCounts["on-hold"];

                    return (
                      <div
                        key={index}
                        className="md:flex items-center justify-between dark:bg-gray-800 bg-white  dark:border-gray-700 shadow-md border rounded-lg p-4 "
                      >
                        <div className="flex items-center space-x-4 ">
                          <Image
                            src={product.image}
                            alt={product.name}
                            height={100}
                            width={100}
                            className="rounded-lg cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(product.image);
                            }}
                          />
                          <div>
                            <h3 className="md:text-lg text-md ml-2 md:font-bold font-semibold dark:text-gray-300">
                              {product.name}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 ml-2 md:font-semibold font-normal md:text-md text-sm mt-1">
                              Price: BDT {product.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center md:space-x-6 space-x-2 md:mt-0 mt-6">
                          <div className="">
                            <div className="flex items-center justify-center">
                              <div className="text-blue-600 bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center">
                                <h5 className="text-center text-lg font-semibold ">
                                  {processing}
                                </h5>
                              </div>
                            </div>

                            <h6 className="text-xs font-semibold bg-blue-100 text-center text-blue-500 mt-3 md:px-4 px-2 md:min-w-28 w-auto py-0.5 rounded-lg">
                              Processing
                            </h6>
                          </div>
                          <div className="">
                            <div className="flex items-center justify-center">
                              <div className="bg-green-200 text-green-600 rounded-full w-8 h-8 flex items-center justify-center">
                                <h5 className="text-center text-lg font-semibold ">
                                  {rd}
                                </h5>
                              </div>
                            </div>

                            <h6 className="text-xs font-semibold bg-green-100 text-green-600 md:px-4 px-2 py-0.5 rounded-lg mt-3 md:min-w-28 min-w-14 text-center">
                              R-D
                            </h6>
                          </div>
                          <div className="">
                            <div className="flex items-center justify-center">
                              <div className="bg-yellow-100 text-yellow-600 rounded-full w-8 h-8 flex items-center justify-center">
                                <h5 className="text-center text-lg font-semibold ">
                                  {onHold}
                                </h5>
                              </div>
                            </div>

                            <h6 className="text-xs font-semibold bg-yellow-100 text-yellow-600 mt-3 md:px-4 px-2 py-0.5 rounded-lg md:min-w-28 text-center">
                              On-Hold
                            </h6>
                          </div>
                          <div className="">
                            <div className="flex items-center justify-center">
                              <div className="bg-red-100 text-red-600 rounded-full w-9 h-9 flex items-center justify-center">
                                <h5 className="text-center text-lg font-semibold ">
                                  {unpaid}
                                </h5>
                              </div>
                            </div>

                            <h6 className="text-xs font-semibold bg-red-100 text-red-600 mt-2 md:px-4 px-2 py-0.5 rounded-lg md:min-w-28 text-center">
                              Unpaid
                            </h6>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex md:justify-end justify-between items-center md:items-end mt-6">
                <div className="flex items-center  md:justify-end justify-between w-full space-x-3">
                  <button
                    className="bg-blue-400 text-white px-2 rounded-lg"
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <Icon
                      name={"chevron_left"}
                      variant="outlined"
                      className="mt-1"
                    />
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="bg-blue-400 text-white px-2 rounded-lg"
                    onClick={() =>
                      handlePageChange(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icon
                      name={"chevron_right"}
                      variant="outlined"
                      className="mt-1"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
export default Page;
