"use client";

import Drawer from "@/@components/core/Drawer/Drawer";
import Icon from "@/@components/core/Icon/Icon";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { IMenuItem } from "@/@interfaces/RouteInterface/route.interface";

interface IShapingCartDrawer {
  isCartDrawer: boolean;
  setIsCartDrawer: (data: boolean) => void;
  navItems: IMenuItem[];
}

const MenuDrawer: React.FC<IShapingCartDrawer> = ({
  isCartDrawer,
  setIsCartDrawer,
  navItems,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const [searchId, setSearchId] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);

  const toggleSubmenu = (id: number) => {
    setActiveSubmenu((prev) => (prev === id ? null : id));
  };

  const isParentActive = (item: IMenuItem) => {
    if (item.submenu?.length) {
      return item.submenu.some((sub) => pathname === sub.route);
    }
    return pathname === item.route;
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchId(suggestion?.title || "");
    setShowSuggestions(false);
    router.push(`/product/${encodeURIComponent(suggestion?.slug)}`);
    setIsCartDrawer(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchId(value);

    if (value.trim().length >= 3) {
      fetchSuggestions(value);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const res = await ProductService.getSearchGlobal({
        searchTerm: query,
      });

      if (res?.success) {
        setFilteredSuggestions(res?.data || []);
        setShowSuggestions(true);
      } else {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    if (filteredSuggestions.length === 1) {
      const suggestion = filteredSuggestions[0];
      router.push(`/product/${encodeURIComponent(suggestion?.slug)}`);
      setShowSuggestions(false);
      setIsCartDrawer(false);
    } else if (filteredSuggestions.length > 1) {
      router.push(`/churi?search=${encodeURIComponent(searchId)}`);
      setShowSuggestions(false);
      setIsCartDrawer(false);
    }
  };

  return (
    <div>
      <Drawer
        isOpen={isCartDrawer}
        onClose={() => setIsCartDrawer(false)}
        side="left"
        className="rongonaa-mobile-menu !z-[60] !w-[86vw] max-w-[380px] !p-0"
      >
        <Drawer.Header className="rongonaa-mobile-menu-header border-b border-[var(--brand-primary-border)] px-4 pb-4 pt-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                  Explore
                </p>
                <p className="mt-0.5 text-base font-bold text-[var(--brand-secondary)]">
                  Rangonaa
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCartDrawer(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-primary-border)] bg-white text-[var(--brand-primary-dark)] transition hover:bg-[var(--brand-primary-lighter)]"
                aria-label="Close menu"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="relative">
              <input
                ref={searchInputRef}
                value={searchId}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                type="text"
                placeholder="Search for products"
                className="h-11 w-full rounded-xl border border-[var(--brand-primary-border)] bg-white px-3 pr-10 text-sm text-[var(--brand-secondary)] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--brand-primary)]">
                <Icon name="search" variant="outlined" />
              </span>
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionBoxRef}
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 shadow-lg max-h-64 overflow-y-auto z-10 mt-1 rounded-lg"
              >
                <ul className="bg-white p-2">
                  {filteredSuggestions.map((suggestion: any, index: number) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex flex-col cursor-pointer"
                    >
                      <div className="flex items-start p-2 border mb-2 border-gray-200 rounded-md gap-2 hover:bg-gray-100 transition-colors">
                        {suggestion?.featured_image?.src && (
                          <Image
                            src={suggestion.featured_image.src}
                            alt={suggestion?.title || "product image"}
                            height={40}
                            width={50}
                            className="rounded-lg"
                          />
                        )}

                        <div>
                          <p>{suggestion?.title}</p>
                          <p className="text-primary font-bold">
                            ৳{suggestion?.pricing?.sale_price}{" "}
                            <del className="text-gray-300">
                              ৳{suggestion?.pricing?.regular_price}
                            </del>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Drawer.Header>

        <Drawer.Body className="rongonaa-mobile-menu-body !p-3 overflow-y-auto">
          <nav className="flex flex-col gap-1" aria-label="Mobile menu">
            {navItems?.map((item: IMenuItem) => {
              const parentActive = isParentActive(item);

              return (
                <div key={item.id} className="border-b border-[var(--brand-neutral-border)] pb-1 last:border-b-0">
                  {item.submenu?.length ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(item.id)}
                        aria-expanded={activeSubmenu === item.id}
                        className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold transition-colors ${
                          parentActive
                            ? "bg-[var(--brand-primary)] text-white shadow-sm"
                            : "text-[var(--brand-secondary)] hover:bg-[var(--brand-primary-lighter)]"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon ? (
                            <Icon
                              name={item.icon}
                              size={18}
                              className={parentActive ? "text-white" : "text-[var(--brand-primary)]"}
                              style={{ color: parentActive ? undefined : item.color }}
                            />
                          ) : null}
                          {item.name}
                        </span>

                        <Icon
                          name={
                            activeSubmenu === item.id
                              ? "keyboard_arrow_up"
                              : "keyboard_arrow_down"
                          }
                          size={20}
                          variant="outlined"
                          className={parentActive ? "text-white" : "text-gray-400"}
                        />
                      </button>

                      {activeSubmenu === item.id && (
                        <div className="mt-1 space-y-1 border-l-2 border-[var(--brand-primary-border)] pl-3">
                          {item.submenu.map((subItem) => {
                            const isActive = pathname === subItem.route;

                            return (
                              <Link
                                key={subItem.id}
                                href={subItem.route}
                                className={`flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors ${
                                  isActive
                                    ? "bg-[var(--brand-primary-lighter)] font-semibold text-[var(--brand-primary-dark)]"
                                    : "text-[var(--brand-secondary)] hover:bg-[var(--brand-primary-lighter)]"
                                  }`}
                                onClick={() => setIsCartDrawer(false)}
                              >
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.route}
                      className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                        parentActive
                          ? "bg-[var(--brand-primary)] text-white shadow-sm"
                          : "text-[var(--brand-secondary)] hover:bg-[var(--brand-primary-lighter)]"
                        }`}
                      onClick={() => setIsCartDrawer(false)}
                    >
                      {item?.icon ? (
                        <Icon
                          name={item.icon}
                          size={18}
                          className={parentActive ? "text-white" : "text-[var(--brand-primary)]"}
                          style={{ color: parentActive ? undefined : item.color }}
                        />
                      ) : null}
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default MenuDrawer;