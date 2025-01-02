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

export default function Home() {
  const supabase = createClient();
  const router = useRouter();
  const today = new Date();
  const currentDay = today.getDay();
  const currentWeekMonday = new Date(today);
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
      amount: "247",
      percentage: "15%",
      color: "#4F11C9",
      bgColor: "#E5DCFB",
      series: [0, 0, 1, 0, 0],
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

  // Function to calculate total earnings
  const calculateEarnings = (orders: any, weekOffset = 0, status = "paid") => {
    const totalEarning = orders.reduce((total: number, order: any) => {
      if (order.financial_status === status) {
        total += parseFloat(order.sub_total_price);
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

  const fetchOrders = async (startDate: Date, endDate: Date) => {
    const formatDateForQuery = (date: Date) => {
      const isoString = date.toISOString();
      return isoString.split("Z")[0];
    };

    const formattedStartDate = formatDateForQuery(startDate);
    const formattedEndDate = formatDateForQuery(endDate);

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate);

      const { data: referral, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lte("created_at", formattedEndDate);

      if (orderError || referralsError) {
        console.error("Error fetching orders:", orderError, referralsError);
        setLoading(false);
      } else {
        const totalEarnings = calculateEarnings(orderData, 0, "paid");
        const pendingEarnings = calculateEarnings(orderData, 0, "pending");

        const pendingRecords = orderData.filter(
          (data) => data.financial_status === "pending"
        );
        const paidRecords = orderData.filter(
          (data) => data.financial_status === "paid"
        );

        const totalEarningsChart = groupAndSumByDate(pendingRecords);
        const pendingEarningsChart = groupAndSumByDate(paidRecords);
        const totalEarning = getTotalsBetweenDates({
          chartData: totalEarningsChart,
          formattedStartDate,
          formattedEndDate,
        });
        const pendingEarning = getTotalsBetweenDates({
          chartData: pendingEarningsChart,
          formattedStartDate,
          formattedEndDate,
        });

        setChartData((prevData: any) => {
          return prevData.map((item: any) => {
            if (item.name === "Orders Needing Resolution") {
              return {
                ...item,
                amount: totalEarnings.toFixed(2),
                series: totalEarning,
              };
            }
            if (item.name === "Total Cost") {
              return {
                ...item,
                amount: pendingEarnings.toFixed(2),
                series: pendingEarning,
              };
            }
            if (item.name === "Unfulfilled Orders") {
              return {
                ...item,
                amount: referral?.length,
              };
            }
            return item;
          });
        });
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
  }, [selectedDate, compareDate]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        router.push("/login");
      }
    };

    fetchUser();
  }, []);

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
        style={{ height: "calc(100vh - 60px)" }}
        className="flex flex-col w-full gap-5 border-l-4 border-t-4 border-[#F4F4F7] rounded-tl-[24px] bg-[#FCFCFC] p-4 md:p-8 overflow-auto custom-scrollbar"
      >
        {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="loader"></div>
          </div>
        )}
        <div className="flex flex-col md:flex-row w-full justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1 items-center justify-center">
              <h1 className="flex w-full text-[#454545] text-2xl font-bold">
                Hello, Matthew!
              </h1>
              <p className="text-[#af9ae4] text-nowrap text-2xl">
                Here’s an update for your store
              </p>
            </div>
          </div>
          <Button
            variant="outlined"
            type="submit"
            className="!px-4 !py-1 !rounded-md !font-semibold gap-2 !capitalize"
            sx={{
              border: "3px solid #EBEBEB",
              boxShadow: "none",
              backgroundColor: "transparent",
              color:"#454545"
            }}
          >
            <FullScreen />
            Fullscreen
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-2">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div className="flex items-center gap-2">
                {/* Today Date Picker */}
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
                    color:"#454545"
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
                  //   renderInput={() => null} // No visible input field
                />

                {/* Compare Date Picker */}
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
                    color:"#454545"
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
                  //   renderInput={() => null} // No visible input field
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

        <div className="flex flex-col lg:flex-row w-full gap-4 mt-2">
          <FeatureCard data={chartData} />
        </div>

        <div className="flex gap-2">
          <Inventory data={Data} />
          <Summary />
        </div>
      </main>
    </>
  );
}
