"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import Icon from "@admin/components/core/Icon/Icon";
import Image from "next/image";
import Alert from "@admin/components/core/Aleart/Aleart";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import EditOrderSkeleton from "@admin/components/Skeleton/Orders/EditOrder/EditOrderSkeleton";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import { ProductsInfoTable } from "@admin/components/pages/Orders/EditOrder/ProductsInfoTable";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";

const Page: React.FC = () => {
  const { sysId } = useParams();
  const { userInfo } = useGlobalContext();
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
    OrdersService.orderDetails(sysId)
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
    let request;
    if (userInfo?.is_main === false) {
      request = productService.getProductShowroomSuggestion({
        searchTerm: searchValue,
      });
    } else {
      request = productService.getProductSuggestion({
        searchTerm: searchValue,
        domain: orderDetails?.domain,
      });
    }
    const res: any = await request;

    if (res?.success) {
      setFilteredProducts(res.data);
      setShowSuggestions(true);
    } else {
      ToastService.error(res?.message);
    }
  };

  // productService
  //   .getProductSuggestion({
  //     searchTerm: searchValue,
  //     domain: orderDetails?.domain,
  //   })
  // .then((res: any) => {
  //   if (res?.success) {
  //     setFilteredProducts(res.data);
  //     setShowSuggestions(true);
  //   } else {
  //     ToastService.error(res?.message);
  //   }
  // })
  // .catch((err: { message: string }) => {
  //   ToastService.error(err.message);
  // });

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
        (item: any) => item.product_id !== selectedProductIndex,
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
          sku: item.sku || "",
          size: item.size || "",
          quantity: Number(item.quantity),
          subtotal: item.price * item.quantity,
          total: item.price * item.quantity,
          stock_status: item?.stock_status,
          inventory: {
            manage_stock: item.manage_stock,
            stock_quantity: item.stock_quantity,
          },
          price: item.price,
        })) || [],
    };

    productService
      .updateProduct(sysId, orderData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push(`/admin/orders/view/${sysId}`);
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
    item?.product_id?.categories?.includes("flash-sale"),
  );

  useTableRefreshRegister(fetchOrdersDetails);


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

      <div className="edit-order-page">
        <PageHeader
          title={`Edit Order${
            orderDetails?.sysid ? ` #${orderDetails.sysid}` : ""
          }`}
        />

        <div className="edit-order-shell data-table-card glass-card">
          <form onSubmit={handleSubmit}>
            {isLoading ? (
              <EditOrderSkeleton />
            ) : (
              <div className="edit-order-form-grid">
                <div className="edit-order-field">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={orderDetails?.customer?.first_name || ""}
                    onChange={handleInputChange}
                    className="input-app"
                    required
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="edit-order-field">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={orderDetails?.customer?.last_name || ""}
                    onChange={handleInputChange}
                    className="input-app"
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="edit-order-field">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={orderDetails?.customer?.phone || ""}
                    onChange={handleInputChange}
                    className="input-app"
                    required
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="edit-order-field">
                  <label className="form-label">Delivery Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={orderDetails?.customer?.address || ""}
                    onChange={handleInputChange}
                    className="input-app"
                    required
                    placeholder="Enter delivery address"
                  />
                </div>
                <div className="edit-order-field">
                  <label className="form-label">Delivery Fee</label>
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
                    className="input-app"
                    min="0"
                    placeholder="Enter delivery fee"
                  />
                </div>
                <div className="edit-order-field">
                  <label className="form-label">Discount Amount</label>
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
                    className={`input-app ${
                      hasFlashSale ? "cursor-not-allowed opacity-70" : ""
                    }`}
                    min="0"
                    placeholder="Enter discount amount"
                  />
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="edit-order-products-head">
                <h2>Products Info</h2>
                <div className="edit-order-search">
                  <input
                    ref={inputRef}
                    type="text"
                    value={productSearch}
                    onChange={handleSearchChange}
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
                    className="edit-order-search-btn"
                    onClick={handleSearchSubmit}
                    aria-label="Search products"
                  >
                    <Icon name="search" variant="outlined" size={18} />
                  </button>

                  {showSuggestions && productSearch.length >= 2 && (
                    <div
                      ref={suggestionsRef}
                      className="edit-order-suggestions"
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product: any, index: number) => (
                          <div
                            key={index}
                            className="edit-order-suggestion-item"
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
                                          src: product.featured_image?.src,
                                        },
                                      },
                                      variation_id:
                                        product.variation_id || "0",
                                      quantity: 1,
                                      subtotal: product.price,
                                      total: product.price,
                                      sku:
                                        product.variants?.[0]?.sku ||
                                        product.sku ||
                                        "",
                                      size:
                                        product.variants?.[0]?.size || "",
                                      price: product?.pricing?.sale_price,
                                      image:
                                        product?.featured_image?.src || "",
                                      manage_stock:
                                        product.inventory?.manage_stock ||
                                        false,
                                      stock_quantity:
                                        product.inventory?.stock_quantity ||
                                        0,
                                      inventory: product.inventory || null,
                                    },
                                  ],
                                }),
                              );
                              setProductSearch("");
                              setFilteredProducts([]);
                              setShowSuggestions(false);
                            }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Image
                                src={
                                  product?.featured_image?.src || NodataImage
                                }
                                width={56}
                                height={56}
                                alt="Product Image"
                              />
                              <span className="truncate text-sm font-medium text-app">
                                {product?.title}
                              </span>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-brand">
                              ৳ {product?.pricing?.sale_price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-app-muted">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
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
