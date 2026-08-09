import Button from "@/@components/core/Button/Button";
import Drawer from "@/@components/core/Drawer/Drawer";
import Icon from "@/@components/core/Icon/Icon";
import { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { GlobalContext } from "../Context/GlobalContext";
import Link from "next/link";

interface IShapingCartDrawer {
  isCartDrawer: boolean;
  setIsCartDrawer: (data: boolean) => void;
}

const ShapingCartDrawer: React.FC<IShapingCartDrawer> = ({
  isCartDrawer,
  setIsCartDrawer,
}) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { setRealTimeCartItems } = useContext(GlobalContext);

  useEffect(() => {
    const cookieCart = getCookie("cartData");
    if (cookieCart) {
      const parsedCart = JSON.parse(cookieCart.toString());
      setCartItems(parsedCart);
    } else {
      setCartItems([]);
    }
  }, [isCartDrawer]);

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems],
  );

  const removeItem = (index: number) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    setCookie("cartData", JSON.stringify(updatedCart));
    setRealTimeCartItems(true);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    setCookie("cartData", JSON.stringify(updatedCart));
    setRealTimeCartItems(true);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  return (
    <Drawer
      isOpen={isCartDrawer}
      onClose={() => setIsCartDrawer(false)}
      overlayClassName="rongonaa-cart-drawer-overlay"
      className="rongonaa-cart-drawer px-0 py-0"
    >
      <Drawer.Header className="rongonaa-cart-drawer-header">
        <div>
          <p className="rongonaa-cart-drawer-kicker">Shopping Bag</p>
          <h3 className="rongonaa-cart-drawer-title">
            My Bag
            {totalItems > 0 ? (
              <span className="rongonaa-cart-drawer-count">{totalItems}</span>
            ) : null}
          </h3>
        </div>
        <button
          type="button"
          className="rongonaa-cart-drawer-close"
          onClick={() => setIsCartDrawer(false)}
          aria-label="Close cart"
        >
          <Icon name="close" size={18} />
        </button>
      </Drawer.Header>

      <Drawer.Body className="rongonaa-cart-drawer-body">
        {cartItems.length ? (
          cartItems.map((item: any, index: number) => (
            <article className="rongonaa-cart-drawer-item" key={index}>
              <div className="rongonaa-cart-drawer-thumb">
                <Image
                  className="object-cover"
                  fill
                  sizes="68px"
                  src={item.image}
                  alt={item.title}
                />
              </div>

              <div className="rongonaa-cart-drawer-item-main">
                <p className="rongonaa-cart-drawer-item-title">{item.title}</p>
                <p className="rongonaa-cart-drawer-item-price">
                  ৳{(item.price * item.quantity).toFixed(0)}
                </p>

                <div className="rongonaa-cart-drawer-item-actions">
                  <div className="rongonaa-cart-drawer-qty">
                    <button
                      type="button"
                      className="rongonaa-cart-drawer-qty-btn"
                      disabled={item.quantity === 1}
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="rongonaa-cart-drawer-qty-value">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="rongonaa-cart-drawer-qty-btn"
                      disabled={
                        item.quantity === 10 ||
                        Number(item.max_quantity) === Number(item.quantity)
                      }
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="rongonaa-cart-drawer-remove"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    <Icon name="delete" size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rongonaa-cart-drawer-empty">
            <div className="rongonaa-cart-drawer-empty-icon">
              <Icon name="shopping_bag" size={34} variant="outlined" />
            </div>
            <p className="rongonaa-cart-drawer-empty-title">Your bag is empty</p>
            <p className="rongonaa-cart-drawer-empty-text">
              মায়ের প্রয়োজনীয় পণ্য যোগ করে checkout করুন
            </p>
            <Link href="/churi" className="rongonaa-cart-drawer-empty-btn">
              <Button
                className="w-full !premium-cta !text-sm cursor-pointer"
                onClick={() => setIsCartDrawer(false)}
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </Drawer.Body>

      <Drawer.Footer className="rongonaa-cart-drawer-footer">
        {cartItems.length ? (
          <>
            <div className="rongonaa-cart-drawer-summary">
              <span className="rongonaa-cart-drawer-summary-label">
                Subtotal ({totalItems} items)
              </span>
              <span className="rongonaa-cart-drawer-summary-value">
                ৳{calculateSubtotal().toFixed(0)}
              </span>
            </div>
            <Button
              className="rongonaa-cart-drawer-checkout premium-cta cursor-pointer"
              onClick={() => {
                router.push("/checkout");
                setIsCartDrawer(false);
              }}
            >
              Proceed to Checkout
            </Button>
          </>
        ) : null}
      </Drawer.Footer>
    </Drawer>
  );
};

export default ShapingCartDrawer;
