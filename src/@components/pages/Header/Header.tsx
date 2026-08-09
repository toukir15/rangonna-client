"use client";

import Image from "next/image";
import rongonaaLogo from "@/@assets/rongonaLogo/rongonaa.png";
import Icon from "@/@components/core/Icon/Icon";
import ShapingCartDrawer from "../ShapingCart/ShapingCartDrawer";
import MenuDrawer from "../SmallScreenMenue/MenuDrawer";
import SignUpModal from "../SignUp/SignUpModal";
import { SuggestionList } from "./SuggestionList";
import { GlobalContext } from "../Context/GlobalContext";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";
import { trimString } from "@/utils";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState, useMemo } from "react";
import { getCookie } from "cookies-next";
import {
  ICartItem,
  ISuggestion,
} from "@/@interfaces/HeaderInterface/header.interface";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import { IMenuItem } from "@/@interfaces/RouteInterface/route.interface";
import MobileSearch from "../NavigationBar/MobileSearch";
import ThemePicker from "./ThemePicker";

interface HeaderProps {
  navItems: IMenuItem[];
}

const Header: React.FC<HeaderProps> = ({ navItems }) => {
  const router = useRouter();

  const {
    isSignUpDrawer,
    setIsSignUpDrawer,
    isCartDrawer,
    setIsCartDrawer,
    isMenuDrawer,
    setIsMenuDrawer,
    realTimeCartItems,
    setRealTimeCartItems,
    userInfo,
    setIsProfile,
    setTotalCount,
  } = useContext(GlobalContext);

  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [searchId, setSearchId] = useState("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<ISuggestion[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  useEffect(() => {
    setRealTimeCartItems(false);
    const cookieCart = getCookie("cartData");

    if (cookieCart) {
      try {
        setCartItems(JSON.parse(cookieCart.toString()));
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [realTimeCartItems, setRealTimeCartItems]);

  useEffect(() => {
    setTotalCount(totalQuantity);
  }, [totalQuantity, setTotalCount]);

  const handleSignUpClick = () => {
    setIsProfile(true);
    if (userInfo) router.push("/my-account");
    else setIsSignUpDrawer(true);
  };

  const handleShapingCart = () => setIsCartDrawer(true);
  const handleMenuClick = () => setIsMenuDrawer(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchId(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (value.trim().length >= 3) {
      debounceTimeout.current = setTimeout(() => fetchSuggestions(value), 400);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const fetchSuggestions = async (query: string) => {
    setSearchLoading(true);
    try {
      const res = await ProductService.getSearchGlobal({ searchTerm: query });

      if (res?.success) {
        setFilteredSuggestions(res.data || []);
        setShowSuggestions(true);
      } else {
        setFilteredSuggestions([]);
        setShowSuggestions(true);
        ToastService.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      setFilteredSuggestions([]);
      setShowSuggestions(true);
      ToastService.error(err?.message || "Network error");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    if (filteredSuggestions.length === 1) {
      router.push(
        `/product/${encodeURIComponent(filteredSuggestions[0]?.slug)}`,
      );
    } else if (filteredSuggestions.length > 1) {
      router.push(`/churi?search=${encodeURIComponent(searchId)}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setShowSuggestions(false);
  };

  const handleSubmit = () => {
    if (filteredSuggestions.length > 1 || searchId.trim()) {
      router.push(`/churi?search=${encodeURIComponent(searchId)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (s: ISuggestion) => {
    setSearchId(s.title);
    setShowSuggestions(false);
    router.push(`/product/${encodeURIComponent(s.slug)}`);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLDivElement | HTMLInputElement>,
  ) => {
    if (
      suggestionBoxRef.current &&
      !suggestionBoxRef.current.contains(e.relatedTarget as Node)
    ) {
      setTimeout(() => setShowSuggestions(false), 200);
    }
  };

  return (
    <header className="rongonaa-site-header z-[9999]">
      <div className="rongonaa-header-shimmer" aria-hidden="true" />

      <div className="rongonaa-header-body">
        <div className="max-w-layout mx-auto px-3 sm:px-5 2xl:px-0">
          <div className="rongonaa-header-row">
            <div className="rongonaa-logo-block shrink-0 min-w-0">
              <button
                type="button"
                className="rongonaa-logo-frame shrink-0"
                onClick={() => router.push("/")}
                aria-label="Rangonaa home"
              >
                <Image
                  src={rongonaaLogo}
                  alt="Rangonaa"
                  width={833}
                  height={178}
                  priority
                  className="rongonaa-logo-img"
                />
              </button>
            </div>

            <div
              className="rongonaa-search-shell hidden min-w-0 flex-1 lg:block"
              onBlur={handleBlur}
              onFocus={() => setShowSuggestions(true)}
            >
              <Icon
                name="search"
                variant="outlined"
                size={18}
                className="rongonaa-search-icon"
              />
              <input
                ref={searchInputRef}
                value={searchId}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                type="text"
                placeholder="Search bangles, bridal, festival..."
                className="rongonaa-search-input"
              />
              <button
                type="button"
                className="rongonaa-search-submit"
                onClick={handleSubmit}
                aria-label="Search products"
              >
                {searchLoading ? (
                  <ButtonLoader className="!py-0" />
                ) : (
                  <span className="rongonaa-search-submit__label">Search</span>
                )}
              </button>

              {showSuggestions && searchId.trim().length >= 3 && (
                <div
                  ref={suggestionBoxRef}
                  className="absolute top-[calc(100%+0.45rem)] left-0 right-0 z-50"
                >
                  {filteredSuggestions.length > 0 ? (
                    <SuggestionList
                      suggestions={filteredSuggestions}
                      onSelect={handleSuggestionClick}
                    />
                  ) : !searchLoading ? (
                    <div className="rongonaa-suggestions-panel p-6 text-center">
                      <div className="rongonaa-suggestions-empty-icon">
                        <Icon name="search_off" className="text-primary" />
                      </div>
                      <h3 className="mt-3 text-sm font-medium tracking-wide text-secondary">
                        No products found
                      </h3>
                      <p className="mt-1 text-xs text-secondary/55">
                        Try another keyword
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="rongonaa-header-actions">
              <a href="tel:01805049380" className="rongonaa-phone-chip">
                <Icon name="call" size={15} className="rongonaa-phone-icon" />
                <span className="rongonaa-phone-copy">
                  <span className="rongonaa-phone-label">Helpline</span>
                  <span className="rongonaa-phone-number">01805049380</span>
                </span>
              </a>

              <div className="rongonaa-action-rail">
                <ThemePicker />

                <button
                  type="button"
                  className="rongonaa-icon-action hidden lg:inline-flex"
                  onClick={handleSignUpClick}
                >
                  <Icon name="person" size={18} variant="outlined" />
                  <span>
                    {userInfo
                      ? trimString(userInfo.first_name, 8, true)
                      : "Account"}
                  </span>
                </button>

                <button
                  type="button"
                  className="rongonaa-cart-pill"
                  onClick={handleShapingCart}
                  aria-label="Open cart"
                >
                  {totalQuantity > 0 && (
                    <span className="rongonaa-cart-count">{totalQuantity}</span>
                  )}
                  <Icon
                    name="shopping_bag"
                    size={18}
                    variant="outlined"
                  />
                  <span className="rongonaa-cart-pill-text">
                    <span className="rongonaa-cart-pill-label">Bag</span>
                    <span className="rongonaa-cart-pill-price">
                      ৳{totalPrice}
                    </span>
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="rongonaa-menu-btn shrink-0 lg:hidden"
                onClick={handleMenuClick}
                aria-label="Open menu"
              >
                <Icon name="menu" size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rongonaa-mobile-search-row">
        <MobileSearch embedded />
      </div>

      <SignUpModal
        isModalOpen={isSignUpDrawer}
        setIsModalOpen={setIsSignUpDrawer}
      />

      <ShapingCartDrawer
        isCartDrawer={isCartDrawer}
        setIsCartDrawer={setIsCartDrawer}
      />

      <MenuDrawer
        isCartDrawer={isMenuDrawer}
        setIsCartDrawer={setIsMenuDrawer}
        navItems={navItems}
      />
    </header>
  );
};

export default Header;
