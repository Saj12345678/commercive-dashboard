import { useState } from "react";
import Link from "next/link";
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
  Tooltip,
} from "@mui/material";
import { GoArrowUpRight } from "react-icons/go";
import { IoCloseCircleOutline } from "react-icons/io5";
import { LuThumbsUp } from "react-icons/lu";
import { PiCodesandboxLogoFill } from "react-icons/pi";
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
  const [selectedTab, setSelectedTab] = useState("All");

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

  // Filter data based on the selected tab
  const filteredData =
    selectedTab === "All"
      ? data
      : data.filter((item) => item.stockStatus === `${selectedTab} Stock`);

  return (
    <Paper
      elevation={2}
      className="w-full h-full px-4 py-6 sm:px-6 sm:py-8"
      sx={{
        borderRadius: "20px",
        boxShadow:
          "inset 0px 2px 4px 0px rgba(60, 60, 60, 0.11),inset 0px -4px 3px 0px rgba(62, 62, 62, 0.1)",
      }}
    >
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
          Total Inventory
        </Typography>

        <Link href={"/inventory"}>
          <Button
            variant="outlined"
            // color="secondary"
            endIcon={<GoArrowUpRight size={24} />}
            className="!rounded-full"
            sx={{
              borderColor: "#f0edf5",
              borderWidth: 2,
              color: "#9A88BE",
              textTransform: "initial",
            }}
          >
            View All Inventory
          </Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center w-full gap-5 pt-4 pb-8">
        <p className="text-[36px] font-bold ">{filteredData.length}</p>
        <div className="flex w-full flex-wrap gap-2 sm:gap-4">
          {[
            { label: "All", color: "gray" },
            { label: "Enough", color: "green" },
            { label: "Low", color: "orange" },
            { label: "No", color: "red" },
          ].map((tab: any) => (
            <button
              type="button"
              key={tab.label}
              className={`flex items-center gap-2 w-max px-4 py-1 rounded-md text-${
                tab.color
              }-700 bg-${tab.color}-100 ${
                selectedTab === tab.label
                  ? `border-2 border-${tab.color}-700`
                  : ""
              }`}
              onClick={() => setSelectedTab(tab.label)}
            >
              <span>
                {getStatusIcon(
                  tab.label === "All" ? "All" : `${tab.label} Stock`
                )}
              </span>{" "}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <TableContainer
        sx={{ maxHeight: 300, overflowY: "auto" }}
        className="custom-scrollbar shadow"
      >
        <Table>
          <TableHead
            style={{
              backgroundColor: "#f4f4f7",
              fontWeight: "bold",
              color: "black",
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Photo
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Name/SKU
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Stock Meter
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Stock Status
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "black" }}>
                Backorders
              </TableCell>
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
                    <Tooltip title={`Product ${item.name}`} placement="top">
                      <Typography variant="subtitle1" fontWeight="bold" noWrap>
                        {item.name.length > 10
                          ? item.name.slice(0, 7) + "..."
                          : item.name}
                      </Typography>
                    </Tooltip>
                    <Typography variant="body2" color="textSecondary">
                      {item.color}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" width={100} alignItems="center" gap={1}>
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
                        sx={{ height: 10, borderRadius: 10, flex: 1 }}
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
    </Paper>
  );
}
