import { ENV } from "@/@config/env.config";
import DesktopNavbar from "../NavigationBar/DesktopNavbar";

async function getMenuData() {
  try {
    const res = await fetch(
      `${ENV.ApiEndpoint?.trim()}/navbar-menu/naviforce`,
      {
        next: { revalidate: 10 },
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.navBarItems || [];
  } catch {
    return [];
  }
}

export default async function Navbar() {
  const navItems = await getMenuData();

  return (
    <nav className="rongonaa-nav-bar hidden lg:flex lg:min-h-[40px] lg:items-center">
      <DesktopNavbar navItems={navItems} />
    </nav>
  );
}
