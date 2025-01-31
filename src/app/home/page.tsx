"use client";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import FeatureCard from "@/components/feature-card";
import { createClient } from "../utils/supabase/client";
import Inventory from "@/components/Inventory";
import FullScreen from "@/components/images/full-screen";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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
  const today = new Date();
  const currentDay = today.getDay();
  const currentWeekMonday = new Date(today);
  const { selectedStore, setSelectedStore, storeData } = useStoreContext();
  const storeName = selectedStore ? selectedStore.label : null;

  currentWeekMonday.setDate(
    today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
  );
  const oneWeekAgo = new Date(currentWeekMonday);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [compareDate, setCompareDate] = useState<Date | null>(oneWeekAgo);
  const [showDatePicker, setShowDatePicker] = useState<
    "today" | "compare" | null
  >(null);
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

  const getPastWeekDatesFromSelectedDates = (
    startDate: Date,
    endDate: Date
  ) => {
    const pastStartDate = new Date(startDate);
    pastStartDate.setDate(startDate.getDate() - 7);

    const pastEndDate = new Date(endDate);
    pastEndDate.setDate(endDate.getDate() - 7);

    return { pastStartDate, pastEndDate };
  };

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

  const fetchOrders = async (startDate: Date, endDate: Date) => {
    if (!storeName) {
      return;
    }

    const formatDateForQuery = (date: Date) => {
      const isoString = date.toISOString();
      return isoString.split("Z")[0];
    };

    const formattedStartDate = formatDateForQuery(startDate);
    const formattedEndDate = formatDateForQuery(endDate);

    const { pastStartDate, pastEndDate } = getPastWeekDatesFromSelectedDates(
      startDate,
      endDate
    );

    const formattedStartDatePast = formatDateForQuery(pastStartDate);
    const formattedEndDatePast = formatDateForQuery(pastEndDate);

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
        .gte("created_at", formattedStartDate)
        .lte("created_at", formattedEndDate)
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

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateChange = (date: Date) => {
    if (showDatePicker === "today") {
      setSelectedDate(date);
    } else if (showDatePicker === "compare") {
      if (selectedDate && date > selectedDate) {
        toast.warning("Comparison date cannot be after the selected date.");
        return;
      }
      //   if (
      //     selectedDate &&
      //     (selectedDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) > 7
      //   ) {
      //     toast.warning("Maximum date range is 7 days.");
      //     return;
      //   }
      setCompareDate(date);
    }
    setShowDatePicker(null);
  };

  const handleFetchData = () => {
    if (selectedDate && compareDate) {
      fetchOrders(compareDate, selectedDate);
    }
  };

  useEffect(() => {
    if (selectedDate && compareDate) {
      handleFetchData();
    }
  }, [selectedDate, compareDate, selectedStore]);

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
        className="flex flex-col h-full w-full gap-5 border-l-none md:border-l-4 border-t-4 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FCFCFC] p-4 md:p-8 overflow-auto custom-scrollbar"
      >
        {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="loader"></div>
          </div>
        )}
        <div className="flex flex-col md:flex-row w-full justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-1">
            <h1 className="flex w-full text-[#454545] text-4xl font-bold">
              Hello, {storeName}!
            </h1>
            {/* <p className="text-[#af9ae4] text-nowrap text-2xl">
              Here’s an update for your store
            </p> */}
          </div>
          <Button
            variant="outlined"
            type="submit"
            className="!px-4 !py-1 !rounded-md !font-semibold gap-2 !capitalize"
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
          <div className="flex flex-col md:flex-row">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div className="flex items-center gap-2">
                <Button
                  className="!rounded-md !font-semibold gap-2 !bg-transparent !border-2 !border-[#EBEBEB] !shadow-none !capitalize"
                  variant="outlined"
                  onClick={() => {
                    setShowDatePicker("today");
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    border: "3px solid #EBEBEB",
                    color: "#454545",
                  }}
                >
                  <MdOutlineCalendarToday size={18} />
                  <span>
                    {selectedDate && isToday(selectedDate)
                      ? "Today"
                      : selectedDate?.toDateString() || "Today"}
                  </span>
                </Button>
                <DatePicker
                  open={showDatePicker === "today"}
                  value={selectedDate}
                  onChange={(date: any) => handleDateChange(date)}
                  maxDate={today}
                  onClose={() => setShowDatePicker(null)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  className="!rounded-md !font-semibold gap-2 !bg-transparent !border-2 !border-[#EBEBEB] !shadow-none !capitalize"
                  onClick={() => setShowDatePicker("compare")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    border: "3px solid #EBEBEB !important",
                    color: "#454545",
                  }}
                >
                  <MdOutlineCalendarToday size={18} />
                  <span>
                    {compareDate
                      ? `Compare to ${compareDate.toDateString()}`
                      : "Compare to ..."}
                  </span>
                </Button>

                <DatePicker
                  open={showDatePicker === "compare"}
                  value={compareDate}
                  onChange={(date: any) => handleDateChange(date)}
                  maxDate={today}
                  onClose={() => setShowDatePicker(null)}
                />
              </div>
            </LocalizationProvider>
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

        <div className="flex flex-row overflow-auto whitespace-nowrap custom-scrollbar">
          <FeatureCard data={chartData} />
        </div>

        <div className="flex flex-col lg:flex-row gap-4 w-full">
          <div className="flex-1 overflow-auto">
            <Inventory data={inventoryData} />
          </div>
          <div className="flex-1 overflow-auto">
            <Summary data={trackingsData} />
          </div>
        </div>
        <div className="flex gap-4 w-full px-4 py-6 sm:px-6 sm:py-8 bg-white border border-white rounded-lg shadow-lg">
          <div className="bg-white rounded-lg flex items-center gap-2">
            <Image
              src={"/svgs/icon-20.svg"}
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
