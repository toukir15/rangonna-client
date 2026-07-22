import OrderLayoutHeader from "@/@components/pages/Header/OrderLayoutHeader";
import StorefrontProviders from "@/@components/pages/StorefrontProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StorefrontProviders>
      <div className="!w-[100%] font-nunito">
      <div className="sticky top-0 z-50">
        <OrderLayoutHeader />
      </div>

      <div className="rongonaa-checkout-shell 2xl:p-0">{children}</div>
    </div>
    </StorefrontProviders>
  );
}
