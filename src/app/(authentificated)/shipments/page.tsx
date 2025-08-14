"use client";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  Button,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DateRangePicker, Range } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useStoreContext } from "@/context/StoreContext";
import { createClient } from "@/app/utils/supabase/client";
import FullScreen from "@/components/images/full-screen";
import { CiCalendar } from "react-icons/ci";
import OrderIcon from "@/components/images/order";
import { Database } from "@/app/utils/supabase/database.types";

export default function Shipment() {
  const supabase = createClient();
  const { selectedStore } = useStoreContext();
  const [trackingData, setTrackingData] = useState<
    Database["public"]["Tables"]["trackings"]["Row"][]
  >([]);
  const storeUrl = selectedStore ? selectedStore.store_url : null;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const dateLabelsRef = useRef<HTMLDivElement>(null);
  const shipmentItemsRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = () => {
    if (dateLabelsRef.current) {
      const newScrollLeft = dateLabelsRef.current.scrollLeft;
      setScrollLeft(newScrollLeft);
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -9 : 1);
    return new Date(now.setDate(diff));
  };

  const getEndOfWeek = (startOfWeek: Date) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 9);
    return endOfWeek;
  };

  const [tmpCurrentDateRange, setTmpCurrentDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [dateRange, setDateRange] = useState([
    {
      startDate: getStartOfWeek(),
      endDate: getEndOfWeek(getStartOfWeek()),
      key: "selection",
    },
  ]);

  const formatDateLabel = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "2-digit",
      timeZone: "UTC",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const generateDateLabels = (
    start: string | number | Date,
    end: string | number | Date,
    trackingData: any[]
  ) => {
    const labels = [];
    let currentDate = new Date(start);
    const maxUpdatedDate = trackingData.reduce(
      (maxDate: Date, item: { updated_at: string | number | Date }) => {
        const updatedDate = new Date(item.updated_at);
        return updatedDate.getTime() > maxDate.getTime()
          ? updatedDate
          : maxDate;
      },
      new Date(end)
    );

    const finalEndDate = maxUpdatedDate > end ? maxUpdatedDate : end;

    while (currentDate <= end) {
      const day = currentDate.getDate().toString().padStart(2, "0");
      const weekday = currentDate.toLocaleDateString("en-US", {
        weekday: "short",
      });
      labels.push(`${day} ${weekday}`);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return labels;
  };

  const handleTmpSelect = (ranges: any) => {
    const { startDate, endDate } = ranges.selection;
    const diffInDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // if (diffInDays > 9) {
    //   return;
    // }

    setTmpCurrentDateRange([ranges.selection]);
  };

  const handleApplyTmpDateRange = () => {
    setDateRange(tmpCurrentDateRange);
    setShowDatePicker(false);
  };

  const formatDateForQuery = (date: Date) => date.toISOString().split("Z")[0];

  const fetchTrackings = async () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate || !storeUrl) return;

    const formattedStartDate = formatDateForQuery(dateRange[0].startDate);
    const formattedEndDate = formatDateForQuery(dateRange[0].endDate);

    const { data: trackingsData, error: trackingsError } = await supabase
      .from("trackings")
      .select("*")
      .gte("created_at", formattedStartDate)
      .lt("created_at", formattedEndDate)
      .eq("store_url", storeUrl);
    console.log("trackingsData :>> ", trackingsData);
    if (trackingsError) {
      console.error("Error fetching trackings:", trackingsError.message);
    } else {
      setTrackingData(trackingsData);
    }
  };

  useEffect(() => {
    fetchTrackings();
  }, [dateRange, storeUrl]);

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

  useEffect(() => {
    if (dateLabelsRef.current) {
      dateLabelsRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (dateLabelsRef.current) {
        dateLabelsRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const dateLabels = generateDateLabels(
    dateRange[0].startDate,
    dateRange[0].endDate,
    trackingData
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

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  const calculateDaysGap = (data: {
    created_at: string;
    updated_at: string;
    status: string;
  }) => {
    const createdDateStr = data.created_at.split("T")[0];
    const updatedDateStr = data.updated_at.split("T")[0];

    const createdDate = new Date(createdDateStr);
    const updatedDate = new Date(updatedDateStr);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let daysGap = 0;

    if (createdDate.getTime() === updatedDate.getTime()) {
      daysGap = 0;
    } else {
      daysGap = Math.floor(
        (updatedDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24)
      );
    }

    return `${Math.max(0, daysGap)} days`;
  };
  const isLargeScreen = useMediaQuery("(min-width: 640px)");
  const chunkSize = 10;

  const initialChunk = dateLabels.slice(0, chunkSize);
  return (
    <main
      // style={{ height: "calc(100vh - 70px)" }}
      className="flex flex-col h-full max-h-full w-full gap-5 border-l-none md:border-l-2 border-t-2 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FAFAFA] p-4 md:p-8 overflow-auto custom-scrollbar"
    >
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
        <Box className="flex flex-row gap-1">
          <Box
            style={{ position: "relative" }}
            className="flex flex-col md:flex-row gap-2"
          >
            <input
              style={{
                width: "160px",
                border: "2px solid #EBEBEB",
                boxShadow: "none",
                borderRadius: "5px",
                backgroundColor: "transparent",
                color: "#454545",
              }}
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
              className="border-2 p-2 pl-8 text-sm cursor-pointer focus-within:outline-none"
            />
            <CiCalendar
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 1,
              }}
            />
            {showDatePicker && (
              <div
                ref={datePickerRef}
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  background: "white",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  top: "100%",
                  left: isLargeScreen ? -270 : 0,
                }}
              >
                <DateRangePicker
                  ranges={tmpCurrentDateRange}
                  onChange={handleTmpSelect}
                  moveRangeOnFirstSelection={false}
                  maxDate={new Date()}
                />
                <div className="flex w-100 justify-end gap-3 p-2">
                  <Button onClick={() => setShowDatePicker(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleApplyTmpDateRange}>Apply</Button>
                </div>
              </div>
            )}
          </Box>
          <Button
            variant="outlined"
            type="button"
            className="!hidden !px-4 !py-1 !rounded-md !font-semibold gap-2 !capitalize md:!flex"
            onClick={toggleFullScreen}
            sx={{
              border: "2px solid #EBEBEB",
              boxShadow: "none",
              backgroundColor: "transparent",
              color: "#454545",
            }}
          >
            <FullScreen />
            {isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </Box>
      </Box>

      <Box
        ref={dateLabelsRef}
        className="flex gap-20 text-center justify-between py-3 border-b-2 border-[#F4F4F7] overflow-x-auto custom-scrollbar"
        style={{
          display: "flex",
          whiteSpace: "nowrap",
        }}
      >
        {initialChunk.map((day, index) => (
          <Typography
            key={index}
            className="text-sm font-medium text-[#B1B0B2]"
            style={{ minWidth: "80px", maxWidth: "80px" }}
          >
            {day}
          </Typography>
        ))}
        {dateLabels.length > chunkSize &&
          dateLabels.slice(chunkSize).map((day, index) => (
            <Typography
              key={index + chunkSize}
              className="text-sm font-medium text-[#B1B0B2]"
              style={{ minWidth: "80px", maxWidth: "80px" }}
            >
              {day}
            </Typography>
          ))}
      </Box>

      {trackingData.length > 0 ? (
        <Box
          ref={shipmentItemsRef}
          className={`grid grid-cols-6 gap-0 p-3 text-center relative h-[76vh] bg-white bg-[linear-gradient(to_right,#dddde0_2px,transparent_1px)] bg-[size:160px_100%] overflow-auto custom-scrollbar`}
          sx={{
            backgroundPositionX: `-${scrollLeft}px`,
          }}
        >
          {/* Shipment Items */}
          {trackingData.map((data, i) => {
            const createdDateStr = data.created_at.split("T")[0];
            const updatedDateStr = data.updated_at.split("T")[0];
            const status = data.status.toUpperCase();
            const createdIndex = dateLabels.indexOf(
              formatDateLabel(new Date(createdDateStr))
            );
            const updatedIndex = dateLabels.indexOf(
              formatDateLabel(new Date(updatedDateStr))
            );
            console.log("dateLabels :>> ", createdDateStr, updatedDateStr);
            let colSpan = updatedIndex - createdIndex + 1;
            const daysGap = calculateDaysGap(data);
            const tooltipContent = (
              <div className="text-left">
                <p>
                  <strong>SKU #:</strong> {data.tracking_number || "N/A"}
                </p>
                <p>
                  <strong>Company:</strong> {data.tracking_company || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {data.status.toUpperCase()}
                </p>
                <p>
                  <strong>Days:</strong> {daysGap}
                </p>
              </div>
            );

            const dateLabelWidth = 160;
            const initialLeft = createdIndex * dateLabelWidth;
            const adjustedLeft = initialLeft - scrollLeft;

            return (
              <Link href={`/shipments/${data.order_id}`} key={data.id} passHref>
                <Tooltip title={tooltipContent} placement="top-start" arrow>
                  <Box
                    key={data.id}
                    className={`px-3 pt-1 ${
                      data.status === "PENDING"
                        ? "bg-[#FFECD6]"
                        : "bg-[#E8ECFE]"
                    } rounded-lg flex items-center absolute overflow-x-auto custom-scrollbar whitespace-nowrap mt-3 h-12`}
                    sx={{
                      top: `${i * 55}px`,
                      left: `${adjustedLeft}px`,
                      width: `${colSpan * dateLabelWidth}px`,
                      gap: "1rem",
                      cursor: "pointer",
                      "&:hover": {
                        overflow: "visible",
                        width: "fit-content",
                      },
                    }}
                  >
                    <Typography className="text-sm text-gray-800">
                      #{data.tracking_number || "No SKU"}
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
                          src="/icons/usps.png"
                          alt="usps"
                          width={24}
                          height={22}
                          className="w-[24px] h-[24px]"
                        />
                      )}
                      {data.tracking_company === "SDH" && (
                        <Image
                          src="/icons/sdh.png"
                          alt="sdh"
                          width={24}
                          height={22}
                          className="w-[24px] h-[24px]"
                        />
                      )}
                      {data.tracking_company === "UPS" && (
                        <Image
                          src="/svgs/ups-icon.svg"
                          alt="ups"
                          width={24}
                          height={22}
                          className="w-[24px] h-[24px]"
                        />
                      )}
                      {data.tracking_company === "YANWEN" && (
                        <Image
                          src="/svgs/yanwen.svg"
                          alt="yanwen"
                          width={24}
                          height={22}
                          className="w-[24px] h-[24px]"
                        />
                      )}
                      {data.tracking_company === "Yun Express" && (
                        <Image
                          src="/svgs/yun-express.svg"
                          alt="yun-express"
                          width={24}
                          height={22}
                          className="w-[24px] h-[24px]"
                        />
                      )}
                      {![
                        "DHL Express",
                        "USPS",
                        "SDH",
                        "UPS",
                        "YANWEN",
                        "Yun Express",
                      ].includes(data.tracking_company || "") && (
                        <Image
                          src="/icons/Layer.png"
                          alt="default-logo"
                          width={24}
                          height={22}
                          className="w-[24px] h-[24px]"
                        />
                      )}
                      <Chip
                        label={data.tracking_company || "No Company"}
                        size="small"
                        className="text-sm !bg-transparent text-yellow-600"
                      />
                    </Box>
                    <Typography className="text-sm text-gray-500">•</Typography>
                    <Typography>{calculateDaysGap(data)}</Typography>
                    <Typography className="text-sm text-gray-500">•</Typography>
                    <Typography
                      className={`text-sm ml-2 ${
                        status === "SUCCESS"
                          ? "text-green-600"
                          : status === "PENDING" || status === "OPEN"
                          ? "text-yellow-600"
                          : status === "CANCELLED" ||
                            status === "ERROR" ||
                            status === "FAILURE"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {status === "SUCCESS"
                        ? "On-Time"
                        : status === "PENDING" || status === "OPEN"
                        ? "Pending"
                        : status === "CANCELLED"
                        ? "Cancelled"
                        : status === "ERROR"
                        ? "Error"
                        : status === "FAILURE"
                        ? "Failed"
                        : "Unknown"}
                    </Typography>
                  </Box>
                </Tooltip>
              </Link>
            );
          })}
        </Box>
      ) : (
        <Box className="flex items-center justify-center h-80 bg-white text-gray-500">
          No Data Available
        </Box>
      )}
    </main>
  );
}
