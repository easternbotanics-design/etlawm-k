import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import UserSidebar from "../components/UserDashboard/UserSidebar.jsx";
import UserTopBar from "../components/UserDashboard/UserTopBar.jsx";
import UserHome from "../components/UserDashboard/UserHome.jsx";
import UserProfile from "../components/UserDashboard/UserProfile.jsx";
import UserAddress from "../components/UserDashboard/UserAddress.jsx";
import UserOrders from "../components/UserDashboard/UserOrders.jsx";
import UserSupport from "../components/UserDashboard/UserSupport.jsx";
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