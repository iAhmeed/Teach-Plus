"use client"
import Sidebar from "@/components/Sidebar";
import useStore from "@/store/useStore";
import { useEffect } from "react";
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'; 

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const { getAdmin, getTeachers, getRanksList , isLoading, getPeriods, getHolidays } = useStore();

  const setAdmin = async () => {
    await getAdmin();
    await getRanksList();
    await getPeriods();
    await getHolidays();
    await getTeachers();

    
  };

  useEffect(() => {
    setAdmin();
  }, [pathname]); 

  return (
    <div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="flex h-screen relative">
          <div className="max-w-1/5">
            <Sidebar />
          </div>
          <div className="flex-1 overflow-y-auto p-1 w-4/5">
            {children}
          </div>
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-transparent cursor-wait" style={{ pointerEvents: "all" }}>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}