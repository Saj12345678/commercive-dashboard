"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import CustomButton from "@/components/ui/custom-button";
import CustomTable from "@/components/ui/custom-table";

export default function Ticket() {
  const supabase = createClient();
  const [ticketsData, setTicketsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  let limit = 5;

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    columns: [
      {
        field: "name",
        headerName: "Name",
        customRender: (row: any) => <span>{row.name}</span>,
      },
      {
        field: "email",
        headerName: "Email",
        customRender: (row: any) => <span>{row.email}</span>,
      },
      {
        field: "store_url",
        headerName: "Store URL",
        customRender: (row: any) => <span>{row.store_url}</span>,
      },
      {
        field: "issue",
        headerName: "Issue",
        customRender: (row: any) => <span>{row.issue}</span>,
      },
    ],
    rows: ticketsData || [],
  };

  const fetchTicketsData = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * limit;
      const { data, count, error }: any = await supabase
        .from("issues")
        .select("*", { count: "exact" }) // Fetch data with exact count
        .range(start, start + limit - 1);

      if (error) {
        console.error("Error fetching issues data:", error);
      } else {
        setTicketsData(data || []);
        setTotalRecords(count || 0); // Update total records
      }
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
    fetchTicketsData(page);
  }, [page]);

  return (
    <div className="flex flex-col w-full gap-5">
      <h1 className="text-2xl text-white">Tickets</h1>
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
      />
    </div>
  );
}
