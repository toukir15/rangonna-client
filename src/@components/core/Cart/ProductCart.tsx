"use client";
import React from "react";
import Image from "next/image";
import Button from "../Button/Button";
import { useRouter } from "next/navigation";


interface ProductCardProps {
  data: any;
  onAddToCart?: () => void;
  onOrderNow?: () => void;
  imgClassName?: string;
  isAddToCartButton?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  data,
  onAddToCart,
  imgClassName,
  isAddToCartButton = true,
}) => {
  const router = useRouter();
  const handleDetails = (proName: string) => {
    router.push(`product/${proName}`);
  };

  return (
    <div className="bg-white p-3 rounded-lg relative flex flex-col h-full border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:z-10">
      <div>
        <Image
          src={data.image}
          alt={data.name}
          width={200}
          height={200}
          className={`cursor-pointer w-full ${imgClassName ? imgClassName : "rounded-lg h-48 object-cover"
            }`}
          onClick={() => handleDetails(data?.name)}
        />

        <p className="absolute bg-primary-dark text-white text-xs px-2 rounded-lg py-1 left-5 top-5">
          -{data.discount}
        </p>

        <p className="mt-2 font-semibold text-[14px] tracking-wider">
          {data.name}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <p className="text-primary-dark font-semibold text-sm">৳{data.price}</p>
          <p className="text-gray-400 text-sm">
            <del>৳{data.originalPrice ?? data.price}</del>
          </p>
        </div>
      </div>

      <div className="xs:flex-none sm:flex items-center justify-between gap-3 mt-auto">
        {isAddToCartButton && (
          <Button
            onClick={onAddToCart}
            className="w-full mt-4 premium-add-cart !text-xs font-semibold !px-2 cursor-pointer text-nowrap"
          >
            🛒 Add To Cart
          </Button>
        )}

        <Button
          className="w-full mt-4 bg-black font-semibold !text-xs !px-2 cursor-pointer text-nowrap"
          onClick={() => {
            router.push(`/checkout`);
          }}
        >
          ORDER NOW
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
