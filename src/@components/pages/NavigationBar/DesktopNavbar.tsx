"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/@components/core/Icon/Icon";

interface SubMenuItem {
  id?: string | number;
  name: string;
  route: string;
  icon?: string;
}

interface NavItem {
  id?: string | number;
  name: string;
  route?: string;
  icon?: string;
  submenu?: SubMenuItem[];
  color?: string;
}

interface DesktopNavbarProps {
  navItems: NavItem[];
}

export default function DesktopNavbar({ navItems }: DesktopNavbarProps) {
  const [openSubmenuIndex, setOpenSubmenuIndex] = useState<number | null>(null);

  const closeSubmenu = () => setOpenSubmenuIndex(null);

  return (
    <div className="hidden lg:block mx-auto max-w-layout w-full px-5 2xl:px-0">
      <ul className="rongonaa-nav-list py-0.5">
        {navItems.map((item, index) => {
          const hasSubmenu =
            Array.isArray(item?.submenu) && item.submenu.length > 0;
          const isSubmenuOpen = openSubmenuIndex === index;

          return (
            <li
              key={item.id ?? index}
              className="relative shrink-0"
              onMouseEnter={() => setOpenSubmenuIndex(index)}
              onMouseLeave={closeSubmenu}
            >
              {hasSubmenu ? (
                <>
                  <button
                    type="button"
                    className="rongonaa-nav-link"
                    data-open={isSubmenuOpen ? "true" : "false"}
                    onClick={() =>
                      setOpenSubmenuIndex((prev) =>
                        prev === index ? null : index,
                      )
                    }
                  >
                    {item?.icon ? (
                      <Icon
                        name={item.icon}
                        size={16}
                        style={{ color: item?.color || "var(--brand-primary)" }}
                      />
                    ) : null}
                    <span>{item.name}</span>
                    <Icon
                      name="keyboard_arrow_down"
                      size={18}
                      className={`transition-transform duration-300 ${isSubmenuOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <ul
                    className={`absolute left-0 top-full z-[60] min-w-[240px] pt-2 transition-all duration-200 ${isSubmenuOpen
                      ? "visible translate-y-0 opacity-100 pointer-events-auto"
                      : "invisible translate-y-2 opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="rongonaa-nav-dropdown">
                      {item.submenu?.map((subItem, subIndex) => (
                        <li key={subItem.id ?? subIndex}>
                          <Link
                            href={subItem.route}
                            onClick={closeSubmenu}
                            className="rongonaa-nav-dropdown-link"
                          >
                            {subItem?.icon ? (
                              <Icon
                                name={subItem.icon}
                                size={16}
                                className="text-primary"
                              />
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-lighter text-[11px] font-bold text-primary">
                                {subItem.name.charAt(0)}
                              </span>
                            )}
                            <span>{subItem.name}</span>
                          </Link>
                        </li>
                      ))}
                    </div>
                  </ul>
                </>
              ) : (
                <Link href={item.route || "#"} className="rongonaa-nav-link">
                  {item?.icon ? (
                    <Icon
                      name={item.icon}
                      size={18}
                      className="fire-flicker"
                      style={{ color: item?.color || "var(--brand-primary)" }}
                    />
                  ) : null}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
