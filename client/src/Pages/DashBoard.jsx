import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import UserSidebar from "../Components/UserDashboard/UserSidebar";
import UserTopBar from "../Components/UserDashboard/UserTopBar";
import UserHome from "../Components/UserDashboard/UserHome";
import UserProfile from "../Components/UserDashboard/UserProfile";
import UserAddress from "../Components/UserDashboard/UserAddress";
import UserOrders from "../Components/UserDashboard/UserOrders";
import UserSupport from "../Components/UserDashboard/UserSupport";
import { colours, fonts } from "../theme/theme.js";

const DashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div 
      className="min-h-screen bg-mainBackground flex flex-col md:flex-row" 
      style={{ fontFamily: fonts.secondary, backgroundColor: colours.background }}
    >
      {/* Left Sidebar Panel */}
      <UserSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-x-hidden">
        {/* Top Header Bar */}
        <UserTopBar onMenuToggle={() => setSidebarOpen(true)} />

        {/* Dynamic Pages Contents Container */}
        <div className="flex-1 min-h-[400px]">
          <Routes>
            <Route path="/" element={<UserHome />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/address" element={<UserAddress />} />
            <Route path="/orders" element={<UserOrders />} />
            <Route path="/support" element={<UserSupport />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DashBoard;