"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";

import { ToastService } from "@admin/utils/toastr.service";
import { ProductBrandService } from "@admin/@services/apis/ProductService/ProductBrand.service";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import { CompanyService } from "@admin/@services/apis/SettingsService/CompanySettings/company.service";

interface FormValues {
  brand_names: string[];
  categories: string[];
}

const defaultValues: FormValues = {
  brand_names: [],
  categories: [],
};

// Simple validation: optional arrays
const schema = yup.object({
  brand_names: yup.array().of(yup.string()),
  categories: yup.array().of(yup.string()),
});

const ProductModal = ({ items, isModalOpen, setIsModalOpen }: any) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [brands, setBrands] = useState<{ key: string; value: string }[]>([]);
  const [categories, setCategories] = useState<
    { key: string; value: string }[]
  >([]);
  const [companyData, setCompanyData] = useState<any>(null);

  const { handleSubmit, watch, setValue, reset } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* ---------------- Checkbox Handler ---------------- */
  const handleCheckboxChange = (
    field: "brand_names" | "categories",
    value: string
  ) => {
    const currentValues = watch(field) || [];

    if (currentValues.includes(value)) {
      setValue(
        field,
        currentValues.filter((v: string) => v !== value)
      );
    } else {
      setValue(field, [...currentValues, value]);
    }
  };

  /* ---------------- Fetch Company Settings ---------------- */
  const fetchCompany = async () => {
    if (!items?.web_url) return;

    try {
      const res = await CompanyService.getCompany({
        domain: items.web_url,
        page: 1,
        limit: 50,
      });

      if (res?.success) {
        setCompanyData(res.data);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await ProductBrandService.getProductBrand();
      if (res?.success) setBrands(res.data);
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await ProductCategoryService.getProductCategory({
        page: 1,
        limit: 50,
      });
      if (res?.success) setCategories(res.data.data);
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  useEffect(() => {
    if (companyData) {
      reset({
        brand_names: companyData.brand_names?.map((b: any) => b.value) || [],
        categories: companyData.categories?.map((c: any) => c.value) || [],
      });
    }
  }, [companyData, reset]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isModalOpen) fetchCompany();
  }, [items?.web_url, isModalOpen]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmit(true);

    const payload = {
      website_product_settings: [
        {
          website: items?._id,
          brand_names: data.brand_names,
          categories: data.categories,
        },
      ],
    };

    try {
      const res = await CompanyService.updateCompanySettings(payload);

      if (res?.success) {
        ToastService.success(res.message);
        setIsModalOpen(false);
      } else {
        ToastService.error(res.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  const brandValues = watch("brand_names");
  const categoryValues = watch("categories");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Product Settings</h3>
          <Icon
            name="close"
            className="cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />
        </Modal.Header>

        <Modal.Body>
          {/* ---------------- Brands ---------------- */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Brands</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {brands.map((brand) => (
                <label
                  key={brand.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={brandValues?.includes(brand.value)}
                    onChange={() =>
                      handleCheckboxChange("brand_names", brand.value)
                    }
                  />
                  <span>{brand.key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ---------------- Categories ---------------- */}
          <div>
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={categoryValues?.includes(cat.value)}
                    onChange={() =>
                      handleCheckboxChange("categories", cat.value)
                    }
                  />
                  <span>{cat.key}</span>
                </label>
              ))}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-2">
          <Button type="button" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmit}>
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ProductModal;
