import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col pt-24">
      <Header />
      <Sidebar />
      <main className="flex-grow md:ml-[260px] px-4 md:px-8">{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
