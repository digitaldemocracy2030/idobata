import type React from 'react';
import { Outlet } from 'react-router-dom';
import ChatPanel from './ChatPanel'; // Assuming ChatPanel is in the same directory

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Content Area - Top half on mobile, Right side on desktop */}
      <div className="h-1/2 md:h-screen md:w-2/3 overflow-y-auto p-4 order-1 md:order-2">
        <Outlet /> {/* Nested routes will render here */}
      </div>

      {/* Chat Panel - Bottom half on mobile, Left side on desktop */}
      <div className="h-1/2 md:h-screen md:w-1/3 border-t md:border-t-0 md:border-r border-gray-300 overflow-y-auto sticky top-0 order-2 md:order-1">
        <ChatPanel />
      </div>
    </div>
  );
};

export default Layout;
