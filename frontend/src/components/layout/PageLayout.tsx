import { type ReactNode, useRef } from "react";
import { ChatBase, type ChatBaseRef } from "../chat/ChatBase";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const chatRef = useRef<ChatBaseRef>(null);

  return (
    <div className="min-h-screen flex flex-col pt-14">
      <Header />
      <Sidebar />
      <main className="flex-grow xl:ml-[260px] lg:mr-[40%] px-4 xl:px-8">{children}</main>
      <ChatBase ref={chatRef} />
      <Footer />
    </div>
  );
};

export default PageLayout;
