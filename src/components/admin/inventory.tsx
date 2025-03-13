"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { Autocomplete, TextField } from "@mui/material";
import CustomTable from "../ui/custom-table";
import CustomButton from "../ui/custom-button";

export default function Inventory() {
  const supabase = createClient();
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [storeFilter, setStoreFilter] = useState("");
  const [uniqueStores, setUniqueStores] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data to extract unique stores
      const { data: allData, error: storeError }: any = await supabase
        .from("inventory")
        .select("*");

      if (storeError) {
        console.error("Error fetching inventory data:", storeError);
      } else {
        setInventoryData(allData || []);
        const stores: any = [...new Set(allData.map((item: any) => item.store_name).filter(Boolean))];
        setUniqueStores(stores);
        applyFilter(allData, storeFilter, 1);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (data: any[], filter: string, currentPage: number) => {
    let filtered = filter ? data.filter((item) => item.store_name === filter) : data;
    setFilteredData(filtered);
    setTotalRecords(filtered.length);
    setPage(currentPage);
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    applyFilter(inventoryData, storeFilter, 1);
  }, [storeFilter]);

  const handleNext = () => {
    if (page < Math.ceil(totalRecords / limit)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const tableConfig = {
    notFoundData: "No Data found",
    columns: [
      { field: "sku", headerName: "SKU", customRender: (row: any) => <span>{row?.sku}</span> },
      { field: "product_id", headerName: "Product ID", customRender: (row: any) => <span>{row?.product_id}</span> },
      { field: "store_name", headerName: "Store Name", customRender: (row: any) => <span>{`${row?.store_name === 'satish-dev' ? 'Golf Pro' : row?.store_name}`}</span> },
      { field: "inventory_level[0].node.quantities[0].quantity", headerName: "Available", customRender: (row: any) => <span>{row?.inventory_level?.[0]?.node?.quantities?.[0]?.quantity}</span> },
      { field: "inventory_level[0].node.quantities[1].quantity", headerName: "Committed", customRender: (row: any) => <span>{row?.inventory_level?.[0]?.node?.quantities?.[1]?.quantity}</span> },
      { field: "inventory_level[0].node.quantities[2].quantity", headerName: "Incoming", customRender: (row: any) => <span>{row?.inventory_level?.[0]?.node?.quantities?.[2]?.quantity}</span> },
      { field: "inventory_level[0].node.quantities[3].quantity", headerName: "On Hand", customRender: (row: any) => <span>{row?.inventory_level?.[0]?.node?.quantities?.[3]?.quantity}</span> },
      { field: "inventory_level[0].node.quantities[4].quantity", headerName: "Reserved", customRender: (row: any) => <span>{row?.inventory_level?.[0]?.node?.quantities?.[4]?.quantity}</span> },
    ],
    rows: paginatedData || [],
  };

  return (
    <div className="flex flex-col w-full gap-5 p-4">
      <h1 className="text-2xl font-bold text-white">Inventory</h1>
      <div className="flex flex-col sm:flex-row w-full justify-between">
        <Autocomplete
          options={uniqueStores}
          // getOptionLabel={(option) => option || ""}
          getOptionLabel={(option) =>
            option === "satish-dev" ? "Golf Pro" : option
          }
          value={storeFilter}
          onChange={(event, newValue) => setStoreFilter(newValue || "")}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filter by Store"
              variant="outlined"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "#403a6b" },
                  "&:hover fieldset": { borderColor: "#403a6b" },
                  "&.Mui-focused fieldset": { borderColor: "#403a6b" },
                },
                "& .MuiInputLabel-root": { color: "white" },
                "& .MuiInputLabel-root.Mui-focused": { color: "white" },
              }}
            />
          )}
          clearOnEscape
          className="w-full md:w-1/2"
        />
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-[#5e568f]">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, totalRecords)} of {totalRecords}
          </p>
          <div className="flex items-center gap-3">
            <CustomButton label="Previous" className="bg-[#342d5f] text-[#5e568f]" callback={handlePrevious} disabled={page === 1} />
            <CustomButton label="Next" className="bg-[#342d5f] text-[#5e568f]" callback={handleNext} disabled={page >= Math.ceil(totalRecords / limit)} />
          </div>
        </div>
      </div>
      <CustomTable tableConfig={tableConfig} isLoading={isLoading} limit={limit} />
    </div>
  );
}
