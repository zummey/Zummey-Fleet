import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.png";

import {
  ChevronLeft,
  LayoutDashboard,
  Truck,
  Users,
  ClipboardList,
  CreditCard,
  Bell,
  Settings,
  HelpCircle,
  Search,
  ChevronRight,
} from "lucide-react";

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      path: "/fleet-management",
      icon: Truck,
      label: "Fleet Management",
    },
    {
      path: "/riders-management",
      icon: Users,
      label: "Riders Management",
    },
    {
      path: "/order-management",
      icon: ClipboardList,
      label: "Order Management",
      hasSubmenu: true,
    },
    {
      path: "/finance-reports",
      icon: CreditCard,
      label: "Finance & Reports",
    },
  ];

  const bottomNavItems = [
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/settings", icon: Settings, label: "Settings", hasSubmenu: true },
    { path: "/help", icon: HelpCircle, label: "Help & Support" },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-poppins">

      <aside
        className={`
          ${sidebarCollapsed ? "w-20" : "w-64"} 
          bg-white border-r border-gray-200 
          flex flex-col transition-all duration-300 ease-in-out
          relative z-50
        `}
      >

        <div
          className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-gray-100 min-h-[72px]`}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            {!sidebarCollapsed && (
              <img
                src={Logo}
                alt="Zummey Logo"
                className="w-8 h-8 object-contain"
              />
            )}

            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-[#343C6A] whitespace-nowrap">
                Zummey
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center transition-colors flex-shrink-0"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <ChevronLeft
              size={18}
              className={`text-gray-600 transition-transform duration-300 ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-3 rounded-lg
                      transition-all duration-200 text-sm font-medium
                      ${
                        active
                          ? "bg-[#FFF4E8] text-[#EB4827]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                        {item.hasSubmenu && (
                          <ChevronRight
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav className="px-3 py-4 border-t border-gray-100">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3.5 py-3 rounded-lg
                      transition-all duration-200 text-sm font-medium
                      ${
                        active
                          ? "bg-purple-50 text-purple-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">
                          {item.label}
                        </span>
                        {item.hasSubmenu && (
                          <ChevronRight
                            size={16}
                            className="text-gray-400 flex-shrink-0"
                          />
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Hello Nonso!
              </h1>
            </div>


            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search for anything"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[20px] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFF4E8] focus:bg-white transition-all"
                  />
                </div>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <Settings size={20} className="text-gray-600" />
              </button>

              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-purple-500 transition-colors">
                <img
                  src="https://ui-avatars.com/api/?name=Nonso&background=FFF4E8&color=000"
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
