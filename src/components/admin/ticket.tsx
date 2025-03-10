"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import CustomButton from "@/components/ui/custom-button";
import CustomTable from "@/components/ui/custom-table";
import { toast } from "react-toastify";
import CustomModal from "../ui/modal";
import { MenuItem, Select } from "@mui/material";

export default function Ticket() {
  const supabase = createClient();
  const [ticketsData, setTicketsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [selectedConfirmed, setSelectedConfirmed] = useState<any>(null);
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  let limit = 5;
  const confirmOptions = [
    { value: "true", label: "Yes" },
    { value: "false", label: "No" },
  ];

  const handleAddNewOpenModal = () => {
    setAddNewModalOpen(true);
  };

  const closeAddNewModal = () => {
    setAddNewModalOpen(false);
    setSelectedConfirmed(null);
  };

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
      {
        field: "confirmed",
        headerName: "Confirmed",
        customRender: (row: any) => (
          <span>{row.confirmed ? "True" : "False"}</span>
        ),
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

  const handleCheckboxClick = async (id: number) => {
    handleAddNewOpenModal();
    setSelectedTickets((prevSelectedTickets) =>
      prevSelectedTickets.includes(id)
        ? prevSelectedTickets.filter((ticketId) => ticketId !== id)
        : [...prevSelectedTickets, id]
    );
  };

  const handleTicketUpdate = async () => {
    setLoading(true);
    try {
      if (!selectedConfirmed) {
        toast.error("Please select a value.");
        return;
      }
      const updates = selectedTickets.map((ticketId) =>
        supabase
          .from("issues")
          .update({ confirmed: selectedConfirmed.value })
          .eq("id", ticketId)
      );

      await Promise.all(updates);

      toast.success("Confirm successfully.");
      fetchTicketsData(page);
      closeAddNewModal();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Failed to update roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <h1 className="text-2xl text-white">Tickets</h1>
      {addNewModalOpen && (
        <CustomModal onClose={closeAddNewModal} maxWidth={"max-w-[800px]"}>
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Confirmed</h2>
            <div className="flex flex-col gap-4">
              <Select
                value={selectedConfirmed?.value || ""}
                onChange={(event) =>
                  setSelectedConfirmed(
                    confirmOptions.find(
                      (confirm) => confirm.value === event.target.value
                    )
                  )
                }
              >
                {confirmOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div className="flex justify-end w-full">
              <CustomButton
                label={"Save"}
                callback={handleTicketUpdate}
                className="bg-[#342d5f] text-[#5e568f]"
                interactingAPI={loading}
              />
            </div>
          </div>
        </CustomModal>
      )}
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
