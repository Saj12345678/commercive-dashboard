"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import LabelBottomNavigation from "@/components/bottom-navigation";
import { Flip, ToastContainer } from "react-toastify";
import Chat from "@/components/chat";
import { Store, UserRow } from "@/app/utils/types";

interface StoreContextProps {
  userinfo?: UserRow;
  updateUserinfo: () => void;
  selectedStore: Store | null;
  setSelectedStore: React.Dispatch<React.SetStateAction<Store | null>>;
  stores: Store[];
  allStores: Store[];
  chatOpen: boolean;
  setChatOpen: (data: boolean) => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: React.FC<{
  initialUserinfo?: UserRow;
  children: React.ReactNode;
}> = ({ initialUserinfo, children }) => {
  const supabase = createClient();
  const pathName = usePathname();

  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userinfo, setUserinfo] = useState(initialUserinfo);

  const updateUserinfo = async () => {
    if (!userinfo) return;
    const { data } = await supabase
      .from("user")
      .select()
      .eq("id", userinfo.id)
      .single();
    setUserinfo(data!);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchStoreData = async () => {
    const { data: storeData, error } = await supabase
      .from("store_to_user")
      .select("*, stores(*)");
    const { data: allStoreData } = await supabase.from("stores").select();
    setAllStores(allStoreData || []);
    if (error) {
      console.error("Error fetching stores:", error.message);
      return;
    }
    if (storeData?.length > 0) {
      setStores(storeData.map((row) => row.stores));
      setSelectedStore(storeData[0].stores);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        userinfo,
        updateUserinfo,
        selectedStore,
        setSelectedStore,
        stores,
        allStores,
        chatOpen,
        setChatOpen,
      }}
    >
      <div className="flex flex-col h-[100dvh] w-full">
        <div className="flex sticky top-0 z-50">
          {!pathName?.includes("/login") &&
            !pathName?.includes("/signUp") &&
            !pathName?.includes("/error") &&
            !pathName?.includes("/admin") && (
              <Header toggleSidebar={toggleSidebar} />
            )}
        </div>
        <div className="flex flex-col h-screen max-h-screen overflow-hidden">
          <div
            className={`flex w-full h-full ${
              pathName?.includes("/admin") && "bg-[#1b1838] p-4"
            }`}
          >
            {!pathName?.includes("/login") &&
              !pathName?.includes("/signUp") &&
              !pathName?.includes("/error") && (
                <Sidebar
                  isOpen={isSidebarOpen}
                  handleToggleSidebar={toggleSidebar}
                />
              )}
            {children}
          </div>
          <div className="flex md:hidden sticky bottom-0 z-50">
            {!pathName?.includes("/login") &&
              !pathName?.includes("/signUp") &&
              !pathName?.includes("/error") && <LabelBottomNavigation />}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" transition={Flip} />

      {!pathName?.includes("/admin") && <Chat />}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }

  return context;
};
