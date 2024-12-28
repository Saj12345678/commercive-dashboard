"use client";
import SparklineChart from "@/components/charts/spartLineChart";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";
import { FaArrowDown } from "react-icons/fa6";
import { Table } from "@chakra-ui/react"
import { PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "@/components/ui/pagination";
import { MdOutlineCalendarToday } from "react-icons/md";
import { createClient } from "./utils/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import FeatureCard from "@/components/feature-card";
interface User {
  id?: string,
  referral_code?: string
}

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [compareDate, setCompareDate] = useState<Date | null>(oneWeekAgo);
  const [showDatePicker, setShowDatePicker] = useState<"today" | "compare" | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
  const [tableData, setTableData] = useState([{ image: "", name: "", email: "", amount: "", commission: "" }]);

  // Function to calculate total earnings
  const calculateEarnings = (orders: any, weekOffset = 0, status = 'paid') => {
    const totalEarning = orders.reduce((total: number, order: any) => {
      if (order.financial_status === status) {
        total += parseFloat(order.sub_total_price);
      }
      return total;
    }, 0);
    return totalEarning;
  }

  const calculateCommission = (totalSpending: any) => {
    const commissionRate = 0.01; 
    return (totalSpending * commissionRate).toFixed(2);
  };

  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const groupAndSumByDate = (orders: any) => {
    const grouped = orders.reduce((acc: any, order: any) => {
      const date = new Date(order.created_at).toISOString().split('T')[0]; 
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
            new Date(item.date).toISOString().split('T')[0],
            item.total
        ])
    );

    const totalsArray = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const formattedDate = date.toISOString().split('T')[0];
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
        .lte("created_at", formattedEndDate);

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
              acc[order.customer_email] = { totalSpending: 0, name: order.customer_name };
            }
            acc[order.customer_email].totalSpending += parseFloat(order.sub_total_price);
          }
          return acc;
        }, {});

        // Prepare table data based on grouped orders
        const updatedTableData = Object.keys(groupedOrders).map((email, index) => {
          const order = groupedOrders[email];
          return {
            image: "", 
            name: order.name,
            email: email,
            amount: order.totalSpending.toFixed(2), 
            commission: calculateCommission(order.totalSpending), 
          };
        });

        setTableData(updatedTableData);

        const pendingRecords = orderData.filter((data) => data.financial_status === 'pending');
        const paidRecords = orderData.filter((data) => data.financial_status === 'paid');

        const totalEarningsChart = groupAndSumByDate(pendingRecords);
        const pendingEarningsChart = groupAndSumByDate(paidRecords);
        console.log({totalEarningsChart , formattedStartDate, formattedEndDate, pendingEarningsChart})
        const totalEarning = getTotalsBetweenDates({chartData:totalEarningsChart , formattedStartDate, formattedEndDate});
        const pendingEarning = getTotalsBetweenDates({chartData: pendingEarningsChart, formattedStartDate, formattedEndDate});
                
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
            if(item.name === "Total Referrals") {
              return {
                ...item,
                amount: referral?.length,
              }
            }
            return item;
          });
        });
        console.log("Fetched orders:", orderData);
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
      if (selectedDate && (selectedDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) > 7) {
        toast.warning("Maximum date range is 7 days.");
        return;
      }
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

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log(user, "fvd")

      if (!user?.id) {
        router.push("/login");
      }
    };

    fetchUser();
  }, []);

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
        console.log(error)
        toast.error( "Unable to fetch referral code.");
        return;
      }

      const referralLink = `${process.env.NEXT_PUBLIC_CLIENT_URL}/signUp?referral=${data.referral_code}`;

      await navigator.clipboard.writeText(referralLink);

      toast.success("Affiliate link copied to clipboard!");
    } catch (err) {
      toast.error("Something went wrong.");
      console.error("Affiliate link error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main   style={{ height: 'calc(100vh - 60px)' }}
    className="flex flex-col w-full gap-5 border-l-4 border-t-4 border-[#F4F4F7] rounded-tl-[24px] bg-[#FCFCFC] p-8 overflow-auto custom-scrollbar">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="loader"></div>
        </div>
      )}
      <div className="flex flex-col md:flex-row w-full justify-between">
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
          backgroundColor="#4F11C9"
          color="white"
          className="px-4 py-1 rounded-md font-semibold"
          loadingText="Generating..."
          onClick={handleAffiliateClick}
        >
          Affiliate Link
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex items-center">
          <Button
            type="button"
            onClick={() => {
              const dateInput = document.getElementById(
                "datePicker"
              ) as HTMLInputElement;
              dateInput?.showPicker();
              setShowDatePicker(showDatePicker === "today" ? null : "today");
            }}
            className="relative px-4 py-1 bg-[#FFF] text-[#454545] border-2 border-[#F4F4F7] font-semibold rounded-md flex items-center gap-2"
          >
            <input
              id="datePicker"
              type="date"
              max={today.toISOString().split("T")[0]}
              defaultValue={today.toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="opacity-0 !max-w-0 z-10"
            />
            <MdOutlineCalendarToday size={15} color="#4A4A4A" />
            {selectedDate && isToday(selectedDate)
              ? "Today"
              : selectedDate?.toDateString() || "Today"}
          </Button>
        </div>

        <div className="relative flex items-center">
          <Button
            type="button"
            onClick={() => {
              const dateInput1 = document.getElementById(
                "datePicker1"
              ) as HTMLInputElement;
              dateInput1?.showPicker();
              setShowDatePicker(
                showDatePicker === "compare" ? null : "compare"
              );
            }}
            className="flex w-full h-auto px-4 py-1 bg-[#FFF] text-[#454545] border-2 border-[#F4F4F7] font-semibold rounded-md"
          >
            <MdOutlineCalendarToday size={15} color="#4A4A4A" />
            <input
              id="datePicker1"
              type="date"
              max={today.toISOString().split("T")[0]}
              defaultValue={oneWeekAgo.toISOString().split("T")[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="opacity-0 !w-0 z-10"
            />
            <span className="w-full whitespace-normal text-wrap text-left">
            {compareDate
              ? `Compare to ${compareDate.toDateString()}`
              : "Compare to ..."}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row w-full gap-4 mt-2">
        {/* {chartData?.map((data, index) => {
          return (
            <div className="flex basis-1 flex-1" key={index}>
              <div className="flex flex-col w-full border-2 border-[#EBEBEB] rounded-lg pl-6 py-4 pr-4 flex-0 overflow-hidden">
                <div className="flex w-full flex-col gap-8">
                  <div className="flex w-full flex-wrap justify-between items-center">
                    <h2
                      className={`text-[#454545] font-semibold ${
                        index === 3 ? "mt-0" : "mt-3"
                      }`}
                    >
                      {data.name}
                    </h2>
                    {data.name === "Wallet" && (
                      <div className="flex border bg-[#F4F4F7] text-[#3D3C3C] font-semibold rounded-md p-2">
                        Withdrawal
                      </div>
                    )}
                  </div>
                  <div className="flex w-full gap-2 items-end">
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <p className="font-semibold text-[#454545] text-[18px]">
                          {index === 0 ? data.amount : "$" + data.amount}
                        </p>
                        <div
                          className="rounded-full w-[26px] h-[26px] flex justify-center items-center"
                          style={{ backgroundColor: data.bgColor }}
                        >
                          {index === 3 ? (
                            <FaArrowDown color={data.color} fontWeight="bold" />
                          ) : (
                            <FaArrowUp color={data.color} fontWeight="bold" />
                          )}
                        </div>
                        <p
                          className="font-semibold"
                          style={{ color: data.color }}
                        >
                          {data.percentage}
                        </p>
                      </div>
                      <p className="text-[#B1B0B0]">compared to last week</p>
                    </div>
                    <div className="flex">
                      <div className="block w-full h-full overflow-hidden max-w-[100px]">
                        <SparklineChart
                          data={data.series}
                          stokeColor={data.color}
                          fillColor={data.bgColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })} */}
        <FeatureCard data={chartData}/>

      </div>

      <div className="flex w-full flex-col gap-3 py-2">
        <div className="flex flex-col sm:flex-row justify-between max-sm:gap-1 sm:items-center">
          <div className="flex">
            <p className="text-[#AAA2BF] pr-2">Showing</p>
            <p className="text-[#AAA2BF] font-semibold">
              {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </p>
          </div>

          <PaginationRoot
            count={totalPages}
            pageSize={itemsPerPage}
            className="flex gap-3"
          >
            <PaginationPrevTrigger
              onClick={prevPage}
              disabled={currentPage === 1}
            />
            <PaginationNextTrigger
              onClick={nextPage}
              disabled={currentPage >= totalPages || totalItems === 0}
            />
          </PaginationRoot>
        </div>
        <div className="w-full overflow-auto custom-scrollbar">
        <div className="min-w-[600px]">
        <Table.Root
          variant="outline"
          className="!border-none rounded-lg w-full"
        >
          <Table.ColumnGroup>
            <Table.Column htmlWidth="30%" />
            <Table.Column htmlWidth="50%" />
            <Table.Column htmlWidth="20%" />
          </Table.ColumnGroup>
          <Table.Header className="bg-[#F4F4F7]">
            <Table.Row>
              <Table.ColumnHeader className="text-[#454545] font-semibold">
                User
              </Table.ColumnHeader>
              <Table.ColumnHeader className="text-[#454545] font-semibold">
                Amount Spent
              </Table.ColumnHeader>
              <Table.ColumnHeader
                className="text-[#454545] font-semibold"
                textAlign="end"
              >
                Commission
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <Table.Row
                  key={index}
                  className="border-b border-2 border-[#E2E2E5]"
                >
                  <Table.Cell className="flex gap-4">
                    <div className="bg-[#F4F4F7] w-12 h-12 rounded-md m-1">
                      {item.image}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[#454545] font-semibold">
                        {item.name}
                      </p>
                      <p className="text-[#A8A8A9]">{item.email}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-[#454545] font-semibold">
                    ${item.amount}
                  </Table.Cell>
                  <Table.Cell className="text-[#47A83C] font-semibold text-end">
                    ${item.commission}
                  </Table.Cell>
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <Table.Cell
                  colSpan={3}
                  className="text-center py-4 text-[#A8A8A9]"
                >
                  No data available
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
        </div>
        </div>
      </div>
    </main>
  );
}
