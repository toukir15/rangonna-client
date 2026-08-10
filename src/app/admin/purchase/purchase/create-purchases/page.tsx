"use client";
import Input from "@admin/components/core/Input/Input";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import SelectComponent from "@admin/components/core/Select/Select";
import { ToastService } from "@admin/utils/toastr.service";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { formatDateRange } from "@admin/utils/hook.utils";
import { SupplierService } from "@admin/@services/apis/TeamService/SupplierService/supplier.service";
import Icon from "@admin/components/core/Icon/Icon";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import Image from "next/image";
import NodataImage from "@admin/assets/images/Image-not-found.png";
import PurchasesModal from "@admin/components/pages/Purchases/PurchasesModal";
import { PurchasesService } from "@admin/@services/apis/PurchasesService/Purchases.service";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { useRouter } from "next/navigation";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import ImagePreviewModal from "@admin/components/core/ImagePreview/ImagePreviewModal";
import PageHeader from "@admin/components/layout/PageHeader";

const defaultValue: any = {
  supplier: "",
  discount: 0,
  shipping: 0,
  status: { label: "Received", value: "received" },
  document: "",
  date: new Date(),
};

const webSchema = yup.object({
  supplier: yup.mixed().required("Supplier is required"),
  discount: yup.number(),
  shipping: yup.number(),
  status: yup.mixed().required("Supplier is required"),
  document: yup.string(),
  note: yup.string(),
  date: yup.date().required("Date is required"),
});

const Page: React.FC = () => {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [supplierData, setSupplierData] = useState<any>();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [productSearch, setProductSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [productUnitCosts, setProductUnitCosts] = useState<
    Record<string, number>
  >({});
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce<string>(productSearch);

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageOpen(true);
  };

  const closeModal = () => {
    setIsImageOpen(false);
    setSelectedImage(null);
  };

  const {
    handleSubmit,
    register,
    watch,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

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

  const formSubmit = (data: any) => {
    if (orderDetails?.purchase_products === undefined) {
      ToastService.warning("Select at least one product.");
      return
    }
    setIsSubmit(true);

    const simplifiedProducts = orderDetails.purchase_products.map(
      (product: any) => ({
        product: product.product_id,
        quantity: product.quantity,
        discount: product.discount,
        unit_cost:
          productUnitCosts[product.product_id] !== undefined
            ? productUnitCosts[product.product_id]
            : product?.purchase_price || 0,
      })
    );

    // Check for zero unit cost
    const hasZeroUnitCost = simplifiedProducts.some(
      (product: any) => product.unit_cost === 0
    );

    if (hasZeroUnitCost) {
      ToastService.error("Please update unit cost product");
      setIsSubmit(false);
      return;
    }

    PurchasesService.createPurchases({
      ...data,
      date: formatDateRange(data.date).trim(),
      status: data.status.value,
      supplier: data.supplier.value,
      // warehouse: data.warehouse.value,
      purchase_products: simplifiedProducts,
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          router.push("/admin/purchase/purchase");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };

  const supplierDataOption = supplierData?.map((item: any) => ({
    label: `${item.name
      .toLowerCase()
      .replace(/\b\w/g, (char: string) =>
        char
          .toLowerCase()
          .replace(/\b\w/g, (char: string) => char.toUpperCase())
      )} - ${item.company_name
        .toLowerCase()
        .replace(/\b\w/g, (char: string) =>
          char
            .toLowerCase()
            .replace(/\b\w/g, (char: string) => char.toUpperCase())
        )}`,
    value: item._id,
  }));



  const getAllSupplier = () => {
    SupplierService.getAllSupplierSuggestions()
      .then((res: any) => {
        if (res?.success) {
          setSupplierData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    getAllSupplier();
  }, []);
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchProductSearch();
    }
  }, [debouncedSearchTerm]);


  const isProductAlreadyAdded = (productId: string) => {
    return orderDetails?.purchase_products?.some(
      (item: any) => item.product_id === productId
    );
  };



  const handleProductSelect = (product: any) => {
    const isAlreadyAdded = isProductAlreadyAdded(product._id);
    if (isAlreadyAdded) {
      ToastService.warning("This product is already added to the list");
      return;
    }

    setOrderDetails((prev: { purchase_products: any[] }) => ({
      ...prev,
      purchase_products: [
        ...(prev?.purchase_products || []),
        {
          product_id: product?._id,
          quantity: 1,
          subtotal: product.subtotal || "0",
          discount: product.discount || 0,
          purchase_price: product?.pricing?.purchase_price,
          unit_cost: product?.pricing?.purchase_price || 0,
          image: product?.featured_image?.src || NodataImage,
          title: product.title,
          sku: product.sku
        },
      ],
    }));

    setProductSearch("");
    setFilteredProducts([]);
    setShowSuggestions(false);
  };

  const fetchProductSearch = async () => {
    productService
      .getPurchaseProductSuggestion({
        searchTerm: debouncedSearchTerm,
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

    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: any) => {
    e.preventDefault();
    if (productSearch.length >= 2) {
      fetchProductSearch();
    }
  };

  const decrementQuantity = (index: number) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];
    const currentQuantity = Number(newItems[index].quantity) || 0;

    if (currentQuantity > 1) {
      newItems[index] = {
        ...newItems[index],
        quantity: currentQuantity - 1,
      };

      setOrderDetails((prevDetails: any) => ({
        ...prevDetails,
        purchase_products: newItems,
      }));
    }
  };

  const incrementQuantity = (index: number) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];
    const currentQuantity = Number(newItems[index].quantity) || 0;

    newItems[index] = {
      ...newItems[index],
      quantity: currentQuantity + 1,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: newItems,
    }));
  };



  const handleEditClick = (data: any) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleRemoveProduct = (productId: string) => {
    if (!orderDetails) return;

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: prevDetails.purchase_products.filter(
        (item: any) => item.product_id !== productId
      ),
    }));
  };

  const calculateSubtotal = () => {
    if (!orderDetails?.purchase_products) return 0;

    return orderDetails.purchase_products.reduce((total: number, item: any) => {
      const unitCost =
        productUnitCosts[item.product_id] !== undefined
          ? productUnitCosts[item.product_id]
          : item.unit_cost || 0;
      const quantity = item.quantity || 0;
      const discount = item.discount || 0;
      return total + (unitCost * quantity - discount);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = Number(watch("shipping")) || 0;
  const discount = Number(watch("discount")) || 0;
  const total = subtotal + shipping - discount;

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Ordered", value: "ordered" },
    { label: "Partial", value: "partial" },
    { label: "Received", value: "received" },
  ];

  const handleQuantityChange = (index: number, value: string) => {
    if (!orderDetails) return;

    const newItems = [...orderDetails.purchase_products];

    // empty input allow করবে
    if (value === "") {
      newItems[index] = {
        ...newItems[index],
        quantity: "",
      };

      setOrderDetails((prevDetails: any) => ({
        ...prevDetails,
        purchase_products: newItems,
      }));
      return;
    }

    const quantity = parseInt(value, 10);


    if (isNaN(quantity)) return;

    newItems[index] = {
      ...newItems[index],
      quantity: quantity < 1 ? 1 : quantity,
    };

    setOrderDetails((prevDetails: any) => ({
      ...prevDetails,
      purchase_products: newItems,
    }));
  };

  const totalQuantity =
    orderDetails?.purchase_products?.reduce(
      (acc: number, product: any) => acc + (product?.quantity || 0),
      0
    ) || 0;

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="edit-order-page !pb-0">
          <PageHeader title="Create Purchases" />
        </div>
      </NoScrollLayout>

      <form
        onSubmit={handleSubmit(formSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className="edit-order-page !pt-0 min-h-[75vh]"
      >
        <div className="edit-order-shell data-table-card glass-card">
          <div className="edit-order-form-grid">
            <div className="edit-order-field">
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    selectedDate={field.value}
                    onChange={(date) => field.onChange(date)}
                    label="Purchases Date"
                    dateFormat="dd-MM-yy"
                    wrapperClassName="w-full"
                  />
                )}
              />
            </div>
            <div className="edit-order-field">
              <label className="form-label">
                Supplier
                <span className="ms-1 text-xs text-[var(--color-danger,#ef4444)]">
                  *
                </span>
              </label>
              <Controller
                name="supplier"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={supplierDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Supplier"
                    isRequired
                    size="sm"
                  />
                )}
              />
            </div>
          </div>

          <div className="mt-2">
            <div className="edit-order-products-head">
              <h2>Products</h2>
              <div className="edit-order-search !max-w-none">
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
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Image
                              src={
                                product?.featured_image?.src || NodataImage
                              }
                              width={56}
                              height={56}
                              alt="Product Image"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-app">
                                {product?.title}
                              </p>
                              {product?.sku ? (
                                <p className="truncate text-xs text-app-muted">
                                  SKU: {product.sku}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-brand">
                            ৳ {product?.pricing?.purchase_price}
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

            <div className="edit-order-products-card">
              <div className="overflow-x-auto">
                <table className="edit-order-products-table">
                  <thead>
                    <tr>
                      <th className="is-center">#</th>
                      <th>Product</th>
                      <th>Name</th>
                      <th>Net Unit Cost</th>
                      <th className="is-center">
                        Quantity ({totalQuantity})
                      </th>
                      <th className="is-right">Subtotal</th>
                      <th className="is-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails?.purchase_products?.length > 0 ? (
                      [...orderDetails.purchase_products]
                        .reverse()
                        .map((product: any, reversedIndex: number) => {
                          const originalIndex =
                            orderDetails.purchase_products.length -
                            1 -
                            reversedIndex;
                          const unitCost =
                            productUnitCosts[product.product_id] !== undefined
                              ? productUnitCosts[product.product_id]
                              : product?.purchase_price ||
                                product?.unit_cost ||
                                0;
                          const lineSubtotal = (
                            Number(unitCost) * Number(product.quantity) -
                            (product.discount || 0)
                          ).toFixed(2);
                          const imageSrc = product?.image || NodataImage;

                          return (
                            <tr key={originalIndex}>
                              <td className="is-center">
                                <span className="text-sm font-semibold text-app-muted">
                                  {originalIndex + 1}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="edit-order-product-thumb"
                                  title={product?.title || "Product image"}
                                  onClick={() => {
                                    if (product?.image) {
                                      handleImageClick(product.image);
                                    }
                                  }}
                                >
                                  <Image
                                    src={imageSrc}
                                    width={140}
                                    height={140}
                                    quality={80}
                                    alt={product?.title || "Product Image"}
                                  />
                                </button>
                              </td>
                              <td>
                                <div className="edit-order-product-meta">
                                  <p className="edit-order-product-title">
                                    {product?.title}
                                  </p>
                                  {product?.sku ? (
                                    <p className="edit-order-product-sub">
                                      SKU: {product.sku}
                                    </p>
                                  ) : null}
                                </div>
                              </td>
                              <td>
                                <div className="inline-flex items-center gap-2">
                                  <span className="edit-order-money is-strong">
                                    ৳ {Number(unitCost).toFixed(2)}
                                  </span>
                                  <button
                                    type="button"
                                    className="table-copy-btn !opacity-100"
                                    aria-label="Edit unit cost"
                                    title="Edit unit cost"
                                    onClick={() => handleEditClick(product)}
                                  >
                                    <Icon
                                      name="edit_square"
                                      variant="outlined"
                                      size={16}
                                      className="text-brand"
                                    />
                                  </button>
                                </div>
                              </td>
                              <td className="is-center">
                                <div className="edit-order-qty">
                                  <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    onClick={() =>
                                      decrementQuantity(originalIndex)
                                    }
                                  >
                                    <Icon name="remove" size={16} />
                                  </button>
                                  <input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        originalIndex,
                                        e.target.value,
                                      )
                                    }
                                    aria-label="Quantity"
                                    className="!w-16"
                                  />
                                  <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    onClick={() =>
                                      incrementQuantity(originalIndex)
                                    }
                                  >
                                    <Icon name="add" size={16} />
                                  </button>
                                </div>
                              </td>
                              <td className="is-right">
                                <span className="edit-order-money is-strong">
                                  ৳ {lineSubtotal}
                                </span>
                              </td>
                              <td className="is-center">
                                <button
                                  type="button"
                                  className="edit-order-remove-btn"
                                  aria-label="Remove product"
                                  title="Remove product"
                                  onClick={() =>
                                    handleRemoveProduct(product?.product_id)
                                  }
                                >
                                  <Icon
                                    name="delete"
                                    variant="outlined"
                                    size={18}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={7} className="edit-order-empty">
                          No products added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="edit-order-summary">
                <div className="edit-order-summary-card">
                  <div className="edit-order-summary-row">
                    <span>Subtotal</span>
                    <strong>৳ {subtotal.toFixed(2)}</strong>
                  </div>
                  <div className="edit-order-summary-row">
                    <span>Shipping</span>
                    <strong>৳ {shipping.toFixed(2)}</strong>
                  </div>
                  <div className="edit-order-summary-row">
                    <span>Discount (−)</span>
                    <strong>৳ {discount.toFixed(2)}</strong>
                  </div>
                  <div className="edit-order-summary-row is-total">
                    <span>Total</span>
                    <strong>৳ {total.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="edit-order-form-grid mt-5">
            <div className="edit-order-field">
              <Input
                label="Shipping"
                registerProperty={register("shipping")}
                errorText={errors?.shipping?.message}
                type="number"
                placeholder="Enter shipping amount"
              />
            </div>
            <div className="edit-order-field">
              <Input
                label="Discount"
                registerProperty={register("discount")}
                errorText={errors?.discount?.message}
                type="number"
                placeholder="Enter discount amount"
              />
            </div>
            <div className="edit-order-field">
              <Input
                label="Document"
                registerProperty={register("document")}
                errorText={errors?.document?.message}
                type="text"
                placeholder="Enter document reference"
              />
            </div>
            <div className="edit-order-field">
              <label className="form-label">
                Status
                <span className="ms-1 text-xs text-[var(--color-danger,#ef4444)]">
                  *
                </span>
              </label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Status"
                    isRequired
                    size="sm"
                  />
                )}
              />
            </div>
            <div className="edit-order-field xl:col-span-2">
              <Input
                label="Note"
                registerProperty={register("note")}
                errorText={errors?.note?.message}
                type="textarea"
                placeholder="Enter note"
              />
            </div>
          </div>

          <div className="edit-order-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/admin/purchase/purchase")}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmit}>
              {isSubmit ? <ButtonLoader /> : "Create"}
            </button>
          </div>
        </div>
      </form>

      <PurchasesModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        modalMode={modalMode}
        items={items}
        setProductUnitCosts={setProductUnitCosts}
      />

      {isImageOpen && selectedImage && (
        <ImagePreviewModal
          selectedImage={selectedImage}
          closeModal={closeModal}
        />
      )}
    </AuthLayout>
  );
};

export default Page;
