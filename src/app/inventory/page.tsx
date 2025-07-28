"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  LinearProgress,
  Box,
} from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import { LuThumbsUp } from "react-icons/lu";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import TotalInventory from "../../components/images/total-inventory";
import { useStoreContext } from "@/context/StoreContext";
import { PiCodesandboxLogoFill } from "react-icons/pi";
import { createClient } from "../utils/supabase/client";
import Image from "next/image";

type InventoryItem = {
  image: string | null;
  color: string;
  name: string;
  stockMeter: any;
  stockStatus: string;
  backorders: number;
};

export default function Inventory() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("All");
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const { selectedStore } = useStoreContext();
  const storeName = selectedStore ? selectedStore.label : null;

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20); // Default 20 items per page

  const fetchInventoryData = async () => {
    if (!storeName) {
      return;
    }

    setLoading(true);
    try {
      const { data: fetchedData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("store_name", storeName);

      if (inventoryError) {
        console.error("Error fetching inventory data:", inventoryError);
        setLoading(false);
      } else {
        const transformedData = fetchedData.map((item) => {
          const inventory_level = item.inventory_level as any;
          const inventoryQuantities =
            inventory_level?.[0]?.node?.quantities || [];
          const available =
            inventoryQuantities.find((q: any) => q.name === "available")
              ?.quantity || 0;
          const committed =
            inventoryQuantities.find((q: any) => q.name === "committed")
              ?.quantity || 0;

          const backOrders = item.back_orders || 0;

          let stockStatus = "Enough Stock";
          if (available === 0) stockStatus = "No Stock";
          else if (available < 50) stockStatus = "Low Stock";

          return {
            image: item?.product_image,
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            name: `Product ${item.sku}`,
            stockMeter: available + committed,
            stockStatus,
            backorders: backOrders,
          };
        });

        setInventoryData(transformedData);
      }
    } catch (error) {
      console.error("Error in fetchOrders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = () => {
    fetchInventoryData();
  };

  useEffect(() => {
    handleFetchData();
  }, [selectedStore]);

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case "Enough Stock":
        return "bg-green-100 text-green-700";
      case "No Stock":
        return "bg-red-100 text-red-700";
      case "Low Stock":
        return "bg-orange-100 text-orange-700";
      default:
        return "";
    }
  };

  const getColorPalette = (
    status: string
  ): "success" | "error" | "warning" | "info" | "primary" => {
    switch (status) {
      case "Enough Stock":
        return "success";
      case "No Stock":
        return "error";
      case "Low Stock":
        return "warning";
      default:
        return "primary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Enough Stock":
        return <LuThumbsUp size={20} />;
      case "No Stock":
        return <IoCloseCircleOutline size={20} />;
      case "Low Stock":
        return <MdKeyboardDoubleArrowDown size={20} />;
      default:
        return <PiCodesandboxLogoFill size={20} />;
    }
  };

  const filteredData =
    selectedTab === "All"
      ? inventoryData
      : inventoryData.filter((item) => item.stockStatus === selectedTab);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <main
      // style={{ height: "calc(100vh - 70px)" }}
      className="flex flex-col h-full max-h-full w-full gap-3 border-l-none md:border-l-2 border-t-2 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FCFCFC] p-4 md:p-8 overflow-auto custom-scrollbar"
    >
      {/* {loading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="loader"></div>
                </div>
            )} */}
      <div className="w-full flex flex-col gap-2 sm:flex-row justify-start sm:justify-between">
        <Typography
          variant="h5"
          fontWeight="bold"
          className="flex items-center gap-3"
          sx={{
            fontSize: {
              xs: "1rem",
              sm: "1.2rem",
              md: "1.5rem",
            },
          }}
        >
          <TotalInventory width={24} height={24} color={"#4F11C9"} />
          Inventory Summary
        </Typography>
        {/* Category Tabs */}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center w-full gap-5 py-2">
        <p className="text-[36px] font-bold ">{filteredData.length}</p>
        <div className="flex w-full flex-wrap gap-2 sm:gap-4">
          {[
            { label: "All", color: "gray" },
            { label: "Enough Stock", color: "green" },
            { label: "Low Stock", color: "orange" },
            { label: "No Stock", color: "red" },
          ].map((tab: any) => (
            <button
              type="button"
              key={tab.label}
              className={`flex items-center gap-2 w-max px-3 py-0.5 rounded-md text-${
                tab.color
              }-700 bg-${tab.color}-100 ${
                selectedTab === tab.label
                  ? `border-2 border-${tab.color}-700 opacity-100`
                  : "opacity-50"
              }`}
              onClick={() => setSelectedTab(tab.label)}
            >
              <span>{getStatusIcon(tab.label)}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "100%", overflowY: "auto" }}
        className="custom-scrollbar"
      >
        <Table>
          <TableHead
            style={{
              backgroundColor: "#f4f4f7",
              fontWeight: "bold",
              color: "black",
              padding: "4px",
            }}
          >
            <TableRow
              style={{
                backgroundColor: "#f4f4f7",
                padding: "4px",
              }}
            >
              <TableCell
                sx={{ fontWeight: "bold", color: "black", width: "50px" }}
              >
                Photo
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", width: "300px" }}
              >
                Name/SKU
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Stock Meter
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", width: "200px" }}
              >
                Stock Status
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "black", width: "100px" }}
              >
                Backorders
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={`product-image-${index}`}
                        width="36"
                        height="36"
                        className="bg-[#f4f4f7] w-[36px] h-[36px] border rounded-md"
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: "#f4f4f7",
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                        }}
                      >
                        {item.image}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.color}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" width={200} alignItems="center" gap={1}>
                      <Typography variant="body2" align="center">
                        {item.stockMeter}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          100,
                          Math.max(0, (item.stockMeter / 1000) * 100)
                        )}
                        color={getColorPalette(item.stockStatus)}
                        sx={{
                          height: 10,
                          borderRadius: 10,
                          flex: 1,
                          bgcolor: "#f4f4f7",
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <p
                      className={`flex items-center gap-2 w-max py-2 px-4 rounded-md ${getStockStatusClass(
                        item.stockStatus
                      )}`}
                    >
                      <span>{getStatusIcon(item.stockStatus)}</span>{" "}
                      {item.stockStatus}
                    </p>
                  </TableCell>
                  <TableCell>{item.backorders}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} style={{ textAlign: "center" }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination UI */}
      <div className="flex justify-between items-center mt-4">
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="border-2 rounded p-1"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>

        <div className="flex gap-2 items-center">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
          >
            First
          </Button>
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          >
            Last
          </Button>
        </div>
      </div>
    </main>
  );
}
