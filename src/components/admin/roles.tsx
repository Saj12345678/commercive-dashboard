"use client";

import { useEffect, useState } from "react";
import CustomTable from "@/components/ui/custom-table";
import CustomButton from "../ui/custom-button";
import { createClient } from "@/app/utils/supabase/client";
import CustomModal from "../ui/modal";
import { toast } from "react-toastify";
import { MenuItem, Select } from "@mui/material";
import { FiPlus } from "react-icons/fi";

export default function Roles() {
  const supabase = createClient();
  const [usersData, setUsersData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  let limit = 10;
  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
  ];
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);

  const handleAddNewOpenModal = () => {
    setAddNewModalOpen(true);
  };

  const closeAddNewModal = () => {
    setAddNewModalOpen(false);
    setSelectedRole(null);
  };

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };
  const handleCheckboxClick = (id: number) => {
    handleAddNewOpenModal();
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(id)
        ? prevSelectedUsers.filter((userId) => userId !== id)
        : [...prevSelectedUsers, id]
    );
  };

  const handleRoleUpdate = async () => {
    setLoading(true);
    try {
      if (!selectedRole) {
        toast.error("Please select a role.");
        return;
      }
      const updates = selectedUsers.map((userId) =>
        supabase
          .from("user")
          .update({ role: selectedRole.value })
          .eq("id", userId)
      );
      await Promise.all(updates);

      toast.success("Roles updated successfully.");
      fetchUsersData(page);
      closeAddNewModal();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Failed to update roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    actionPresent: true,
    actionList: ["checkbox"],
    columns: [
      {
        field: "email",
        headerName: "Email",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "referral_code",
        headerName: "Referral Code",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.referral_code}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "first_name",
        headerName: "First Name",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.first_name}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "last_name",
        headerName: "Last Name",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.last_name}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "user_name",
        headerName: "User Name",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.user_name}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "phone_number",
        headerName: "Phone Number",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.phone_number}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "role",
        headerName: "Role",
        customRender: (row: any) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.role}</p>
              </div>
            </div>
          );
        },
      },
    ],
    rows: usersData || [],
  };

  const fetchUsersData = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * limit;
      const { data, count, error }: any = await supabase
        .from("user")
        .select("*", { count: "exact" }) // Fetch data with exact count
        .range(start, start + limit - 1);

      if (error) {
        console.error("Error fetching referrals data:", error);
      } else {
        setUsersData(
          data?.map((row: { id: any }) => ({ ...row, id: row.id })) || []
        );
        setTotalRecords(count || 0); // Update total records
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Next" and "Previous" actions
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

  // Fetch data whenever the page changes
  useEffect(() => {
    fetchUsersData(page);
  }, [page]);

  return (
    <div className="flex flex-col w-full gap-5">
        <h1 className="text-2xl text-white">Roles</h1>
        {addNewModalOpen && (
          <CustomModal onClose={closeAddNewModal} maxWidth={"max-w-[800px]"}>
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Update Roles</h2>
              <div className="flex flex-col gap-4">
                <Select
                  value={selectedRole?.value || ""}
                  onChange={(event) =>
                    setSelectedRole(
                      roleOptions.find(
                        (role) => role.value === event.target.value
                      )
                    )
                  }
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <div className="flex justify-end w-full">
                <CustomButton
                  label={"Save"}
                  callback={handleRoleUpdate}
                  className="bg-[#342d5f] text-[#5e568f]"
                  interactingAPI={loading}
                />
              </div>
            </div>
          </CustomModal>
        )}
        <div className="flex flex-col sm:flex-row w-full justify-between gap-3">
        
        <div className="flex">
          <CustomButton
            label={"Add New"}
            className="w-max"
            prefixIcon={<FiPlus size={24} />}
          />
        </div>
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
