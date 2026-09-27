import type { Metadata } from "next";
import CartView from "@/@components/pages/ViewCart/Cart";

export const metadata: Metadata = {
  title: "Cart",
  robots: { index: false, follow: false },
};

const Page: React.FC = () => {
  return <CartView />;
};

export default Page;
