import Footer from "@/@components/pages/Footer/Footer";
import Header from "@/@components/pages/Header/Header";
import NavBar from "@/@components/pages/Header/NavBar";
import NavigationBar from "@/@components/pages/NavigationBar/NavigationBar";
import StorefrontProviders from "@/@components/pages/StorefrontProviders";
import { ENV } from "@/@config/env.config";
import { withoutBrandNavItems } from "@/utils/nav-menu";

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
    return withoutBrandNavItems(data?.data?.navBarItems || []);
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = await getMenuData();

  return (
    <StorefrontProviders>
      <div className="!w-full font-poppins">
        <div className="sticky top-0 z-50">
          <Header navItems={navItems} />
        </div>

        <div>
          <NavBar />
        </div>

        <div className="bg-[var(--brand-header-bg)] 2xl:p-0">{children}</div>

        <div>
          <NavigationBar />
        </div>

        <div className="pb-14 lg:pb-0">
          <Footer />
        </div>
      </div>
    </StorefrontProviders>
  );
}
