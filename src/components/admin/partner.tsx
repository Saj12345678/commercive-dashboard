"use client";

import CustomTable from "@/components/ui/custom-table";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import CustomButton from "../ui/custom-button";
import { MdOutlineFileDownload } from "react-icons/md";
import { createClient } from "@/app/utils/supabase/client";
import { FiPlus } from "react-icons/fi";
import CustomModal from "../ui/modal";
import InputField from "../ui/custom-inputfild";

const defaultHeaders = [
  "user_name",
  "referred_by",
  "reffered_by_id",
  "store_name",
  "commission_rate",
  "order_number",
  "quantity_of_order",
  "total_commission",
  "order_time",
  "customer_number",
  "email",
];

export default function Partner() {
  const supabase = createClient();
  const [totalPages, setTotalPages] = useState(1);
  const [referralsData, setReferralsData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  let limit = 5;

  console.log(referralsData,'hhjj');
  
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const initialFormData = {
    user: "",
    email: "",
    store_name: "",
    commission_rate: "",
    order_number: "",
    quantity_of_order: "",
    total_commission: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const initialError = {
    user: "",
    email: "",
    store_name: "",
    commission_rate: "",
    order_number: "",
    quantity_of_order: "",
    total_commission: "",
  };
  const [errors, setErrors] = useState(initialError);

  // Handle input changes
  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    updatedField: Partial<typeof formData>
  ) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedField,
    }));
    setErrors((prev) => ({
      ...prev,
      ...Object.keys(updatedField).reduce((acc, key) => {
        acc[key as keyof typeof formData] = ""; // Clear the error for the updated field
        return acc;
      }, {} as typeof errors),
    }));
  };

  // Custom validation
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.user.trim()) newErrors.user = "User name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.store_name.trim())
      newErrors.store_name = "Store name is required.";
    if (!formData.commission_rate.trim()) {
      newErrors.commission_rate = "Commission rate is required.";
    } else if (isNaN(Number(formData.commission_rate))) {
      newErrors.commission_rate = "Commission rate must be a number.";
    }
    if (!formData.order_number.trim())
      newErrors.order_number = "Order number is required.";
    if (!formData.quantity_of_order.trim()) {
      newErrors.quantity_of_order = "Order QTY is required.";
    } else if (isNaN(Number(formData.quantity_of_order))) {
      newErrors.quantity_of_order = "Order QTY must be a number.";
    }
    if (!formData.total_commission.trim()) {
      newErrors.commission = "Commission is required.";
    } else if (isNaN(Number(formData.total_commission))) {
      newErrors.commission = "Commission must be a number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSave = async () => {
    if (validateForm()) {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
  
      try {
        // Insert form data into Supabase
        const { data, error } = await supabase.from("referrals").insert([
          {
            user_name: formData.user,
            email: formData.email,
            store_name: formData.store_name,
            commission_rate: Number(formData.commission_rate),
            order_number: formData.order_number,
            quantity_of_order: Number(formData.quantity_of_order),
            total_commission: Number(formData.total_commission),
          },
        ]);
  
        if (error) {
          console.error("Error inserting data:", error.message);
          setErrorMsg("Failed to add data. Please try again.");
        } else {
          console.log("Data added successfully:", data);
          setSuccessMsg("Data added successfully!");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setErrorMsg("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
  
      // Reset form and close modal
      setFormData(initialFormData);
      setAddNewModalOpen(false);
    }
  };
  

  const handleAddNewOpenModal = () => {
    setAddNewModalOpen(true);
  };

  const closeAddNewModal = () => {
    setAddNewModalOpen(false);
  };

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };

  const uploadToSupabase = async (data: any[]) => {
    console.log(data, "lllouy");

    setIsLoading(true);
    try {
      const { data: insertedData, error } = await supabase
        .from("referrals")
        .insert(data);
      console.log(insertedData, "lllkkkk");

      if (error) {
        console.error(error.message);
        setErrorMsg("Failed to upload data to Supabase.");
      } else {
        setSuccessMsg(`Successfully uploaded rows to Supabase.`);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true, // Ensure empty lines are not skipped
        complete: function (results) {
          const data = results.data;
          // Filter out rows with all empty values (empty rows)
          const filteredData = data.filter((row: any) =>
            Object.values(row).some((value) => value !== null)
          );
          uploadToSupabase(filteredData);
        },
      });
    } else if (fileExtension === "xls" || fileExtension === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: defaultHeaders,
          blankrows: false,
          defval: "",
        });
        uploadToSupabase(parsedData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMsg("Please select a valid CSV, XLS, or XLSX file.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file, "uuuu");

    if (file) {
      console.log("iup");

      setErrorMsg(null);
      handleFileUpload(file); // Your file upload logic
    } else {
      setErrorMsg("Please select a valid file.");
    }
  };
  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    columns: [
      {
        field: "user",
        headerName: "User",
        customRender: (row: any) => {
          return row?.user ? `${row?.userFName} ${row?.userLName}` : "-";
        },
      },
      {
        field: "time-created",
        headerName: "Time Created",
      },
      {
        field: "store-name",
        headerName: "Store Name",
      },
      {
        field: "commission-rate",
        headerName: "Commission Rate",
      },
      {
        field: "order-number",
        headerName: "Order Number",
      },
      {
        field: "order-qut",
        headerName: "Order QTY",
      },
      {
        field: "commission",
        headerName: "Commission",
      },
    ],
    rows: [],
    pagination: {
      totalResults: 0,
      totalPages: totalPages,
      currentPage: page,
    },
  };

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data, error }:any = await supabase
          .from("referrals")
          .select("*"); // Adjust columns if needed

        if (error) {
          console.error("Error fetching referrals:", error.message);
          setErrorMsg("Failed to fetch referrals.");
        } else {
          setReferralsData(data || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setErrorMsg("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [supabase]);

  return (
    <div className="flex flex-col w-full gap-5">
      <h1 className="text-2xl text-white">Partners</h1>
      <div className="flex flex-col sm:flex-row w-full justify-between gap-3">
        <div className="flex gap-3">
          <CustomButton
            label={"Add New"}
            className="w-max"
            prefixIcon={<FiPlus size={24} />}
            callback={handleAddNewOpenModal}
          />
          <div className="flex gap-4 items-center">
            <input
              type="file"
              id="selectedFile"
              name="selectedFile"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
              onClick={(e: any) => {
                e.target.value = null;
              }}
            />
            <label
              htmlFor="selectedFile"
              className="flex cursor-pointer bg-[#4F11C9] text-[#F4F4F4] font-semibold py-2 px-4 rounded-[8px]"
            >
              <span>
                <MdOutlineFileDownload size={24} color="#F4F4F4" />
              </span>{" "}
              Upload CSV
            </label>
          </div>
        </div>
        {addNewModalOpen && (
          <CustomModal onClose={closeAddNewModal} maxWidth={"max-w-[800px]"}>
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Add New</h2>
              <div className="flex flex-col gap-6 max-sm:h-full max-sm:max-h-[350px] custom-scrollbar overflow-y-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="user"
                      placeholder="Enter user name"
                      type="text"
                      className="mt-[8px]"
                      label={`User`}
                      value={formData.user}
                      onChange={(e: any) =>
                        handleOnChange(e, { user: e.target.value })
                      }
                    />
                    {errors?.user && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.user}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      className="mt-[8px]"
                      label={`Email`}
                      value={formData.email}
                      onChange={(e: any) =>
                        handleOnChange(e, { email: e.target.value })
                      }
                    />
                    {errors?.email && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="commission_rate"
                      placeholder="Enter commission rate"
                      type="text"
                      className="mt-[8px]"
                      label={`Commission Rate`}
                      value={formData.commission_rate}
                      onChange={(e: any) =>
                        handleOnChange(e, { commission_rate: e.target.value })
                      }
                    />
                    {errors?.commission_rate && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.commission_rate}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="order_number"
                      placeholder="Enter order number"
                      type="text"
                      className="mt-[8px]"
                      label={`Order Number`}
                      value={formData.order_number}
                      onChange={(e: any) =>
                        handleOnChange(e, { order_number: e.target.value })
                      }
                    />
                    {errors?.order_number && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.order_number}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="quantity_of_order"
                      placeholder="Enter order QTY"
                      type="text"
                      className="mt-[8px]"
                      label={`Order QTY`}
                      value={formData.quantity_of_order}
                      onChange={(e: any) =>
                        handleOnChange(e, { quantity_of_order: e.target.value })
                      }
                    />
                    {errors?.quantity_of_order && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.quantity_of_order}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="store_name"
                      placeholder="Enter store name"
                      type="text"
                      className="mt-[8px]"
                      label={`Store name`}
                      value={formData.store_name}
                      onChange={(e: any) =>
                        handleOnChange(e, { store_name: e.target.value })
                      }
                    />
                    {errors?.store_name && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.store_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="commission"
                    placeholder="Enter commission"
                    type="text"
                    className="mt-[8px]"
                    label={`Commission`}
                    value={formData.total_commission}
                    onChange={(e: any) =>
                      handleOnChange(e, { total_commission: e.target.value })
                    }
                  />
                  {errors?.total_commission && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.total_commission}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end w-full">
                <CustomButton
                  label={"Save"}
                  callback={handleSave}
                  className="bg-[#342d5f] text-[#5e568f]"
                  interactingAPI={loading}
                />
              </div>
            </div>
          </CustomModal>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-[#5e568f]">Showing 1-5 of 0</p>
          <div className="flex items-center gap-3">
            <CustomButton
              label={"Previous"}
              className="bg-[#342d5f] text-[#5e568f]"
            />
            <CustomButton
              label={"Next"}
              className="bg-[#342d5f] text-[#5e568f]"
            />
          </div>
        </div>
      </div>
      <CustomTable tableConfig={tableConfig} isLoading={loading} />
    </div>
  );
}
