"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import CustomButton from "@/components/ui/custom-button";
import CustomTable from "@/components/ui/custom-table";
import { toast } from "react-toastify";

export default function Payout() {
  const supabase = createClient();
  const [payoutsData, setPayoutsData] = useState<any>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<string[]>([]);
  let limit = 5;

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    actionPresent: true,
    actionList: ["checkbox"],
    columns: [
      {
        field: "name",
        headerName: "Name",
        customRender: (row: any) => <span>{row.name ? row.name : "-"}</span>,
      },
      {
        field: "amount",
        headerName: "Amount",
        customRender: (row: any) => <span>{row.amount}</span>,
      },
      {
        field: "paypal_address",
        headerName: "Paypal Address",
        customRender: (row: any) => <span>{row.paypal_address}</span>,
      },
      {
        field: "completed",
        headerName: "Completed",
        customRender: (row: any) => (
          <span>{row.completed ? "True" : "False"}</span>
        ),
      },
    ],
    rows: payoutsData || [],
  };

  const fetchPayoutsData = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * limit;
      const {
        data: payouts,
        count,
        error: payoutError,
      } = await supabase
        .from("payouts")
        .select("*", { count: "exact" })
        .range(start, start + limit - 1);

      if (payoutError) {
        console.error("Error fetching payouts data:", payoutError);
        return;
      }

      if (!payouts || payouts.length === 0) {
        setPayoutsData([]);
        setTotalRecords(count || 0);
        return;
      }

      // Extract unique user IDs
      const userIds = [...new Set(payouts.map((payout) => payout.userId))];

      // Fetch user details
      const { data: users, error: usersError } = await supabase
        .from("user")
        .select("id, first_name, last_name")
        .in("id", userIds);

      if (usersError) {
        console.error("Error fetching user data:", usersError);
      }

      // Create a mapping of userId to full name
      const userMap = users?.reduce((acc, user) => {
        acc[user.id] = `${user.first_name} ${user.last_name}`;
        return acc;
      }, {} as Record<string, string>);

      // Merge user names into payout data
      const updatedPayouts = payouts.map((payout) => ({
        ...payout,
        name: userMap?.[payout.userId] || "Unknown",
      }));

      setPayoutsData(updatedPayouts);
      setTotalRecords(count || 0);
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (page < Math.ceil(totalRecords / limit)) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    fetchPayoutsData(page);
  }, [page]);

  const handleCheckboxClick = async (id: string) => {
    setSelectedPayout((prevSelectedPayout) => {
      const isCurrentlySelected = prevSelectedPayout.includes(id);
      const newSelectionState = !isCurrentlySelected;

      const updatedPayouts = newSelectionState
        ? [...prevSelectedPayout, id]
        : prevSelectedPayout.filter((ticketId) => ticketId !== id);

      return updatedPayouts;
    });

    const isCurrentlySelected = selectedPayout.includes(id);
    const newSelectionState = !isCurrentlySelected;

    // Update Supabase
    const { data, error }: any = await supabase
      .from("payouts")
      .update({ completed: newSelectionState })
      .eq("id", id)
      .select();

    if (data[0]?.completed) {
      toast("Payment Completed successfully.");
    } else {
      toast("Payment uncompleted successfully.");
    }
    fetchPayoutsData(page);
    if (error) {
      console.error("Error updating Supabase:", error.message);
      toast.error("Failed to update Supabase.");
    }
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <h1 className="text-2xl text-white">Payouts</h1>
      <div className="flex flex-col sm:flex-row w-full justify-end gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-[#5e568f]">
            Showing {(page - 1) * limit + 1}-
            {Math.min(page * limit, totalRecords)} of {totalRecords}
          </p>
          <div className="flex items-center gap-3">
            <CustomButton
              label={"Previous"}
              className="bg-[#342d5f] text-[#5e568f]"
              callback={handlePrevious}
              disabled={page === 1}
            />
            <CustomButton
              label={"Next"}
              className="bg-[#342d5f] text-[#5e568f]"
              callback={handleNext}
              disabled={page >= Math.ceil(totalRecords / limit)}
            />
          </div>
        </div>
      </div>

      <CustomTable
        tableConfig={tableConfig}
        isLoading={isLoading}
        limit={limit}
        showCheckbox
        onCheckboxClick={handleCheckboxClick}
      />
    </div>
  );
}
