import type { Metadata } from "next";
import CartView from "@/@components/pages/ViewCart/Cart";

export const metadata: Metadata = {
  title: "Cart | Naviforce Bangladesh",
};

const Page: React.FC = () => {
  return <CartView />;
};

export default Page;
