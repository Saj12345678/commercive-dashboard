"use client";

import { useEffect, useRef, useState } from "react";
import { DateRangePicker, Range } from "react-date-range";
import { CiCalendar } from "react-icons/ci";
import { Button } from "@mui/material";
import FeatureCard, { FeatureCardSkeleton } from "@/components/feature-card";
import FullScreen from "@/components/images/full-screen";
import Inventory from "@/components/inventory";
import Summary from "@/components/summary";
import Forecast from "@/components/forecast";
import { useStoreContext } from "@/context/StoreContext";
import { createClient } from "../../utils/supabase/client";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./home.css";
import { redirect } from "next/navigation";

export interface InventoryItem {
  image: string | null;
  color: string;
  name: string;
  stockMeter: number;
  stockStatus: string;
  backorders: number;
}

export default function Home() {
  const supabase = createClient();
  const currentPickerRef = useRef<HTMLDivElement | null>(null);
  const comparePickerRef = useRef<HTMLDivElement | null>(null);
  const { selectedStore, stores, userinfo, allStores } = useStoreContext();
  const storeUrl = selectedStore ? selectedStore.store_url : null;

  const userStores = userinfo?.role == "user" ? stores : allStores;

  if (userStores && userStores.length == 0) {
    redirect("/support");
  }

  const getSundayOfWeek = (date: Date) => {
    const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diff = day === 0 ? 0 : -day; // Adjust when today is Sunday
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

  const [showCurrentDateRange, setShowCurrentDateRange] =
    useState<boolean>(false);

  const [tmpCurrentDateRange, setTmpCurrentDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [currentDateRange, setCurrentDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [showCompareDateRange, setShowCompareDateRange] =
    useState<boolean>(false);

  const [tmpCompareDateRange, setTmpCompareDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [compareDateRange, setCompareDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleApplyCurrentDateRange = () => {
    setCurrentDateRange(tmpCurrentDateRange);
    setShowCurrentDateRange(false);
  };

  const handleCurrentDateSelect = (ranges: any) => {
    setTmpCurrentDateRange([ranges.selection]);
    // setShowCurrentDateRange(false); // Hide after selection
  };

  const handleApplyTmpDateRange = () => {
    setCompareDateRange(tmpCurrentDateRange);
    setShowCompareDateRange(false);
  };

  const handleCompareDateSelect = (ranges: any) => {
    setTmpCompareDateRange([ranges.selection]);
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
      if (
        currentPickerRef.current &&
        !currentPickerRef.current.contains(event.target as Node)
      ) {
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
      if (
        comparePickerRef.current &&
        !comparePickerRef.current.contains(event.target as Node)
      ) {
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
      name: "Total Sales",
      amount: "0",
      percentage: "0%",
      color: "#FFA451",
      bgColor: "#FFEBD6",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Total Cost",
      amount: "0",
      percentage: "0%",
      color: "#47A83C",
      bgColor: "#BFFBB7",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Fulfilled Orders",
      amount: "0",
      percentage: "0%",
      color: "#7A94F6",
      bgColor: "#DDE4FC",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Unfulfilled Orders",
      amount: "0",
      percentage: "0%",
      color: "#4F11C9",
      bgColor: "#E5DCFB",
      series: [0, 0, 0, 0, 0],
    },
  ]);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loadingCard, setLoadingCard] = useState(true);

  // Function to calculate total earnings
  const calculateEarnings = (orders: any, weekOffset = 0, status = "paid") => {
    const totalEarning = orders.reduce((total: number, order: any) => {
      const financialStatus = order.financial_status?.trim();
      const subTotal = parseFloat(order.sub_total_price);

      if (financialStatus === status?.trim()) {
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
    if (!storeUrl) {
      return;
    }

    const formatDateForQuery = (date: Date) => {
      const isoString = date.toISOString();
      return isoString.split("Z")[0];
    };

    const formattedStartDate = formatDateForQuery(currentDateRange.startDate);
    const formattedEndDate = formatDateForQuery(currentDateRange.endDate);
    const formattedStartDatePast = formatDateForQuery(
      compareDateRange.startDate
    );
    const formattedEndDatePast = formatDateForQuery(compareDateRange.endDate);

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate)
        .eq("store_url", storeUrl); // Add the condition to filter by store_name

      const { data: pastWeekOrders, error: pastWeekError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDatePast)
        .lt("created_at", formattedEndDatePast)
        .eq("store_url", storeUrl); // Add the condition to filter by store_name

      const { data: trackingsData, error: trackingsError } = await supabase
        .from("trackings")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate)
        .eq("store_url", storeUrl);

      const { data: pastWeekTrackings, error: pastWeekTrackingsError } =
        await supabase
          .from("trackings")
          .select("*")
          .gte("created_at", formattedStartDatePast)
          .lte("created_at", formattedEndDatePast)
          .eq("store_url", storeUrl);

      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*")
        .eq("store_url", storeUrl);

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
          (data) => data.financial_status?.trim().toLowerCase() === "paid"
        );

        const pastWeekPaidRecords = pastWeekOrders?.filter(
          (data) => data.financial_status?.trim().toLowerCase() === "paid"
        );

        const fulfillRecords = orderData.filter(
          (data) => data.fulfillment_status === "fulfilled"
        );

        const pastWeekFulfillRecords = pastWeekOrders?.filter(
          (data) => data.fulfillment_status === "fulfilled"
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
        }, {} as any);

        const groupedCounts = Object.values(groupedByDate).map(
          (group: any) => group.length
        );

        const groupedByDateTotalSale = paidRecords.reduce((acc, item) => {
          const date = item.created_at.split("T")[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {} as any);

        const groupedCountsTotalSale = Object.values(
          groupedByDateTotalSale
        ).map((group: any) => group.length);

        const groupedByDateFulfillOrder = fulfillRecords.reduce((acc, item) => {
          const date = item.created_at.split("T")[0];
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {} as any);

        const groupedCountsFulfillOrder = Object.values(
          groupedByDateFulfillOrder
        ).map((group: any) => group.length);

        setChartData((prevData: any) => {
          return prevData.map((item: any) => {
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
                series:
                  groupedCounts.length > 0 ? groupedCounts : [0, 0, 0, 0, 0],
                percentage: percentage,
              };
            }
            if (item.name === "Total Sales") {
              const currentWeekCount = paidRecords?.length || 0;
              const pastWeekCount = pastWeekPaidRecords?.length || 0;
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
                series:
                  groupedCountsTotalSale.length > 0
                    ? groupedCountsTotalSale
                    : [0, 0, 0, 0, 0],
                percentage: percentage,
              };
            }
            if (item.name === "Total Cost") {
              return {
                ...item,
                amount: totalEarnings.toFixed(2),
                series:
                  totalEarning.length > 0 ? totalEarning : [0, 0, 0, 0, 0],
                percentage: totalEarningsChange,
              };
            }
            if (item.name === "Fulfilled Orders") {
              const currentWeekCount = fulfillRecords?.length || 0;
              const pastWeekCount = pastWeekFulfillRecords?.length || 0;
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
                series:
                  groupedCountsFulfillOrder.length > 0
                    ? groupedCountsFulfillOrder
                    : [0, 0, 0, 0, 0],
                percentage: percentage,
              };
            }
            return item;
          });
        });

        const transformedData = inventoryData.map((item) => {
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
          let urlObj: any = {};
          try {
            urlObj = JSON.parse(item.product_image || "{}");
          } catch (e) {
            urlObj = {};
          }
          return {
            image: urlObj.url || item?.product_image,
            color: item.product_name || "", //"#" + Math.floor(Math.random() * 16777215).toString(16),
            name: item.sku || "NO SKU",
            product_id: item.product_id,
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
    if (currentDateRange && compareDateRange) {
      fetchOrders(currentDateRange[0], compareDateRange[0]);
    }
  };

  useEffect(() => {
    if (currentDateRange && compareDateRange) {
      handleFetchData();
    }
  }, [currentDateRange, compareDateRange, selectedStore]);

  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingCard(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main
        // style={{ height: "calc(100vh - 70px)" }}
        className="flex flex-col h-full max-h-full w-full gap-5 border-l-none md:border-l-2 border-t-2 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FAFAFA] p-4 md:p-8 overflow-auto custom-scrollbar"
      >
        {/* {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="loader"></div>
          </div>
        )} */}
        <div className="flex flex-col md:flex-row w-full justify-between gap-2">
          <div className="flex flex-col sm:flex-row gap-1">
            <h1 className="flex w-full text-[#454545] text-4xl font-bold">
              Hello, {selectedStore?.store_name} !
            </h1>
            {/* <p className="text-[#af9ae4] text-nowrap text-2xl">
              Here’s an update for your store
            </p> */}
          </div>
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
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex items-center gap-2">
            <div style={{ position: "relative" }}>
              {/* Input Field */}
              <input
                type="text"
                style={{
                  width: "160px",
                  border: "2px solid #EBEBEB",
                  boxShadow: "none",
                  borderRadius: "5px",
                  backgroundColor: "transparent",
                  color: "#454545",
                }}
                value={
                  currentDateRange[0]?.startDate && currentDateRange[0]?.endDate
                    ? `${currentDateRange[0].startDate.toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )} - ${currentDateRange[0].endDate.toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )}`
                    : "Select a date range"
                }
                onFocus={() => setShowCurrentDateRange(true)} // Show on focus
                readOnly
                className="border-2 p-2 pl-8 w-full text-sm cursor-pointer"
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
                    ranges={tmpCurrentDateRange}
                    onChange={handleCurrentDateSelect}
                    moveRangeOnFirstSelection={false}
                  />
                  <div className="flex w-100 justify-end gap-3 p-2">
                    <Button onClick={() => setShowCurrentDateRange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApplyCurrentDateRange}>Apply</Button>
                  </div>
                </div>
              )}
            </div>

            <p className="hidden md:block">Compare to</p>

            <div style={{ position: "relative" }}>
              {/* Input Field */}
              <input
                type="text"
                style={{
                  width: "160px",
                  border: "2px solid #EBEBEB",
                  boxShadow: "none",
                  borderRadius: "5px",
                  backgroundColor: "transparent",
                  color: "#454545",
                }}
                value={
                  compareDateRange[0]?.startDate && compareDateRange[0]?.endDate
                    ? `${compareDateRange[0].startDate.toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )} - ${compareDateRange[0].endDate.toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )}`
                    : "Select a date range"
                }
                onFocus={() => setShowCompareDateRange(true)} // Show on focus
                readOnly
                className="border-2 p-2 pl-8 w-full text-sm cursor-pointer"
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
                    ranges={tmpCompareDateRange}
                    onChange={handleCompareDateSelect}
                    moveRangeOnFirstSelection={false}
                  />
                  <div className="flex w-100 justify-end gap-3 p-2">
                    <Button onClick={() => setShowCompareDateRange(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApplyTmpDateRange}>Apply</Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className="flex items-center">
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
          </div> */}
        </div>

        <div className="flex min-h-[165px] flex-row gap-4 overflow-auto whitespace-nowrap custom-scrollbar">
          {loadingCard ? (
            <FeatureCardSkeleton page="home" />
          ) : (
            <FeatureCard
              data={chartData}
              page="home"
              dateRange={compareDateRange}
            />
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
          <div className="flex-shrink flex-1">
            <Inventory data={inventoryData} />
          </div>
          <div className="flex-shrink flex-1">
            <Summary selectedRange={currentDateRange} />
          </div>
        </div>

        <Forecast inventoryData={inventoryData} />
      </main>
    </>
  );
}
