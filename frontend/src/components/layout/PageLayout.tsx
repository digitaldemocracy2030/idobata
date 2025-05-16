import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      <Header />
      <Sidebar />
      <main className="flex-grow xl:ml-[260px] xl:mr-[40%] px-4 xl:px-8">{children}</main>
      <Footer />
    </div>
  );
};

export default PageLayout;
