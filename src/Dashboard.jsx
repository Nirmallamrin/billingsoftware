import React, { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiSettings,
  FiMail,
  FiPieChart,
  FiPackage,
  FiFileText,
  FiUsers,
  FiMessageSquare,
  FiHelpCircle,
  FiMenu,
  FiChevronLeft,
  FiUser,
  FiLogOut
} from "react-icons/fi";

import { LuLayoutDashboard } from "react-icons/lu";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "./SupabaseClient";

// Import separate page components
import Billing from "./page/Billing";
import DashboardContent from "./page/Dashboard";
import Inbox from "./page/Inbox";
import Reports from "./page/Reports";
import Products from "./page/Products";
import Invoices from "./page/Invoices";
import Customers from "./page/Customers";
import ChatRoom from "./page/ChatRoom";
import HelpCenter from "./page/HelpCenter";
import Settings from "./page/Settings";

const allSidebarItems = [
  { icon: <FiFileText />, label: "Billing", roles: ["admin", "staff"] },
  { icon: <LuLayoutDashboard />, label: "Dashboard", roles: ["admin", "staff"] },
  { icon: <FiMail />, label: "Inbox", roles: ["admin"] },
  { icon: <FiPieChart />, label: "Reports", roles: ["admin"] },
  { icon: <FiPackage />, label: "Products", roles: ["admin"] },
  { icon: <FiFileText />, label: "Invoices", roles: ["admin"] },
  { icon: <FiUsers />, label: "Customers", roles: ["admin"] },
  { icon: <FiMessageSquare />, label: "Chat Room", roles: ["admin", "staff"] },
  { icon: <FiHelpCircle />, label: "Help Center", roles: ["admin", "staff"] },
  { icon: <FiSettings />, label: "Settings", roles: ["admin"] },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('invox_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Set default view based on role
    if (parsedUser.role === 'staff') {
      setActiveItem("Billing");
    }
  }, [navigate]);

  const sidebarItems = useMemo(() => {
    if (!user) return [];
    return allSidebarItems.filter(item => item.roles.includes(user.role));
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('invox_user');
    navigate('/login');
  };

  // Map labels to components
  const PageComponent = useMemo(() => {
    switch (activeItem) {
      case "Billing": return Billing;
      case "Dashboard": return DashboardContent;
      case "Inbox": return Inbox;
      case "Reports": return Reports;
      case "Products": return Products;
      case "Invoices": return Invoices;
      case "Customers": return Customers;
      case "Chat Room": return ChatRoom;
      case "Help Center": return HelpCenter;
      case "Settings": return Settings;
      case "My Profile": return Settings;
      default: return DashboardContent;
    }
  }, [activeItem]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#F5F7FB] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-black border-r border-gray-100 flex flex-col shrink-0 transition-all duration-300 ease-in-out relative ${isSidebarOpen ? "w-46" : "w-20"}`}
      >
        {/* Toggle Button centered on border */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-2.5 top-10 w-6 h-6 bg-white rounded-full border border-gray-200 shadow-lg flex items-center justify-center z-[60] cursor-pointer hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
        >
          <FiChevronLeft 
            size={14} 
            className={`text-gray-600 transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-180"}`} 
          />
        </button>

        <div className={`p-3 flex items-center h-20 justify-center`}>
          {isSidebarOpen ? (
            <img
              src={logo}
              alt="Invox"
              className="w-28 bg-white p-2 rounded-xl h-auto max-h-12 object-contain transition-transform hover:scale-105 duration-300"
            />
          ) : (
            <img
              src={logo}
              alt="Invox"
              className="w-10 bg-white p-1 rounded-lg h-6 object-contain"
            />
          )}
        </div>

        <nav className="flex-1 px-0.5 mt-2 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveItem(item.label)}
              title={!isSidebarOpen ? item.label : ""}
              className={`w-full cursor-pointer flex items-center ${isSidebarOpen ? "px-4" : "justify-center"} py-2 rounded-2xl transition-all group relative ${activeItem === item.label
                ? "bg-[#2ECC71] text-white shadow-lg shadow-[#2ECC71]/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#252525]"
                }`}
            >
              <div className={` text-md transition-transform group-hover:scale-110 ${activeItem === item.label ? "text-white" : "text-gray-500"}`}>
                {item.icon}
              </div>
              {isSidebarOpen && (
                <span className="ml-4 text-sm tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-13 bg-white border-b border-gray-50 flex items-center justify-between px-10 shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              {activeItem}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-4 p-1.5 pr-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
              >
                <div className="relative">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=2ECC71&color=fff`}
                    alt="User"
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-sm font-bold text-gray-800">{user.name}</span>
                  <span className="text-[10px] text-gray-400 tracking-widest uppercase">{user.role} Account</span>
                </div>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-gray-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => { setActiveItem("My Profile"); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-gray-600 hover:bg-[#2ECC71]/10 hover:text-[#2ECC71] transition-all font-semibold"
                    >
                      <FiUser size={18} />
                      <span>My Profile</span>
                    </button>
                    <hr className="my-2 border-gray-50" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-semibold"
                    >
                      <FiLogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F5F7FB]">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

