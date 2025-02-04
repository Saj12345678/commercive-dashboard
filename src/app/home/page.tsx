"use client";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Button } from "@mui/material";
import { useEffect, useState, useRef } from "react";

import { DateRangePicker, Range } from "react-date-range";
import FeatureCard from "@/components/feature-card";
import { createClient } from "../utils/supabase/client";
import Inventory from "@/components/Inventory";
import FullScreen from "@/components/images/full-screen";
import "./home.css";
import Summary from "@/components/Summary";
import { useStoreContext } from "@/context/StoreContext";
import Image from "next/image";

interface InventoryData {
  image: string;
  color: string;
  name: string;
  stockMeter: number;
  stockStatus: string;
  backorders: number;
}
interface TransactionData {
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
}
export default function Home() {
  const supabase = createClient();
  const currentPickerRef = useRef<HTMLDivElement | null>(null);
  const comparePickerRef = useRef<HTMLDivElement | null>(null);
  const { selectedStore, setSelectedStore, storeData } = useStoreContext();
  const storeName = selectedStore ? selectedStore.label : null;

  const getSundayOfWeek = (date: Date) => {
    const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = day === 0 ? 0 : - day; // Adjust when today is Sunday
    return new Date(date.setDate(date.getDate() + diff));
  };

  const getSaturdayOfWeek = (date: Date) => {
    const sunday = getSundayOfWeek(new Date(date));
    return new Date(sunday.setDate(sunday.getDate() + 6));
  };

  const getSundayOfLastWeek = (date: Date) => {
    const sunday = getSundayOfWeek(new Date(date));
    return new Date(sunday.setDate(sunday.getDate() - 7)); // Go back 7 days
  };
  const getSaturdayOfLastWeek = (date: Date): Date => {
    const lastSunday = getSundayOfLastWeek(new Date(date));
    return new Date(lastSunday.setDate(lastSunday.getDate() + 6)); // Move forward 6 days
  };
  const [showCurrentDateRange, setShowCurrentDateRange] = useState<boolean>(false);
  const [currentDateRange, setCurrentDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCompareDateRange, setShowCompareDateRange] = useState<boolean>(false);
  const [compareDateRange, setCompareDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const handleCurrentDateSelect = (ranges: any) => {
    setCurrentDateRange([ranges.selection]);
    setShowCurrentDateRange(false); // Hide after selection
  };
  const handleCompareDateSelect = (ranges: any) => {
    setCompareDateRange([ranges.selection]);
    setShowCompareDateRange(false); // Hide after selection
  };

  useEffect(() => {
    // Current week (Monday to Today)
    const today = new Date();
    // Current week (Sunday to Saturday)
    const thisSunday = getSundayOfWeek(new Date());
    const thisSaturday = getSaturdayOfWeek(new Date());

    // Last week (Sunday to Saturday)
    const lastSunday = getSundayOfLastWeek(new Date());
    const lastSaturday = getSaturdayOfLastWeek(new Date());
    setCurrentDateRange([
      {
        startDate: thisSunday,
        endDate: thisSaturday,
        key: "selection",
      },
    ]);

    setCompareDateRange([
      {
        startDate: lastSunday,
        endDate: lastSaturday,
        key: "selection",
      },
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currentPickerRef.current && !currentPickerRef.current.contains(event.target as Node)) {
        setShowCurrentDateRange(false);
      }
    };

    if (showCurrentDateRange) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCurrentDateRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comparePickerRef.current && !comparePickerRef.current.contains(event.target as Node)) {
        setShowCompareDateRange(false);
      }
    };

    if (showCompareDateRange) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCompareDateRange]);

  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([
    {
      name: "Unfulfilled Orders",
      amount: "0",
      percentage: "0%",
      color: "#4F11C9",
      bgColor: "#E5DCFB",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Orders Needing Resolution",
      amount: "12",
      percentage: "3%",
      color: "#FFA451",
      bgColor: "#FFEBD6",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Total Cost",
      amount: "5356.62",
      percentage: "15%",
      color: "#47A83C",
      bgColor: "#BFFBB7",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Backordered Items",
      amount: "35",
      percentage: "4%",
      color: "#7A94F6",
      bgColor: "#DDE4FC",
      series: [25, 30, 22, 40, 55],
    },
  ]);
  const [inventoryData, setInventoryData] = useState<InventoryData[]>([]);
  const [trackingsData, setTrackingsData] = useState<TransactionData[]>([]);


  // Function to calculate total earnings
  const calculateEarnings = (orders: any, weekOffset = 0, status = "paid") => {
    const totalEarning = orders.reduce((total: number, order: any) => {
      const financialStatus = order.financial_status.trim();
      const subTotal = parseFloat(order.sub_total_price);

      if (financialStatus === status.trim()) {
        total += subTotal;
      }
      return total;
    }, 0);
    return totalEarning;
  };

  const groupAndSumByDate = (orders: any) => {
    const grouped = orders.reduce((acc: any, order: any) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += Number(order.sub_total_price);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, total]) => ({ date, total }));
  };

  function getTotalsBetweenDates(data: any) {
    const { chartData, formattedStartDate, formattedEndDate } = data;

    const startDate = new Date(formattedStartDate);
    const endDate = new Date(formattedEndDate);

    const totalsMap = new Map(
      chartData?.map((item: any) => [
        new Date(item.date).toISOString().split("T")[0],
        item.total,
      ])
    );

    const totalsArray = [];
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const formattedDate = date.toISOString().split("T")[0];
      totalsArray.push(totalsMap.get(formattedDate) || 0);
    }

    return totalsArray;
  }

  const calculatePercentageChange = (
    currentWeek: number,
    pastWeek: number
  ): string => {
    // Handle cases where the past week's earnings are zero to avoid division by zero
    if (pastWeek === 0) {
      return currentWeek > 0 ? "100%" : "0%";
    }

    const change = ((currentWeek - pastWeek) / pastWeek) * 100;

    return `${change.toFixed(2)}%`;
  };

  const fetchOrders = async (currentDateRange: any, compareDateRange: any) => {
    if (!storeName) {
      return;
    }

    const formatDateForQuery = (date: Date) => {
      const isoString = date.toISOString();
      return isoString.split("Z")[0];
    };

    const formattedStartDate = formatDateForQuery(currentDateRange.startDate);
    const formattedEndDate = formatDateForQuery(currentDateRange.endDate);
    
    const formattedStartDatePast = formatDateForQuery(compareDateRange.startDate);
    const formattedEndDatePast = formatDateForQuery(compareDateRange.endDate);

    setLoading(true);

    try {
      // const { data: orderData, error: orderError } = await supabase
      //   .from("order")
      //   .select("*")
      //   .gte("created_at", formattedStartDate)
      //   .lt("created_at", formattedEndDate);

      // const { data: pastWeekOrders, error: pastWeekError } = await supabase
      //   .from("order")
      //   .select("*")
      //   .gte("created_at", formattedStartDatePast)
      //   .lt("created_at", formattedEndDatePast);
      const { data: orderData, error: orderError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate)
        .eq("store_name", storeName); // Add the condition to filter by store_name
        
      const { data: pastWeekOrders, error: pastWeekError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDatePast)
        .lt("created_at", formattedEndDatePast)
        .eq("store_name", storeName); // Add the condition to filter by store_name

      const { data: trackingsData, error: trackingsError } = await supabase
        .from("trackings")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate)
        .eq("store_name", storeName);

      const { data: pastWeekTrackings, error: pastWeekTrackingsError } =
        await supabase
          .from("trackings")
          .select("*")
          .gte("created_at", formattedStartDatePast)
          .lte("created_at", formattedEndDatePast)
          .eq("store_name", storeName);

      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("store_name", storeName);

      if (orderError || inventoryError || trackingsError) {
        console.error("Error fetching orders:", orderError, inventoryError);
        setLoading(false);
      } else {
        const totalEarnings = calculateEarnings(orderData, 0, "paid");

        const totalEarningsPastWeek = calculateEarnings(
          pastWeekOrders,
          0,
          "paid"
        );
        const paidRecords = orderData.filter(
          (data) => data.financial_status.trim().toLowerCase() === "paid"
        );

        const totalEarningsChart = groupAndSumByDate(paidRecords);
        const totalEarning = getTotalsBetweenDates({
          chartData: totalEarningsChart,
          formattedStartDate,
          formattedEndDate,
        });

        const totalEarningsChange = calculatePercentageChange(
          totalEarnings,
          totalEarningsPastWeek
        );

        const filteredData = trackingsData.filter(
          (item) => item.status === "false"
        );
        setTrackingsData(trackingsData);
        const filteredPastTrackingData = pastWeekTrackings
          ? pastWeekTrackings.filter((item) => item.status === "false")
          : [];

        const groupedByDate = filteredData.reduce((acc, item) => {
          const date = item.created_at.split("T")[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {});

        // Convert the grouped data into counts
        const groupedCounts = Object.values(groupedByDate).map(
          (group: any) => group.length
        );

        setChartData((prevData: any) => {
          return prevData.map((item: any) => {
            if (item.name === "Orders Needing Resolution") {
              const currentWeekCount = filteredData?.length || 0;
              const pastWeekCount = filteredPastTrackingData?.length || 0;
              let percentage;

              if (pastWeekCount === 0) {
                percentage = currentWeekCount > 0 ? "100%" : "0%";
              } else {
                percentage =
                  ((currentWeekCount - pastWeekCount) / pastWeekCount) * 100;
                percentage = `${percentage.toFixed(2)}%`;
              }

              return {
                ...item,
                amount: currentWeekCount,
                series: groupedCounts,
                percentage: percentage,
              };
            }
            if (item.name === "Total Cost") {
              return {
                ...item,
                amount: totalEarnings.toFixed(2),
                series: totalEarning,
                percentage: totalEarningsChange,
              };
            }
            if (item.name === "Unfulfilled Orders") {
              const currentWeekCount = filteredData?.length || 0;
              const pastWeekCount = filteredPastTrackingData?.length || 0;
              let percentage;

              if (pastWeekCount === 0) {
                percentage = currentWeekCount > 0 ? "100%" : "0%";
              } else {
                percentage =
                  ((currentWeekCount - pastWeekCount) / pastWeekCount) * 100;
                percentage = `${percentage.toFixed(2)}%`;
              }

              return {
                ...item,
                amount: currentWeekCount,
                series: groupedCounts,
                percentage: percentage,
              };
            }
            return item;
          });
        });

        const transformedData = inventoryData.map((item) => {
          const inventoryQuantities =
            item.inventory_level[0]?.node?.quantities || [];
          const available =
            inventoryQuantities.find((q: any) => q.name === "available")
              ?.quantity || 0;
          const committed =
            inventoryQuantities.find((q: any) => q.name === "committed")
              ?.quantity || 0;

          let stockStatus = "Enough Stock";
          if (available === 0) stockStatus = "No Stock";
          else if (available < 50) stockStatus = "Low Stock";

          return {
            image: "",
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
            name: `Product ${item.sku}`,
            stockMeter: available + committed,
            stockStatus,
            backorders: committed,
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
    if (currentDateRange && compareDateRange) {
      fetchOrders(currentDateRange[0], compareDateRange[0]);
    }
  };

  useEffect(() => {
    if (currentDateRange && compareDateRange) {
      handleFetchData();
    }
  }, [currentDateRange, compareDateRange, selectedStore]);

  const Data = [
    {
      image: "",
      color: "#26124",
      name: "Modern Sofa",
      stockMeter: 530,
      stockStatus: "Enough Stock",
      backorders: 0,
    },
    {
      image: "",
      color: "#60430",
      name: "Oak Dining Table",
      stockMeter: 221,
      stockStatus: "Low Stock",
      backorders: 0,
    },
    {
      image: "",
      color: "#40539",
      name: "Leather Recliner Chair",
      stockMeter: 672,
      stockStatus: "No Stock",
      backorders: 34,
    },
  ];

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <>
      <main
        // style={{ height: "calc(100vh - 70px)" }}
        className="flex flex-col h-screen max-h-screen w-full gap-5 border-l-none md:border-l-4 border-t-4 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FCFCFC] p-4 md:p-8 overflow-auto custom-scrollbar"
      >
        {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="loader"></div>
          </div>
        )}
        <div className="flex flex-col md:flex-row w-full justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-1">
            <h1 className="flex w-full text-[#454545] text-4xl font-bold">
              Hello, {storeName == "satish-dev" ? "Golf Pro" : storeName}!
            </h1>
            {/* <p className="text-[#af9ae4] text-nowrap text-2xl">
              Here’s an update for your store
            </p> */}
          </div>
          <Button
            variant="outlined"
            type="submit"
            className="!hidden !px-4 !py-1 !rounded-md !font-semibold gap-2 !capitalize md:!flex"
            sx={{
              border: "3px solid #EBEBEB",
              boxShadow: "none",
              backgroundColor: "transparent",
              color: "#454545",
            }}
          >
            <FullScreen />
            Fullscreen
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex flex-col md:flex-row gap-2">
            <div style={{ position: "relative" }}>
              {/* Input Field */}
              <input
                type="text"
                value={
                  currentDateRange[0]?.startDate && currentDateRange[0]?.endDate
                    ? `${currentDateRange[0].startDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })} - ${currentDateRange[0].endDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}`
                    : "Select a date range"
                }
                onFocus={() => setShowCurrentDateRange(true)} // Show on focus
                readOnly
                className="border p-2 w-full text-sm cursor-pointer"
              />

              {/* Date Picker - Show/Hide Based on State */}
              {showCurrentDateRange && (
                <div
                  ref={currentPickerRef}
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    background: "white",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <DateRangePicker
                    ranges={currentDateRange}
                    onChange={handleCurrentDateSelect}
                    moveRangeOnFirstSelection={false}
                  />
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              {/* Input Field */}
              <input
                type="text"
                value={
                  compareDateRange[0]?.startDate && compareDateRange[0]?.endDate
                    ? `${compareDateRange[0].startDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })} - ${compareDateRange[0].endDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}`
                    : "Select a date range"
                }
                onFocus={() => setShowCompareDateRange(true)} // Show on focus
                readOnly
                className="border p-2 w-full text-sm cursor-pointer"
              />

              {/* Date Picker - Show/Hide Based on State */}
              {showCompareDateRange && (
                <div
                  ref={comparePickerRef}
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    background: "white",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <DateRangePicker
                    ranges={compareDateRange}
                    onChange={handleCompareDateSelect}
                    moveRangeOnFirstSelection={false}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-refresh"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="w-4 h-4 text-blue-600 border-[#EBEBEB] rounded focus:ring-blue-500"
            />
            <label
              htmlFor="auto-refresh"
              className="ml-2 text-sm font-semibold text-[#454545]"
            >
              Auto-Refresh
            </label>
          </div>
        </div>

        <div className="flex min-h-[165px] flex-row overflow-auto whitespace-nowrap custom-scrollbar">
          <FeatureCard data={chartData} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <div className="flex-1 bg-white border-2 border-[#EBEBEB] rounded-lg shadow-lg overflow-auto custom-scrollbar">
            <Inventory data={inventoryData} />
          </div>
          <div className="flex-1 bg-white border-2 border-[#EBEBEB] rounded-lg shadow-lg overflow-auto custom-scrollbar">
            <Summary data={trackingsData} />
          </div>
        </div>
        <div className="flex gap-4 w-full px-4 py-6 sm:px-6 sm:py-8 bg-white border border-white rounded-lg shadow-lg">
          <div className="bg-white rounded-lg flex items-center gap-2">
            <Image
              src={"/svgs/Forecast.svg"}
              width={30}
              height={30}
              alt="icon"
              className="text-[#5014ca]"
            />

            <h3 className="flex w-full text-[#454545] text-2xl font-bold">
              Stock Forecast
            </h3>
          </div>
        </div>
      </main>
    </>
  );
}
