"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdOutlineCalendarToday } from "react-icons/md";
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
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "../home/home.css";

export default function CommercivePartners() {
  const supabase = createClient();
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
  const [currentPage, setCurrentPage] = useState(1);
  const [referralLink, setReferralLink] = useState("");
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
            if (item.name === "Total Earnings") {
              return {
                ...item,
                amount: totalEarnings.toFixed(2),
                series: totalEarning,
              };
            }
            if (item.name === "Pending Earnings") {
              return {
                ...item,
                amount: pendingEarnings.toFixed(2),
                series: pendingEarning,
              };
            }
            if (item.name === "Total Referrals") {
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

  const filteredData = tableData.filter(
    (item) =>
      item.name?.trim() !== "" &&
      item.email?.trim() !== "" &&
      item.amount?.trim() !== "" &&
      item.commission?.trim() !== ""
  );

  return (
    <>
      <main
        style={{ height: "calc(100vh - 60px)" }}
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

        <div className="flex flex-col sm:flex-row gap-0 sm:gap-3">
        <div className="flex flex-col md:flex-row">

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div className="flex items-center gap-2">
              <Button
                className="!rounded-md !font-semibold gap-2 !bg-transparent !border-2 !border-[#EBEBEB] !shadow-none !capitalize"
                variant="outlined"
                onClick={() => {
                  setShowDatePicker("today");
                }}
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
        </div>

        <div className="flex flex-row overflow-auto whitespace-nowrap custom-scrollbar">
          <FeatureCard data={chartData} />
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
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
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
          <CustomModal onClose={closeModal}>
            <div className="flex border border-[#F4F4F7] rounded p-2 mt-2">
              {referralLink}
            </div>
          </CustomModal>
        )}
      </main>
    </>
  );
}
