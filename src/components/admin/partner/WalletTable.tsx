import { createClient } from "@/app/utils/supabase/client";
import { WalletRow } from "@/app/utils/types";
import CustomButton from "@/components/ui/custom-button";
import CustomTable from "@/components/ui/custom-table";
import { useEffect, useState } from "react";

let limit = 5;

export const WalletTable = ({ triggerKey }: { triggerKey: number }) => {
  const supabase = createClient();
  const [referralsData, setReferralsData] = useState<WalletRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePagination = (curPage: number) => {
    setPage(curPage);
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

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    actionPresent: true,
    actionList: ["edit", "delete"],
    columns: [
      {
        field: "customer_number",
        headerName: "Customer",
        customRender: (row: WalletRow) => <p>{row.customer_number}</p>,
      },
      {
        field: "order_qty",
        headerName: "Order QTY",
        customRender: (row: WalletRow) => <p>{row.order_count || 0}</p>,
      },
      {
        field: "total",
        headerName: "Total Commission",
        customRender: (row: WalletRow) => {
          return (
            <p className="text-[#4aaa40]">
              ${(row.total_amount || 0).toFixed(2)}
            </p>
          );
        },
      },
    ],
    rows: referralsData || [],
  };

  const fetchReferralsData = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * limit;
      const { data, count, error } = await supabase
        .from("referral_view")
        .select("*", { count: "exact" }) // Fetch data with exact count
        .range(start, start + limit - 1);

      if (error) {
        console.error("Error fetching referrals data:", error);
      } else {
        setReferralsData(data || []);
        setTotalRecords(count || 0); // Update total records
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralsData(page);
  }, [page, triggerKey]);

  return (
    <div>
      <div className="flex justify-end items-center gap-3 w-full mb-4">
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
      <CustomTable
        tableConfig={tableConfig}
        isLoading={isLoading}
        limit={limit}
      />
    </div>
  );
};
