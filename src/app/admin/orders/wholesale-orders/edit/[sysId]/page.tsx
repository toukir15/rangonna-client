"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import Image from "next/image";
import Alert from "@admin/components/core/Aleart/Aleart";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import EditOrderSkeleton from "@admin/components/Skeleton/Orders/EditOrder/EditOrderSkeleton";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import { ProductsInfoTable } from "@admin/components/pages/Orders/EditOrder/ProductsInfoTable";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";

const Page: React.FC = () => {
  const { sysId } = useParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        if (filteredProducts.length > 0) {
          setFilteredProducts([]);
        }
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filteredProducts]);

  const fetchOrdersDetails = async () => {
    setIsLoading(true);
    wholesaleOrderService
      .orderDetails(sysId)
      .then((res: any) => {
        if (res?.success) {
          const transformedData = {
            ...res.data,
            line_items: res.data.line_items.map((item: any) => ({
              ...item,
              manage_stock: item.inventory?.manage_stock || false,
              stock_quantity: item.inventory?.stock_quantity || 0,
            })),
          };
          setOrderDetails(transformedData);
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

  useEffect(() => {
    fetchOrdersDetails();
  }, [sysId]);

  const fetchProductSearch = async (searchValue: string) => {
    productService
      .getProductWholesaleGlobalSuggestion({
        searchTerm: searchValue,
        wholesale_user: orderDetails?.wholesale_user,
      })
      .then((res: any) => {
        if (res?.success) {
          setFilteredProducts(res.data);
          setShowSuggestions(true);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleSearchChange = (e: any) => {
    const searchValue = e.target.value;
    setProductSearch(searchValue);
    if (searchValue.length >= 2) {
      fetchProductSearch(searchValue);
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (productSearch.length >= 2) {
      fetchProductSearch(productSearch);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProductIndex(productId);
    setIsAlertOpen(true);
  };

  const confirmRemoveProduct = async () => {
    if (!selectedProductIndex || !orderDetails?.line_items) {
      setIsAlertOpen(false);
      setSelectedProductIndex(null);
      return;
    }

    if (orderDetails.line_items.length <= 1) {
      ToastService.error("Cannot remove the only remaining item.");
      setIsAlertOpen(false);
      setSelectedProductIndex(null);
      return;
    }

    setOrderDetails((prev: any) => {
      if (!prev?.line_items) return prev;
      const updatedLineItems = prev.line_items.filter(
        (item: any) => item.product_id !== selectedProductIndex
      );

      return {
        ...prev,
        line_items: updatedLineItems,
      };
    });

    setIsAlertOpen(false);
    setSelectedProductIndex(null);
  };

  const cancelRemoveProduct = () => {
    setIsAlertOpen(false);
    setSelectedProductIndex(null);
  };

  const incrementQuantity = (index: number) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.line_items];
    const currentItem = newItems[index];
    const currentQuantity = Number(currentItem.quantity) || 0;

    const stockQuantity = currentItem?.inventory?.stock_quantity;

    if (stockQuantity != null && currentQuantity >= stockQuantity) {
      ToastService.warning(`Only ${stockQuantity} items available in stock`);
      return;
    }

    newItems[index] = {
      ...currentItem,
      quantity: currentQuantity + 1,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      line_items: newItems,
    }));
  };

  const decrementQuantity = (index: number) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.line_items];
    const currentQuantity = Number(newItems[index].quantity) || 0;

    if (currentQuantity > 1) {
      newItems[index] = {
        ...newItems[index],
        quantity: currentQuantity - 1,
      };

      setOrderDetails((prevDetails: any) => ({
        ...prevDetails,
        line_items: newItems,
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (
      name === "first_name" ||
      name === "last_name" ||
      name === "phone" ||
      name === "address"
    ) {
      setOrderDetails((prev: any) => ({
        ...prev,
        customer: {
          ...prev.customer,
          [name]: value,
        },
      }));
    } else if (name === "shipping_total") {
      setOrderDetails((prev: any) => ({
        ...prev,
        shipping_line: {
          ...prev.shipping_line,
          total: value,
        },
      }));
    } else {
      setOrderDetails((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setIsSubmitting(true);

    const orderData = {
      customer: {
        first_name: orderDetails?.customer?.first_name,
        last_name: orderDetails?.customer?.last_name,
        phone: orderDetails?.customer?.phone,
        address: orderDetails?.customer?.address,
      },
      shipping_line: {
        total: Number(orderDetails?.shipping_line?.total) || 0,
      },
      courier: {
        consignment_id: "",
      },
      discount: Number(orderDetails?.discount_total) || 0,
      line_items:
        orderDetails?.line_items?.map((item: any) => ({
          title: item?.title,
          product_id: item.product_id._id,
          quantity: Number(item.quantity),
          subtotal: item.price * item.quantity,
          total: item.price * item.quantity,
          inventory: {
            manage_stock: item.manage_stock,
            stock_quantity: item.stock_quantity,
          },
          price: item.price,
        })) || [],
    };

    wholesaleOrderService
      .updateProduct(sysId, orderData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push(`/admin/orders/wholesale-orders/view/${sysId}`);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const subtotal =
    orderDetails?.line_items?.reduce((acc: number, product: any) => {
      return acc + product.price * product.quantity;
    }, 0) || 0;

  const hasFlashSale = (orderDetails?.line_items || []).some((item: any) =>
    item?.product_id?.categories?.includes("flash-sale")
  );

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveProduct}
        onCancel={cancelRemoveProduct}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this product?
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

      <div className="md:p-6 p-3 min-h-[83vh] lg:px-4">
        <div className="bg-white md:p-6 p-4 rounded-lg dark:bg-gray-800">
          <h1 className="text-2xl font-bold mb-4 dark:text-gray-400">
            Edit Order{" "}
            <span className="text-blue-900 dark:text-gray-300">
              #{orderDetails?.sysid}
            </span>
          </h1>

          <form onSubmit={handleSubmit}>
            {isLoading ? (
              <EditOrderSkeleton />
            ) : (
              <div className="md:flex w-full md:gap-20">
                <div className=" w-full grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-10 gap-y-2 ">
                  <div className="mb-5">
                    <label className="block text-gray-700 dark:text-gray-400 ">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      defaultValue={orderDetails?.customer?.first_name || ""}
                      onChange={handleInputChange}
                      className="p-2 px-4 pr-10 w-full dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      required
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-gray-700 dark:text-gray-400">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      defaultValue={orderDetails?.customer?.last_name || ""}
                      onChange={handleInputChange}
                      className="p-2 px-4 pr-10 w-full dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-700 dark:text-gray-400">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={orderDetails?.customer?.phone || ""}
                      onChange={handleInputChange}
                      className="p-2 px-4 pr-10 w-full dark:text-gray-400 border dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      required
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-gray-700 dark:text-gray-400">
                      Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={orderDetails?.customer?.address || ""}
                      onChange={handleInputChange}
                      className="p-2 px-4 pr-10 w-full dark:text-gray-400 border dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      required
                      placeholder="Enter delivery address"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-400">
                      Delivery Fee
                    </label>
                    <input
                      type="number"
                      name="shipping_total"
                      value={orderDetails?.shipping_line?.total || ""}
                      onChange={handleInputChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      className="p-2 px-4 pr-10 w-full border dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                      min="0"
                      placeholder="Enter delivery fee"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700  dark:text-gray-400">
                      Discount Amount
                    </label>
                    <input
                      type="number"
                      name="discount_total"
                      disabled={hasFlashSale}
                      value={orderDetails?.discount_total || ""}
                      onChange={handleInputChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      className={`p-2 px-4 pr-10 w-full border dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none ${
                        hasFlashSale ? "cursor-not-allowed" : ""
                      }`}
                      min="0"
                      placeholder="Enter discount amount"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="my-6">
              <div className="md:flex items-center justify-between">
                <div>
                  <h2 className="md:text-xl font-bold mb-2 dark:text-gray-400">
                    Products Info:{" "}
                  </h2>
                </div>
                <div>
                  <div className="mb-3 md:w-[500px] w-full">
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={productSearch}
                        onChange={handleSearchChange}
                        className="p-2 px-4 pr-10 w-full border dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-blue-400 focus:outline-none"
                        placeholder="Search for a product"
                        onFocus={() =>
                          productSearch.length >= 2 && setShowSuggestions(true)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSearchSubmit(e)
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-3 text-gray-400"
                        onClick={handleSearchSubmit}
                      >
                        <Icon name="search" variant="outlined" />
                      </button>

                      {showSuggestions && productSearch.length >= 2 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute left-0 w-full dark:bg-gray-700 bg-white border border-gray-300 mt-1 rounded-md z-10 max-h-96 overflow-y-auto"
                        >
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map(
                              (product: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex justify-between gap-4 items-center"
                                    onClick={() => {
                                      setOrderDetails(
                                        (prev: { line_items: any }) => ({
                                          ...prev,
                                          line_items: [
                                            ...(prev.line_items || []),
                                            {
                                              title: product?.title,
                                              product_id: {
                                                _id: product._id,
                                                featured_image: {
                                                  src: product.featured_image
                                                    .src,
                                                },
                                              },
                                              variation_id:
                                                product.variation_id || "0",
                                              quantity: 1,
                                              subtotal: product.price,
                                              total: product.price,
                                              sku: product.sku,
                                              price: product?.price,
                                              image:
                                                product?.featured_image?.src ||
                                                "",
                                              manage_stock:
                                                product.inventory
                                                  ?.manage_stock || false,
                                              stock_quantity:
                                                product.inventory
                                                  ?.stock_quantity || 0,
                                              inventory:
                                                product.inventory || null,
                                            },
                                          ],
                                        })
                                      );
                                      setProductSearch("");
                                      setFilteredProducts([]);
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    <div className="flex items-center gap-4">
                                      <Image
                                        src={
                                          product?.featured_image
                                            ? product?.featured_image?.src
                                            : NodataImage
                                        }
                                        width={50}
                                        height={50}
                                        className="rounded-md"
                                        alt="Product Image"
                                        onClick={() =>
                                          handleImageClick(
                                            product?.featured_image?.src
                                          )
                                        }
                                      />
                                      <span className="dark:text-gray-300">
                                        {product?.title}
                                      </span>
                                    </div>
                                    <span className="font-semibold text-nowrap dark:text-gray-300">
                                      BDT {product?.price}
                                    </span>
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              No products found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <ProductsInfoTable
                isLoading={isLoading}
                orderDetails={orderDetails}
                subtotal={subtotal}
                isSubmitting={isSubmitting}
                handleImageClick={handleImageClick}
                decrementQuantity={decrementQuantity}
                incrementQuantity={incrementQuantity}
                handleRemoveProduct={handleRemoveProduct}
                router={router}
              />
            </div>
          </form>
        </div>

        {isModalOpen && selectedImage && (
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
