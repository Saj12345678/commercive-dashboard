"use client";
import { Box, Typography, Chip, Paper, Tooltip, Button } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import OrderIcon from "../../components/images/order";
import Image from "next/image";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useStoreContext } from "@/context/StoreContext";
import { createClient } from "@/app/utils/supabase/client";
import FullScreen from "@/components/images/full-screen";

type TransactionItem = {
  id: string;
  tracking_company: string;
  tracking_number: string;
  status: string;
  tracking_url: string;
  created_at: string;
  updated_at: string;
  store_location: string;
};

export default function Shipment() {
  const supabase = createClient();
  const { selectedStore } = useStoreContext();
  const [trackingData, setTrackingData] = useState<TransactionItem[]>([]);
  const storeName = selectedStore ? selectedStore.label : null;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const getStartOfWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  };

  const getEndOfWeek = (startOfWeek: Date) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 9);
    return endOfWeek;
  };
  const [dateRange, setDateRange] = useState([
    {
      startDate: getStartOfWeek(),
      endDate: getEndOfWeek(getStartOfWeek()),
      key: "selection",
    },
  ]);

  const formatDateLabel = (date: Date) =>
    date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" });

  const generateDateLabels = (start: Date, end: Date) => {
    const labels = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      labels.push(formatDateLabel(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return labels;
  };

  const handleSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    const diffInDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays > 9) {
      return;
    }

    setDateRange([ranges.selection]);
    setShowDatePicker(false);
  };

  const formatDateForQuery = (date: Date) => date.toISOString().split("Z")[0];

  const fetchTrackings = async () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate || !storeName) return;

    const formattedStartDate = formatDateForQuery(dateRange[0].startDate);
    const formattedEndDate = formatDateForQuery(dateRange[0].endDate);

    const { data: trackingsData, error: trackingsError } = await supabase
      .from("trackings")
      .select("*")
      .gte("created_at", formattedStartDate)
      .lt("created_at", formattedEndDate)
      .eq("store_name", storeName);

    if (trackingsError) {
      console.error("Error fetching trackings:", trackingsError.message);
    } else {
      console.log("Fetched Trackings:", trackingsData);
      setTrackingData(trackingsData);
    }
  };

  useEffect(() => {
    fetchTrackings();
  }, [dateRange, storeName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateLabels = generateDateLabels(
    dateRange[0].startDate,
    dateRange[0].endDate
  );
  const trackingsByDate: { [key: string]: any[] } = {};
  trackingData.forEach((tracking) => {
    const createdDate = formatDateLabel(new Date(tracking.created_at));
    const updatedDate = formatDateLabel(new Date(tracking.updated_at));

    if (!trackingsByDate[createdDate]) trackingsByDate[createdDate] = [];
    trackingsByDate[createdDate].push({
      ...tracking,
      createdDate,
      updatedDate,
    });
  });

  const truncatedText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };
  return (
    <Paper elevation={3} className="w-full h-full px-4 py-6 sm:px-6 sm:py-8">
      <div className="bg-white">
        <Box className="flex flex-col gap-2 md:gap-2 sm:flex-row justify-between sm:items-center mb-4">
          <Box className="flex gap-2 items-center">
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
              <OrderIcon width={20} height={20} color={"#4f11c9"} />
              Order Statistics
            </Typography>
          </Box>
          <Button
            variant="outlined"
            type="button"
            className="!hidden !px-4 !py-1 !rounded-md !font-semibold gap-2 !capitalize md:!flex"
            onClick={toggleFullScreen}
            sx={{
              border: "3px solid #EBEBEB",
              boxShadow: "none",
              backgroundColor: "transparent",
              color: "#454545",
            }}
          >
            <FullScreen />
            {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </Box>

        <Box
          style={{ position: "relative" }}
          className="w-4/12 border-2 border-[#F4F4F7] rounded-md sm:w-2/12 md:w-3/12 lg:w-1/12"
        >
          {/* Input Field */}
          <input
            type="text"
            value={
              dateRange[0]?.startDate && dateRange[0]?.endDate
                ? `${dateRange[0].startDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })} - ${dateRange[0].endDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}`
                : "Select a date range"
            }
            onFocus={() => setShowDatePicker(true)}
            readOnly
            className="p-2 w-full text-sm cursor-pointer focus-within:outline-none"
          />

          {/* Date Picker */}
          {showDatePicker && (
            <div
              ref={datePickerRef}
              style={{
                position: "absolute",
                zIndex: 1000,
                background: "white",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                top: "100%",
                left: 0,
              }}
            >
              <DateRange
                ranges={dateRange}
                onChange={handleSelect}
                moveRangeOnFirstSelection={false}
                maxDate={new Date()}
              />
            </div>
          )}
        </Box>
        <Box className="flex gap-4 text-center justify-between overflow-auto mt-3 border-b-2 border-[#F4F4F7]">
          {dateLabels.map((day, index) => (
            <Typography
              key={index}
              className="text-sm font-medium text-[#B1B0B2]"
            >
              {day}
            </Typography>
          ))}
        </Box>
        {trackingData.length > 0 ? (
          <Box className="grid grid-cols-6 gap-0 p-3 text-center relative h-[76vh] bg-white bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px)] bg-[size:10%_100%]">
            {/* Shipment Items */}
            {trackingData.map((data, i) => {
              const createdIndex = dateLabels.indexOf(
                formatDateLabel(new Date(data.created_at))
              );
              const updatedIndex = dateLabels.indexOf(
                formatDateLabel(new Date(data.updated_at))
              );
              const colSpan = updatedIndex - createdIndex + 1;
              return (
                <Box
                  key={i}
                  className={`p-3 ${
                    data.status === "PENDING" ? "bg-[#FFECD6]" : "bg-[#E8ECFE]"
                  } rounded-lg flex items-center absolute overflow-x-auto custom-scrollbar whitespace-nowrap`}
                  style={{
                    top: `${i * 60}px`,
                    left: `${(createdIndex / dateLabels.length) * 100}%`,
                    width: `${(colSpan / dateLabels.length) * 100}%`,
                    gap: "2rem",
                  }}
                >
                  <Typography className="text-sm text-gray-800">
                    #{data.tracking_number}
                  </Typography>
                  <Typography className="text-sm text-gray-500">•</Typography>
                  <Box className={"flex w-max gap-2"}>
                    {data.tracking_company === "DHL Express" && (
                      <Image
                        src="/icons/dhl.png"
                        alt="dhl"
                        width={24}
                        height={24}
                        className="w-[24px] h-[24px]"
                      />
                    )}
                    {data.tracking_company === "USPS" && (
                      <Image
                        src="/icons/Layer.png"
                        alt="dhl"
                        width={24}
                        height={22}
                        className="w-[24px] h-[20px]"
                      />
                    )}
                    <Chip
                      label={data.tracking_company}
                      size="small"
                      className="text-sm !bg-transparent text-yellow-600"
                    />
                  </Box>
                  <Typography className="text-sm text-gray-500">•</Typography>
                  <Tooltip title={data.store_location} arrow>
                    <Typography className="text-sm text-gray-500 ml-2 text-nowrap text-ellipsis max-w-[100px]">
                      {truncatedText(data.store_location, 10)}
                    </Typography>
                  </Tooltip>
                  <Typography className="text-sm text-gray-500">•</Typography>
                  <Typography>
                    {(() => {
                      const createdDate = new Date(data.created_at);
                      const updatedDate = new Date(data.updated_at);
                      const currentDate = new Date();

                      createdDate.setHours(0, 0, 0, 0);
                      updatedDate.setHours(0, 0, 0, 0);
                      currentDate.setHours(0, 0, 0, 0);

                      let daysGap = 0;

                      if (data.status === "FAILURE") {
                        daysGap = 0;
                      } else if (data.status === "SUCCESS") {
                        daysGap = Math.floor(
                          (updatedDate.getTime() - createdDate.getTime()) /
                            (1000 * 3600 * 24)
                        );
                      } else {
                        daysGap = Math.floor(
                          (currentDate.getTime() - createdDate.getTime()) /
                            (1000 * 3600 * 24)
                        );
                      }

                      daysGap = Math.max(0, daysGap);

                      return `${daysGap} days`;
                    })()}
                  </Typography>
                  <Typography className="text-sm text-gray-500">•</Typography>
                  <Typography
                    className={`text-sm ml-2 ${
                      data.status === "SUCCESS"
                        ? "text-green-600"
                        : data.status === "PENDING" || data.status === "OPEN"
                        ? "text-yellow-600"
                        : data.status === "CANCELLED" ||
                          data.status === "ERROR" ||
                          data.status === "FAILURE"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {data.status === "SUCCESS"
                      ? "On-Time"
                      : data.status === "PENDING" || data.status === "OPEN"
                      ? "Pending"
                      : data.status === "CANCELLED"
                      ? "Cancelled"
                      : data.status === "ERROR"
                      ? "Error"
                      : data.status === "FAILURE"
                      ? "Failed"
                      : "Unknown"}
                    `;
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box className="flex items-center justify-center h-80 bg-white text-gray-500">
            No Data Available
          </Box>
        )}
      </div>
    </Paper>
  );
}
