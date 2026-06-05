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
  FiLogOut,
  FiX
} from "react-icons/fi";

import { LuLayoutDashboard } from "react-icons/lu";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";
import { supabase } from "./SupabaseClient";
import { FiCheckSquare } from "react-icons/fi";

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
import ToDo from "./page/ToDo";

import logo1 from "./assets/logo/logo.png";
import logo2 from "./assets/logo/logo2.jpeg";


const allSidebarItems = [
  { icon: <FiFileText />, label: "Billing", roles: ["admin", "staff"] },
  { icon: <FiCheckSquare />, label: "To Do", roles: ["admin", "staff"] },
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem('invox_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'staff') {
          setActiveItem("Billing");
        }
        return;
      }

      // If not in localStorage, check if Supabase has an active session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userData && !error) {
          localStorage.setItem('invox_user', JSON.stringify(userData));
          setUser(userData);
          if (userData.role === 'staff') {
            setActiveItem("Billing");
          }
        } else {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    loadUser();
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
      case "To Do": return ToDo;
      default: return DashboardContent;
    }
  }, [activeItem]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F5F7FB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (activeItem === "Billing") {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F7FB] overflow-y-auto">
        <div className="max-w-[1600px] w-full mx-auto md:p-10 p-4 relative md:mt-8 mt-2">
          <button
            onClick={() => setActiveItem("Dashboard")}
            className="absolute md:-top-4 md:right-10 top-0 right-4 p-3 bg-white rounded-full shadow-lg text-gray-500 hover:text-red-500 hover:scale-110 transition-all z-50 cursor-pointer"
          >
            <FiX size={24} />
          </button>
          <Billing setActiveItem={setActiveItem} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7FB] font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gray-50 flex flex-col shrink-0 transition-all duration-300 ease-in-out absolute md:relative z-[70] h-full print:hidden ${isSidebarOpen ? "translate-x-0 w-64 md:w-46" : "-translate-x-full md:translate-x-0 md:w-20"
          }`}
      >
        {/* Toggle Button centered on border (Desktop Only) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute -right-2.5 top-10 w-6 h-6 bg-white rounded-full border border-gray-200 shadow-lg items-center justify-center z-[60] cursor-pointer hover:bg-gray-50 transition-all hover:scale-110 active:scale-95"
        >
          <FiChevronLeft
            size={14}
            className={`text-gray-600 transition-transform duration-300 ${isSidebarOpen ? "" : "rotate-180"}`}
          />
        </button>

        <div className={`p-3 flex items-center h-20 justify-center`}>
          {isSidebarOpen ? (
            <img
              src={logo1}
              alt="Invox"
              className="w-35 bg-white  rounded-xl h-auto max-h-13 object-contain transition-transform hover:scale-105 duration-300"
            />
          ) : (
            <img
              src={logo1}
              alt="Invox"
              className="w-15 bg-white p-1 rounded-lg h-6 object-contain"
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
                ? "bg-[#5e5e5e] text-white shadow-lg "
                : "text-gray-500 hover:text-gray-200 hover:bg-[#252525]"
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

        {/* Profile Section at Bottom of Sidebar */}
        <div className="mt-auto p-3 border-t border-[#2a2a2a]">
          <div
            onClick={() => setActiveItem("My Profile")}
            className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center'} py-2 rounded-xl hover:bg-green-500/20 transition-all cursor-pointer group`}
            title="My Profile"
          >
            <div className="relative shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${user.name}&background=2ECC71&color=fff`}
                alt="User"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1c1c1c]" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-gray-500 group-hover:text-green-500 transition-colors truncate">{user.name}</span>
                
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 bg-white border-b border-gray-50 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50 print:hidden">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
              {activeItem}
            </h1>
          </div>

          <div></div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F5F7FB]">
          <div className="max-w-[1600px] w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageComponent />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

