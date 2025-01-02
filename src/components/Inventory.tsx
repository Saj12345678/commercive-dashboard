import { useState } from "react";
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
  IconButton,
  Box,
} from "@mui/material";
import { GoArrowUpRight } from "react-icons/go";
import { IoCloseCircleOutline } from "react-icons/io5";
import { LuThumbsUp } from "react-icons/lu";
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import TotalInventory from "./images/total-inventory";

type InventoryItem = {
  image: string;
  color: string;
  name: string;
  stockMeter: number;
  stockStatus: string;
  backorders: number;
};

type InventoryProps = {
  data: InventoryItem[];
};

export default function Inventory({ data }: InventoryProps) {
  const [selectedTab, setSelectedTab] = useState("All Stock");

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
        return <IoCloseCircleOutline size={20} />;
    }
  };

  // Filter data based on the selected tab
  const filteredData =
    selectedTab === "All Stock"
      ? data
      : data.filter((item) => item.stockStatus === selectedTab);

  return (
    <Paper elevation={3} style={{ padding: "16px" , width: "100%"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          className="flex items-center gap-3"
        >
          <TotalInventory width={24} height={24} color={"#4F11C9"} />
          Total Inventory
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          endIcon={<GoArrowUpRight size={24} />}
          className="!rounded-full"
        >
          View all Inventory
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center w-full gap-5 pt-4 pb-8">
        <p className="text-[36px] font-bold ">247</p>
        <div className="flex w-full flex-wrap gap-2 sm:gap-4">
          {[
            { label: "All Stock", color: "gray" },
            { label: "Enough Stock", color: "green" },
            { label: "Low Stock", color: "orange" },
            { label: "No Stock", color: "red" },
          ].map((tab: any) => (
            <button
              type="button"
              key={tab.label}
              className={`flex items-center gap-2 w-max px-3 h-10 rounded-md text-${
                tab.color
              }-700 bg-${tab.color}-100 ${
                selectedTab === tab.label
                  ? `border border-${tab.color}-700`
                  : ""
              }`}
              onClick={() => setSelectedTab(tab.label)}
            >
              <span>{getStatusIcon(tab.label)}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ backgroundColor: "#f4f4f7" }}>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Name/SKU</TableCell>
              <TableCell>Stock Meter</TableCell>
              <TableCell>Stock Status</TableCell>
              <TableCell>Backorders</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div
                      style={{
                        backgroundColor: "#f4f4f7",
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                      }}
                    >
                      {item.image}
                    </div>
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
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{ minWidth: "50px" }}
                      >
                        {item.stockMeter}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          100,
                          Math.max(0, (item.stockMeter / 1000) * 100)
                        )} 
                        color={getColorPalette(item.stockStatus)}
                        sx={{ height: 10, borderRadius: 10, flex: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <p
                      className={`flex items-center gap-2 w-max p-2 rounded-md ${getStockStatusClass(
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
    </Paper>
  );
}
