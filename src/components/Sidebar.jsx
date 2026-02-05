"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { LayoutDashboard, User, Table, Clock, FileText, Settings } from "lucide-react";
import useStore from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Teachers", icon: User, path: "/admin/teachers" },
  { name: "Timetables", icon: Table, path: "/admin/timetable" },
  { name: "Extra Hours", icon: Clock, path: "/admin/extrahours" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth < 768;
      setIsSmallScreen(isSmall);
      if (isSmall) setIsOpen(false);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const sidebarVariants = {
    open: { width: "16rem" },
    closed: { width: "4rem" }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  const iconVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 }
  };

  return (
    <motion.div
      className="h-screen bg-gray-50 relative"
      initial={false}
      animate={isOpen ? "open" : "closed"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => !isSmallScreen && setIsHovering(true)}
      onMouseLeave={() => !isSmallScreen && setIsHovering(false)}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <AnimatePresence>
          {isOpen && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-blue-950 font-extrabold text-xl whitespace-nowrap"
            >
              TEACH<span className="text-blue-950 font-light">PLUS</span>
            </motion.h1>
          )}
        </AnimatePresence>

        {!isSmallScreen && (
          <motion.button
            className="hover:cursor-pointer p-1 rounded-full hover:bg-gray-200"
            onClick={() => setIsOpen(!isOpen)}
            variants={iconVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </motion.button>
        )}
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <motion.div
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`flex items-center p-3 cursor-pointer ${isActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200"
                }`}
              whileHover={{ scale: isOpen ? 1.02 : 1 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className={isActive ? "text-blue-600" : "text-gray-600"} />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute right-0 w-1 h-8 bg-blue-600 rounded-l-full"
                  layoutId="activeIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        onClick={handleLogout}
        className="absolute bottom-4 flex items-center p-3 cursor-pointer hover:bg-gray-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FiLogOut className="text-red-500" />
        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 text-red-500 whitespace-nowrap"
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>



    </motion.div>
  );
};

export default Sidebar;