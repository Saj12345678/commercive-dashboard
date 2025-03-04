"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";

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
  const [storeData, setStoreData] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

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
      {children}
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
