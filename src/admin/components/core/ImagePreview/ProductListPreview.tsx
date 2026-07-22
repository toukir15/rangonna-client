import Image from "next/image";
import Icon from "../Icon/Icon";

type Product = {
  grand_total: number;
  product: {
    featured_image: {
      src: string;
      title?: string;
      alt?: string;
    };
    title: string;
    pricing: {
      sale_price: number;
      regular_price: number;
    };
    inventory: {
      stock_quantity: number;
      stock_status: string;
      manage_stock: boolean;
    };
    _id: string;
  };
  return_quantity: number;
  unit_cost: number;
};

type ModalProps = {
  selectedProduct: Product[];
  closeModal: () => void;
};

const ProductListPreview: React.FC<ModalProps> = ({
  selectedProduct,
  closeModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-[2px]  bg-opacity-65 md:px-0 px-4">
      <div className="relative bg-white min-w-[600px] p-5 rounded-lg min-h-[500px]">
        <div className="space-y-4">
          {selectedProduct.map((product, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 border rounded-lg"
            >
              <div className="flex-shrink-0">
                <Image
                  src={product?.product?.featured_image?.src}
                  alt={
                    product?.product?.featured_image?.alt ||
                    product?.product?.title
                  }
                  className="rounded-lg object-cover"
                  height={80}
                  width={80}
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{product?.product?.title}</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">
                    Quantity: {product?.return_quantity}
                  </span>
                  <span className="font-semibold">
                    {product?.grand_total?.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Unit Price: {product?.unit_cost?.toFixed(2)}</p>
                  <p>
                    Regular Price:
                    {product?.product?.pricing?.regular_price?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Icon
          onClick={closeModal}
          name="close"
          variant="outlined"
          className="absolute top-2 right-2 text-white text-xl bg-gray-800 rounded-full p-1 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ProductListPreview;
