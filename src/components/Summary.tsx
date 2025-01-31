import {
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import React from "react";
import { GoArrowUpRight } from "react-icons/go";
import OrderIcon from "./images/order";
import Image from "next/image";

type TransactionItem = {
  id: string;
  tracking_company: string;
  tracking_number: string;
  status: string;
  shipment_status: string;
  tracking_url: string;
  created_at: string;
  updated_at: string;
  store_location: string;
  due_date: string;
};

type TransactionProps = {
  data: TransactionItem[];
};

export default function Summary({ data }: TransactionProps) {
  console.log(data);
  const shipmentDates = data.map((shipment) => new Date(shipment.created_at));

  const minDate = new Date(
    Math.min(...shipmentDates.map((date) => date.getTime()))
  );
  minDate.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setHours(0, 0, 0, 0);

  data.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateA.getTime() - dateB.getTime();
  });

  minDate.setDate(maxDate.getDate() - 4);

  const createdAt = new Date(data[0]?.created_at);
  createdAt.setHours(0, 0, 0, 0);
  const today = new Date();
  const daysAgo = Math.round(
    (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Paper elevation={3} className="w-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="bg-white">
        <Box className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <Box className="flex gap-2 items-center">
            <OrderIcon width={20} height={20} color={"#4f11c9"} />
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
              Order Statistics
            </Typography>
          </Box>
          <Button
            variant="outlined"
            // color="secondary"
            endIcon={<GoArrowUpRight size={24} />}
            className="!rounded-full"
            sx={{ borderColor: "#f0edf5", borderWidth: 2, color: "#9A88BE" }}
          >
            View all Summary
          </Button>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          className="mt-4 custom-scrollbar overflow-auto"
          style={{
            maxHeight: data.length > 3 ? "370px" : "auto",
          }}
        >
          <Table>
            <TableHead sx={{ textAlign: "center" }}>
              <TableRow>
                <TableCell>Shippment Date</TableCell>
                <TableCell>Tracking Number</TableCell>
                <TableCell>Tracking Company</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Store Location</TableCell>
                <TableCell>Shipment Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((transaction) => {
                  const companyLogo =
                    transaction.tracking_company === "DHL Express" ? (
                      <Image
                        src="/icons/dhl.png"
                        alt="dhl"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px]"
                      />
                    ) : transaction.tracking_company === "USPS" ? (
                      <Image
                        src="/icons/Layer.png"
                        alt="usps"
                        width={24}
                        height={22}
                        className="w-[24px] h-[20px]"
                      />
                    ) : null;
                  const truncatedLocation =
                    transaction.store_location?.length > 10
                      ? `${transaction.store_location.slice(0, 10)}...`
                      : transaction.store_location;

                  return (
                    <TableRow
                      key={transaction.id}
                      className={`${
                        transaction.shipment_status === "In Transit"
                          ? "bg-[#FFECD6]"
                          : "bg-[#E8ECFE]"
                      } p-3`}
                    >
                      <TableCell>
                        {(() => {
                          const currentDate = new Date(transaction.created_at);
                          const dayName = currentDate
                            .toLocaleDateString("en-US", { weekday: "short" })
                            .toUpperCase();
                          const dayNumber = currentDate.getDate();
                          return `${dayName} ${dayNumber}`;
                        })()}
                      </TableCell>

                      <TableCell>#{transaction.tracking_number}</TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          {companyLogo}
                          <Chip
                            label={transaction.tracking_company}
                            size="small"
                            className="text-sm !bg-transparent text-yellow-600"
                          />
                        </Box>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        {(() => {
                          // Parse the created_at and updated_at strings into Date objects
                          const createdDate = new Date(transaction.created_at);
                          const updatedDate = new Date(transaction.updated_at);

                          // Normalize the dates to midnight to ignore the time portion
                          createdDate.setHours(0, 0, 0, 0);
                          updatedDate.setHours(0, 0, 0, 0);

                          // Calculate the time difference in milliseconds
                          const timeDiff =
                            updatedDate.getTime() - createdDate.getTime();

                          // Convert milliseconds to days and ensure it never goes below 0
                          const daysGap =
                            timeDiff === 0
                              ? 0
                              : Math.floor(timeDiff / (1000 * 3600 * 24));

                          return `${daysGap} days`; // Return the days gap
                        })()}
                      </TableCell>

                      <TableCell>
                        {" "}
                        <Tooltip title={transaction.store_location} arrow>
                          <Typography className="text-nowrap">
                            {truncatedLocation}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          color:
                            transaction.status === "success"
                              ? "green"
                              : transaction.status === "false" &&
                                transaction.shipment_status === "Overdue"
                              ? "red"
                              : transaction.shipment_status === "In Transit"
                              ? "orange"
                              : "red", // Default color
                        }}
                      >
                        {transaction.status === "success"
                          ? "On-Time"
                          : transaction.status === "false" &&
                            transaction.shipment_status === "Overdue"
                          ? transaction.shipment_status
                          : transaction.shipment_status}
                      </TableCell>
                    </TableRow>
                  );
                })
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
      </div>
    </Paper>
  );
}
