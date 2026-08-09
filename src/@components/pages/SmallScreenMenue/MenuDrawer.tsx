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
        className="xs:pl-3 py-5 lg:pl-4"
      >
        <Drawer.Header className="pr-2 flex items-center justify-between border-b pb-3 border-gray-200">
          <div className="relative w-full">
            <div>
              <input
                ref={searchInputRef}
                value={searchId}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                type="text"
                placeholder="Search for products"
                className="p-2 w-full pr-10 border-none focus:ring-0 focus:outline-none text-xl"
              />
              <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 mt-1">
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

        <Drawer.Body className="mt-2 mb-5 overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            {navItems?.map((item: IMenuItem) => {
              const parentActive = isParentActive(item);

              return (
                <div key={item.id} className="border-b border-gray-100 pb-2">
                  {item.submenu?.length ? (
                    <div>
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className={`w-full flex justify-between items-center px-3 py-1 rounded-md transition-colors ${parentActive
                          ? "bg-primary text-white !font-bold"
                          : "hover:bg-gray-50"
                          }`}
                      >
                        <span className="text-lg font-medium">{item.name}</span>

                        <Icon
                          name={
                            activeSubmenu === item.id
                              ? "keyboard_arrow_up"
                              : "keyboard_arrow_down"
                          }
                          size={30}
                          variant="outlined"
                          className={`${parentActive ? "text-white" : "text-gray-300"
                            }`}
                        />
                      </button>

                      {activeSubmenu === item.id && (
                        <div className="pl-6 animate-slideDown mt-2">
                          {item.submenu.map((subItem) => {
                            const isActive = pathname === subItem.route;

                            return (
                              <Link
                                key={subItem.id}
                                href={subItem.route}
                                className={`block px-2 py-1.5 rounded-md transition-all duration-200 hover:bg-gray-50 hover:translate-x-1 hover:scale-[1.02] ${isActive
                                  ? "bg-primary-lighter text-primary border border-primary-border font-semibold"
                                  : "text-gray-700"
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
                      className={`block px-3 py-1 text-lg font-medium rounded-md transition-colors gap-1 flex items-center ${parentActive
                        ? "bg-primary text-white font-semibold"
                        : "hover:bg-gray-50"
                        }`}
                      onClick={() => setIsCartDrawer(false)}
                    >
                      <span> {item?.icon ? (
                        <Icon
                          name={item.icon}
                          className="text-gray-300  fire-flicker"
                          style={{ color: item?.color }}
                        />
                      ) : null}</span>
                      <span className={`${item?.icon ? "-mt-2" : ""}`}>{item.name}</span>
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