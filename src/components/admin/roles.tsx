"use client";

import { ChangeEvent, useEffect, useState } from "react";
import CustomTable from "@/components/ui/custom-table";
import CustomButton from "../ui/custom-button";
import { createClient } from "@/app/utils/supabase/client";
import CustomModal from "../ui/modal";
import { toast } from "react-toastify";
import { InputLabel, MenuItem, Select } from "@mui/material";
import { FiPlus } from "react-icons/fi";
import InputField from "../ui/custom-inputfild";

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
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const initialFormData = {
    email: "",
    first_name: "",
    last_name: "",
    user: "",
    phone_number: "",
    role: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const initialError = {
    email: "",
    first_name: "",
    last_name: "",
    user: "",
    phone_number: "",
    role: "",
  };
  const [errors, setErrors] = useState(initialError);

  const handleAddNewUserChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>,
    updatedField: Partial<typeof formData>
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedField,
    }));
    setErrors((prev) => ({
      ...prev,
      ...Object.keys(updatedField).reduce((acc, key) => {
        acc[key as keyof typeof formData] = "";
        return acc;
      }, {} as typeof errors),
    }));
  };

  const handleRoleOpenModal = () => {
    setRoleModalOpen(true);
  };

  const handleNewOpenModal = () => {
    setAddNewModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedRole(null);
  };

  const closeNewModal = () => {
    setAddNewModalOpen(false);
  };

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };
  const handleCheckboxClick = (id: number) => {
    handleRoleOpenModal();
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
      closeRoleModal();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Failed to update roles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Custom validation
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData?.user?.trim()) newErrors.user = "User name is required.";

    if (!formData?.email?.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData?.first_name?.trim())
      newErrors.first_name = "First name is required.";
    if (!formData?.last_name?.trim())
      newErrors.last_name = "Last name is required.";

    if (!formData?.phone_number?.trim()) {
      newErrors.phone_number = "Phone number is required.";
    } else if (!/^\d{1,11}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be up to 11 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (id: any) => {
    if (validateForm()) {
      setLoading(true);
      try {
        let data, error;

        ({ data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: "123456789",
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              user_name: formData.user,
              phone_number: Number(formData.phone_number),
              role: formData.role || "user",
            },
          },
        }));
        if (error instanceof Error) {
          toast(error.message || "Failed to save data. Please try again.");
        } else {
          toast(id ? "Data updated successfully" : "Data added successfully");
          fetchUsersData(page);
        }
        setEditData({});
      } catch (error: unknown) {
        console.error("Unexpected error:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      }
      setLoading(false);
      setFormData(initialFormData);
      setAddNewModalOpen(false);
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
      {roleModalOpen && (
        <CustomModal onClose={closeRoleModal} maxWidth={"max-w-[800px]"}>
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
      {addNewModalOpen && (
        <CustomModal onClose={closeNewModal} maxWidth={"max-w-[800px]"}>
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Add New</h2>
            <div className="flex flex-col gap-6 max-sm:h-full max-sm:max-h-[350px] custom-scrollbar overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="email"
                    placeholder="Enter your email"
                    type="email"
                    className="mt-[8px]"
                    label={`Email`}
                    value={formData.email || ""}
                    onChange={(e: any) =>
                      handleAddNewUserChange(e, { email: e.target.value })
                    }
                  />
                  {errors?.email && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.email}
                    </p>
                  )}
                </div>
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="first_name"
                    placeholder="Enter First name"
                    type="text"
                    className="mt-[8px]"
                    label={`First Name`}
                    value={formData.first_name || ""}
                    onChange={(e: any) =>
                      handleAddNewUserChange(e, { first_name: e.target.value })
                    }
                  />
                  {errors?.first_name && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.first_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="last_name"
                    placeholder="Enter last name"
                    type="text"
                    className="mt-[8px]"
                    label={`Last Name`}
                    value={formData.last_name || ""}
                    onChange={(e: any) =>
                      handleAddNewUserChange(e, { last_name: e.target.value })
                    }
                  />
                  {errors?.last_name && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.last_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="user"
                    placeholder="Enter user name"
                    type="text"
                    className="mt-[8px]"
                    label={`User Name`}
                    value={formData.user || ""}
                    onChange={(e: any) =>
                      handleAddNewUserChange(e, { user: e.target.value })
                    }
                  />
                  {errors?.user && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.user}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="phone_number"
                    placeholder="Enter Phone Number"
                    type="text"
                    className="mt-[8px]"
                    label={`Phone Number`}
                    value={formData.phone_number || ""}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                      if (value.length <= 11) {
                        handleAddNewUserChange(e, { phone_number: value });
                      }
                    }}
                  />
                  {errors?.phone_number && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.phone_number}
                    </p>
                  )}
                </div>
                <div className="flex flex-col relative w-full">
                  <InputLabel>Role</InputLabel>
                  <select
                    name="Role"
                    id=""
                    className="border border-color-[#D4D77D] border-opacity-5 p-[9px] mt-2.5 rounded-md focus-within:outline-none"
                    value={formData.role || ""}
                    onChange={(e) =>
                      handleAddNewUserChange(e, { role: e.target.value })
                    }
                  >
                    {roleOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="focus-within:outline-none"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end w-full">
              <CustomButton
                label={"Save"}
                callback={() => {
                  handleSave(editData.id ? editData.id : undefined);
                }}
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
            callback={handleNewOpenModal}
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
