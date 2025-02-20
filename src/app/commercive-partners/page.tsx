"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { MdOutlineCalendarToday, MdOutlineClose } from "react-icons/md";
import { toast } from "react-toastify";
import FeatureCard from "@/components/feature-card";
import CustomModal from "@/components/ui/modal";
import { createClient } from "../utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import { DateRangePicker, Range } from "react-date-range";
import "../home/home.css";
import CustomButton from "@/components/ui/custom-button";
import InputField from "@/components/ui/custom-inputfild";
import { BsCopy } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { CiCalendar } from "react-icons/ci";

export default function CommercivePartners() {
  const currentPickerRef = useRef<HTMLDivElement | null>(null);
  const comparePickerRef = useRef<HTMLDivElement | null>(null);
  const supabase = createClient();
  const router = useRouter();
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
  const [showCompareDateRange, setShowCompareDateRange] = useState<boolean>(false);
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
  }
  const handleCurrentDateSelect = (ranges: any) => {
    setTmpCurrentDateRange([ranges.selection]);
    // setShowCurrentDateRange(false); // Hide after selection
  };

  const handleApplyTmpDateRange = () => {
    setCompareDateRange(tmpCurrentDateRange);
    setShowCompareDateRange(false);
  }
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
  const [currentPage, setCurrentPage] = useState(1);
  const [referralLink, setReferralLink] = useState("");
  const [tooltipMessage, setTooltipMessage] = useState("");
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipInfoMessage, setTooltipInfoMessage] = useState("");
  const [isInfoTooltipOpen, setInfoIsTooltipOpen] = useState(false);
  const [chartData, setChartData] = useState([
    {
      name: "Total Referrals",
      amount: "0",
      percentage: "0%",
      color: "#4F11C9",
      bgColor: "#E5DCFB",
      series: [0, 0, 1, 0, 0],
    },
    {
      name: "Total Earnings",
      amount: "0",
      percentage: "0%",
      color: "#FFA451",
      bgColor: "#FFEBD6",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Pending Earnings",
      amount: "0",
      percentage: "0%",
      color: "#47A83C",
      bgColor: "#BFFBB7",
      series: [0, 0, 0, 0, 0],
    },
    {
      name: "Wallet",
      amount: "1393.72",
      percentage: "4%",
      color: "#7A94F6",
      bgColor: "#DDE4FC",
      series: [25, 30, 22, 40, 55],
    },
  ]);
  const itemsPerPage = 2;
  const [tableData, setTableData] = useState([
    { image: "", name: "", email: "", amount: "", commission: "" },
  ]);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleAffiliateClick = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Unable to fetch user information.");
        return;
      }

      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data?.referral_code) {
        toast.error("Unable to fetch referral code.");
        return;
      }

      setReferralLink(
        `${process.env.NEXT_PUBLIC_CLIENT_URL}/signUp?referral=${data.referral_code}`
      );
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleReferralLinkChange = (event: any) => {
    setReferralLink(event.target.value);
  };

  const handleReferralLinkCopy = () => {
    if (referralLink) {
      navigator.clipboard
        .writeText(referralLink)
        .then(() => {
          setTooltipMessage("Copied!");
          setIsTooltipOpen(true);
          setTimeout(() => setIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        })
        .catch(() => {
          setTooltipMessage("Failed to copy.");
          setIsTooltipOpen(true);
          setTimeout(() => setIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        });
    } else {
      setTooltipMessage("No referral link to copy.");
      setIsTooltipOpen(true);
      setTimeout(() => setIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
    }
  };
  const handleLinkInfoCopy = () => {
    const textToCopy = `Hey! I just started using this fantastic Order Tracking App that keeps me updated on all my deliveries. It’s super convenient and saves me so much time! If you sign up with my link, we both get exclusive discounts on our next orders. Check it out!
    ${referralLink}`;
    if (textToCopy) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setTooltipInfoMessage("Copied!");
          setInfoIsTooltipOpen(true);
          setTimeout(() => setInfoIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        })
        .catch(() => {
          setTooltipInfoMessage("Failed to copy.");
          setInfoIsTooltipOpen(true);
          setTimeout(() => setInfoIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        });
    } else {
      setTooltipInfoMessage("No referral link to copy.");
      setInfoIsTooltipOpen(true);
      setTimeout(() => setInfoIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
    }
  };

  const calculateEarnings = (orders: any, weekOffset = 0, status: string): number => {
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

  const calculateCommission = (totalSpending: any) => {
    const commissionRate = 0.01;
    return (totalSpending * commissionRate).toFixed(2);
  };

  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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

  const calculatePercentageChange = (currentWeek: number, pastWeek: number): string => {
    // Handle cases where the past week's earnings are zero to avoid division by zero
    if (pastWeek === 0) {
      return currentWeek > 0 ? "100%" : "0%";
    }

    const change = ((currentWeek - pastWeek) / pastWeek) * 100;

    return `${change.toFixed(2)}%`;
  };

  const fetchOrders = async (currentDateRange: any, compareDateRange: any) => {
    const formatDateForQuery = (date: Date) => {
      const isoString = date.toISOString();
      return isoString.split("Z")[0];
    };

    // Format dates for query
    const formattedStartDate = formatDateForQuery(currentDateRange.startDate);
    const formattedEndDate = formatDateForQuery(currentDateRange.endDate);

    const formattedStartDatePast = formatDateForQuery(compareDateRange.startDate);
    const formattedEndDatePast = formatDateForQuery(compareDateRange.endDate);

    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lt("created_at", formattedEndDate);

      const { data: pastWeekOrders, error: pastWeekError } = await supabase
        .from("order")
        .select("*")
        .gte("created_at", formattedStartDatePast)
        .lt("created_at", formattedEndDatePast);


      const { data: referral, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .gte("created_at", formattedStartDate)
        .lte("created_at", formattedEndDate);

      const { data: pastWeekReferral, error: pastWeekReferralsError } = await supabase
        .from("referrals")
        .select("*")
        .gte("created_at", formattedStartDatePast)
        .lte("created_at", formattedEndDatePast);


      if (orderError || referralsError) {
        console.error("Error fetching orders:", orderError, referralsError);
        setLoading(false);
      } else {
        const totalEarnings = calculateEarnings(orderData, 0, "paid");
        const pendingEarnings = calculateEarnings(orderData, 0, "pending");
        const totalEarningsPastWeek = calculateEarnings(pastWeekOrders, 0, "paid");
        const pendingEarningsPastWeek = calculateEarnings(pastWeekOrders, 0, "pending");

        const totalEarningsChange = calculatePercentageChange(totalEarnings, totalEarningsPastWeek);
        const pendingEarningsChange = calculatePercentageChange(pendingEarnings, pendingEarningsPastWeek);

        const groupedOrders = orderData.reduce((acc, order) => {
          if (order.customer_email) {
            if (!acc[order.customer_email]) {
              acc[order.customer_email] = {
                totalSpending: 0,
                name: order.customer_name,
              };
            }
            acc[order.customer_email].totalSpending += parseFloat(
              order.sub_total_price
            );
          }
          return acc;
        }, {});

        // Prepare table data based on grouped orders
        const updatedTableData = Object.keys(groupedOrders).map(
          (email, index) => {
            const order = groupedOrders[email];
            return {
              image: "",
              name: order.name,
              email: email,
              amount: order.totalSpending.toFixed(2),
              commission: calculateCommission(order.totalSpending),
            };
          }
        );

        setTableData(updatedTableData);

        const pendingRecords = orderData.filter(
          (data) => data.financial_status.trim().toLowerCase() === "pending"
        );
        const paidRecords = orderData.filter(
          (data) => data.financial_status.trim().toLowerCase() === "paid"
        );

        const groupedByDate = referral.reduce((acc, item) => {
          // Extract date part (YYYY-MM-DD) from created_at
          const date = item.created_at.split('T')[0];
          if (!acc[date]) {
            acc[date] = []; // Initialize an array for this date
          }
          acc[date].push(item);
          return acc;
        }, {});

        // Convert the grouped data into counts
        const groupedCounts = Object.values(groupedByDate).map((group: any) => group.length);

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
            if (item.name === "Total Earnings") {
              return {
                ...item,
                amount: totalEarnings.toFixed(2),
                series: totalEarning.length > 0 ? totalEarning : [0, 0, 0, 0, 0],
                percentage: totalEarningsChange
              };
            }
            if (item.name === "Pending Earnings") {
              return {
                ...item,
                amount: pendingEarnings.toFixed(2),
                series: pendingEarning.length > 0 ? pendingEarning : [0, 0, 0, 0, 0],
                percentage: pendingEarningsChange
              };
            }
            if (item.name === "Total Referrals") {
              const currentWeekCount = referral?.length || 0; // Handle null/undefined
              const pastWeekCount = pastWeekReferral?.length || 0; // Handle null/undefined

              const percentage =
                pastWeekCount === 0
                  ? currentWeekCount > 0
                    ? '100%' // If past week is 0 and current week has data
                    : '0%' // If both past week and current week have no data
                  : ((currentWeekCount - pastWeekCount) / pastWeekCount) * 100;

              return {
                ...item,
                amount: currentWeekCount,
                series: groupedCounts.length > 0 ? groupedCounts : [0, 0, 0, 0, 0],
                percentage: percentage,
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

  const handleFetchData = () => {
    if (currentDateRange && compareDateRange) {
      fetchOrders(currentDateRange[0], compareDateRange[0]);
    }
  };

  useEffect(() => {
    if (currentDateRange && compareDateRange) {
      handleFetchData();
    }
  }, [currentDateRange, compareDateRange]);

  const filteredData = tableData.filter(
    (item) =>
      item.name?.trim() !== "" &&
      item.email?.trim() !== "" &&
      item.amount?.trim() !== "" &&
      item.commission?.trim() !== ""
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  return (
    <>
      <main
        // style={{ height: "calc(100vh - 70px)" }}
        className="flex flex-col w-full gap-5 border-l-none md:border-l-4 border-t-4 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] bg-[#FCFCFC] p-4 md:p-8 overflow-auto custom-scrollbar"
      >
        {loading && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="loader"></div>
          </div>
        )}
        <div className="flex flex-col md:flex-row w-full justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center justify-center">
              <Image src="/svgs/Union.svg" width={20} height={20} alt="union" />
              <h1 className="flex w-full text-[#454545] font-bold">
                Commercive Partners
              </h1>
            </div>
            <p className="text-[#A59CBB]">
              Earn{" "}
              <span className="text-[#4F11C9] font-semibold underline">
                1% comission
              </span>{" "}
              on all referral orders placed through Commercive
            </p>
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              color: "white",
              paddingX: 4,
              paddingY: 0.5,
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              backgroundColor: "#4F12CA",
              boxShadow: "none",
              textTransform: "capitalize",
              border: "1px solid #4F12CA",
              "&:hover": {
                backgroundColor: "#4F12CA",
              },
            }}
            onClick={handleAffiliateClick}
          >
            {loading ? "Generating..." : "Affiliate Link"}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex flex-col md:flex-row gap-2">
            <div style={{ position: "relative" }}>
              {/* Input Field */}
              <input
                style={{
                  width : "160px",
                  border: "2px solid #EBEBEB",
                  boxShadow: "none",
                  borderRadius: "5px",
                  backgroundColor: "transparent",
                  color: "#454545",
                }}
                type="text"
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
                className="border p-2 pl-8 w-full text-sm cursor-pointer"
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
                    <Button
                      onClick={() => setShowCurrentDateRange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApplyCurrentDateRange}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              {/* Input Field */}
              <input
                style={{
                  width : "160px",
                  border: "2px solid #EBEBEB",
                  boxShadow: "none",
                  borderRadius: "5px",
                  backgroundColor: "transparent",
                  color: "#454545",
                }}
                type="text"
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
                className="border p-2 pl-8 w-full text-sm cursor-pointer"
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
                    <Button
                      onClick={() => setShowCompareDateRange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleApplyTmpDateRange}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row overflow-auto whitespace-nowrap custom-scrollbar">
          <FeatureCard data={chartData} page={"commercive"} dateRange={compareDateRange} />
        </div>

        <div className="flex w-full flex-col gap-3 py-2">
          <div className="flex flex-col sm:flex-row justify-between max-sm:gap-1 sm:items-center">
            <div className="flex">
              <p className="text-[#AAA2BF] pr-2">Showing</p>
              <p className="text-[#AAA2BF] font-semibold">
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                {totalItems}
              </p>
            </div>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="end"
            >
              <Button
                variant="contained"
                onClick={prevPage}
                disabled={currentPage === 1}
                sx={{
                  cursor: "pointer",
                  background: "#F4F4F7",
                  color: "black",
                  fontWeight: "bold",
                  boxShadow: "none",
                }}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={nextPage}
                disabled={currentPage >= totalPages || totalItems === 0}
                sx={{
                  cursor: "pointer",
                  background: "#F4F4F7",
                  color: "black",
                  fontWeight: "bold",
                  boxShadow: "none",
                }}
              >
                Next
              </Button>
            </Stack>
          </div>
          <div className="w-full overflow-auto custom-scrollbar">
            <div style={{ minWidth: 600 }}>
              <TableContainer
                component={Paper}
                elevation={0}
                style={{ boxShadow: "none" }}
              >
                <Table>
                  <TableHead style={{ backgroundColor: "#F4F4F7" }}>
                    <TableRow>
                      <TableCell
                        style={{
                          width: "30%",
                          color: "#454545",
                          fontWeight: "600",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "black", fontWeight: "bold" }}
                        >
                          User
                        </Typography>
                      </TableCell>
                      <TableCell
                        style={{
                          width: "50%",
                          color: "#454545",
                          fontWeight: "600",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "black", fontWeight: "bold" }}
                        >
                          Amount Spent
                        </Typography>
                      </TableCell>
                      <TableCell
                        style={{
                          width: "20%",
                          color: "#454545",
                          fontWeight: "600",
                          textAlign: "end",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ color: "black", fontWeight: "bold" }}
                        >
                          Commission
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <TableRow
                          key={index}
                          style={{ border: "1px solid #F4F4F7" }}
                        >
                          <TableCell>
                            <div style={{ display: "flex", gap: "16px" }}>
                              <div
                                style={{
                                  backgroundColor: "#F4F4F7",
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "8px",
                                }}
                              >
                                {item.image}
                              </div>
                              <div>
                                <Typography
                                  variant="body1"
                                  style={{
                                    color: "#454545",
                                    fontWeight: "600",
                                  }}
                                >
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  style={{ color: "#A8A8A9" }}
                                >
                                  {item.email}
                                </Typography>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell
                            style={{ color: "#454545", fontWeight: "600" }}
                          >
                            ${item.amount}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "#47A83C",
                              fontWeight: "600",
                              textAlign: "end",
                            }}
                          >
                            ${item.commission}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          style={{
                            textAlign: "center",
                            padding: "16px",
                            color: "#A8A8A9",
                          }}
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>
        {isModalOpen && (
          <CustomModal maxWidth={"w-max"}>
            <div className="flex flex-col rounded p-2 gap-4">
              <div className="flex justify-between">
                <p className="text-xl font-semibold">Share</p>
                <MdOutlineClose size={24} onClick={closeModal} />
              </div>
              <p className="text-sm">
                Copy the link and send it to your friends.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <InputField
                  name="referralLink"
                  placeholder=""
                  type="text"
                  className="!h-10 !text-[#929292] text-sm"
                  label={""}
                  value={referralLink}
                  onChange={handleReferralLinkChange}
                  bgColor={"#F5F5F5"}
                  boxBorder={"border-transparent"}
                  readOnly
                />
                <Tooltip
                  title={tooltipMessage}
                  open={isTooltipOpen}
                  arrow
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                >
                  <div>
                    <CustomButton
                      label="Copy"
                      className="w-max"
                      callback={handleReferralLinkCopy}
                    />
                  </div>
                </Tooltip>
              </div>
              <div className="flex flex-col bg-[#F5F5F5] border px-4 py-6 rounded-lg gap-3">
                <div className="flex justify-between items-center">
                  <p className="font-bold">Text Preview</p>
                  <Tooltip
                    title={tooltipInfoMessage}
                    open={isInfoTooltipOpen}
                    arrow
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                  >
                    <div>
                      <CustomButton
                        label="Copy"
                        className="w-max !bg-transparent !text-[#4F11C9]"
                        callback={handleLinkInfoCopy}
                        prefixIcon={<BsCopy size={14} color="#4F11C9" />}
                      />
                    </div>
                  </Tooltip>
                </div>
                <p className="max-w-[500px] text-sm">
                  Hey! I just started using this fantastic Order Tracking App
                  that keeps me updated on all my deliveries. It’s super
                  convenient and saves me so much time! If you sign up with my
                  link, we both get exclusive discounts on our next orders.
                  Check it out!
                  <br />
                  {referralLink}
                </p>
              </div>
            </div>
          </CustomModal>
        )}
      </main>
    </>
  );
}
