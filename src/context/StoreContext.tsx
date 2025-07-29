"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import LabelBottomNavigation from "@/components/bottom-navigation";
import { Flip, ToastContainer } from "react-toastify";
import Chat from "@/components/chat";

interface Store {
  label: string;
  value: string;
}

interface StoreContextProps {
  selectedStore: Store | null;
  setSelectedStore: React.Dispatch<React.SetStateAction<Store | null>>;
  storeData: Store[];
  chatOpen: boolean;
  setChatOpen: (data: boolean) => void;
}

const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const supabase = createClient();
  const pathName = usePathname();

  const [storeData, setStoreData] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchStoreData = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_store_listed", true);

    if (error) {
      console.error("Error fetching stores:", error.message);
      return;
    }

    const formattedData = data.map((store: any) => ({
      label: store.store_name,
      value: store.id,
    }));

    setStoreData(formattedData);
    setSelectedStore(formattedData[0]);
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        storeData,
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

      {!pathName?.includes("/admin") && (
        <Chat user={user} setUser={setUser} setUserEmail={setUserEmail} />
      )}
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
