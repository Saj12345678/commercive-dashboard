import { Box, Typography, Chip, Paper, Button } from "@mui/material";
import React from "react";
import { GoArrowUpRight } from "react-icons/go";
import OrderIcon from "./images/order";
import Image from "next/image";

const dummyData = [
  {
    day: "SUN 19",
    items: [
      {
        id: "#40539",
        carrier: "DHL Express",
        days: 4,
        status: "On-Time",
        statusColor: "text-green-500",
      },
    ],
  },
  {
    day: "MON 20",
    items: [
      {
        id: "#40539",
        carrier: "USPS",
        days: 3,
        status: "In Transit",
        statusColor: "text-orange-500",
      },
    ],
  },
  {
    day: "TUE 21",
    items: [
      {
        id: "#40539",
        carrier: "DHL Express",
        days: 8,
        status: "On-Time",
        statusColor: "text-green-500",
      },
    ],
  },
];

export default function Summary() {
  return (
    <Paper elevation={3} style={{ padding: "16px", width: "100%" }}>
      <div className="bg-white">
        <Box className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
          <Box className="flex gap-2 items-center">
          <OrderIcon width={20} height={20} color={"#4f11c9"} />
          <Typography variant="h6" className="text-gray-700 font-semibold">
            Order Statistics
          </Typography>
          </Box>
          <Button
          variant="outlined"
          color="secondary"
          endIcon={<GoArrowUpRight size={24} />}
          className="!rounded-full"
        >
          View all Inventory
        </Button>
        </Box>
        <Box className="grid grid-cols-5 gap-4 text-center  ">
          {["SUN 19", "MON 20", "TUE 21", "WED 22", "THU 23"].map(
            (day, index) => (
              <Typography
                key={index}
                className={`text-sm font-medium ${
                  dummyData.some((d) => d.day === day)
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {day}
              </Typography>
            )
          )}
        </Box>
        <Box className="mt-4 space-y-4">
          {dummyData.map((data, index) => (
            <Box key={index} className="flex gap-2 items-start">
              <Box className="w-[100%] space-y-2">
                {data.items.map((item, idx) => (
                  <Box
                    key={idx}
                    className={`p-3 ${item.status === 'In Transit' ? 'bg-[#FFECD6]' : 'bg-[#E8ECFE]'} rounded-lg flex justify-between items-center`}
                  >
                    <Typography className="text-sm text-gray-800">
                      {item.id}
                    </Typography>
                    <Box className={"flex w-max gap-2"}>
                    {item.carrier === 'DHL Express' && <Image
                                                   src="/icons/dhl.png"
                                                   alt="dhl"
                                                   width={24}
                                                   height={24}
                                                   className="w-[24px] h-[24px]"
                                                 /> }
                                                  {item.carrier === 'USPS' && <Image
                                                   src="/icons/Layer.png"
                                                   alt="dhl"
                                                   width={24}
                                                   height={22}
                                                   className="w-[24px] h-[20px]"
                                                 /> }
                    <Chip
                      label={item.carrier}
                      size="small"
                      className="text-sm !bg-transparent text-yellow-600"
                    />
                    </Box>
                    <Typography className="text-sm text-gray-500">
                      {item.days} days
                    </Typography>
                    <Typography className={`text-sm ${item.statusColor}`}>
                      {item.status}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </div>
    </Paper>
  );
}
