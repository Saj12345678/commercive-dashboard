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
import { toast } from "react-toastify";

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
  const [referralsData, setReferralsData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState<any>({});
  let limit = 5;

  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const initialFormData = {
    user: "",
    email: "",
    store_name: "",
    referred_store_name: "",
    commission_rate: "",
    order_number: "",
    quantity_of_order: "",
    paypal_address: "",
    total_commission: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const initialError = {
    user: "",
    email: "",
    store_name: "",
    referred_store_name: "",
    commission_rate: "",
    order_number: "",
    quantity_of_order: "",
    paypal_address: "",
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
        acc[key as keyof typeof formData] = "";
        return acc;
      }, {} as typeof errors),
    }));
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Custom validation
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.user.trim()) newErrors.user = "User name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.store_name.trim())
      newErrors.store_name = "Store name is required.";
    if (!formData.referred_store_name.trim())
      newErrors.referred_store_name = "Referred store name is required.";
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
    if (!formData.paypal_address.trim()) {
      newErrors.paypal_address = "Commission is required.";
    } else if (isNaN(Number(formData.total_commission))) {
      newErrors.commission = "Commission must be a number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (id: any) => {
    if (validateForm()) {
      setLoading(true);
      try {
        let data, error;

        if (id) {
          // Update existing data
          ({ data, error } = await supabase
            .from("referrals")
            .update({
              user_name: formData.user,
              email: formData.email,
              store_name: formData.store_name,
              referred_store_name: formData.referred_store_name,
              commission_rate: Number(formData.commission_rate),
              order_number: formData.order_number,
              quantity_of_order: Number(formData.quantity_of_order),
              paypal_address: formData.paypal_address,
              total_commission: Number(formData.total_commission),
            })
            .eq("id", id));
        } else {
          ({ data, error } = await supabase.from("referrals").insert([
            {
              user_name: formData.user,
              email: formData.email,
              store_name: formData.store_name,
              referred_store_name: formData.referred_store_name,
              commission_rate: Number(formData.commission_rate),
              order_number: formData.order_number,
              quantity_of_order: Number(formData.quantity_of_order),
              paypal_address: formData.paypal_address,
              total_commission: Number(formData.total_commission),
            },
          ]));
        }

        if (error) {
          toast("Failed to save data. Please try again.");
        } else {
          toast(id ? "Data updated successfully:" : "Data added successfully:");
          fetchReferralsData(page);
        }
        setEditData({});
      } catch (error) {
        console.error("Unexpected error:", error);
      }
      setLoading(false);
      setFormData(initialFormData);
      setAddNewModalOpen(false);
    }
  };

  const handleAddNewOpenModal = () => {
    setAddNewModalOpen(true);
  };

  const closeAddNewModal = () => {
    setAddNewModalOpen(false);
    setFormData(initialFormData);
    setErrors(initialError);
  };

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };

  const uploadToSupabase = async (data: any[]) => {
    try {
      const { data: insertedData, error } = await supabase
        .from("referrals")
        .insert(data);
      if (error) {
        toast("Failed to upload data to Supabase.");
      } else {
        toast(`Successfully uploaded rows to Supabase.`);
        fetchReferralsData(page);
      }
    } catch (error) {
      toast("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsLoading(true);
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

          const sanitizedData = filteredData.map((row: any) => ({
            customer_number: row["Customer number"] || "",
            email: row["Email"] || "",
            order_time: row["Time"] || "",
            referred_store_name: row["Referred store name"] || "",
            store_name: row["Store name"] || "",
            commission_rate: row["Commission\n(Per order)"] || "",
            order_number: row["Order number"] || "",
            quantity_of_order: row["Quantity of orders"] || "",
            paypal_address: "",
            total_commission: row["Total Commission"] || "",
          }));

          uploadToSupabase(sanitizedData);
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
        const sanitizedData = parsedData.map((row: any) => ({
          customer_number: row["Customer number"] || "",
          email: row["Email"] || "",
          order_time: row["Time"] || "",
          store_name: row["Store name"] || "",
          referred_store_name: row["Referred store name"] || "",
          commission_rate: row["Commission\n(Per order)"] || "",
          order_number: row["Order number"] || "",
          quantity_of_order: row["Quantity of orders"] || "",
          paypal_address: "",
          total_commission: row["Total Commission"] || "",
        }));

        uploadToSupabase(sanitizedData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast("Please select a valid CSV, XLS, or XLSX file.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file); // Your file upload logic
    } else {
      toast("Please select a valid file.");
    }
  };

  const deleteRow = async (id: any) => {
    try {
      const { error } = await supabase.from("referrals").delete().eq("id", id);
      if (error) {
        toast("Failed to delete the row.");
      } else {
        // Update state after deletion
        setReferralsData((prev) => prev.filter((row: any) => row.id !== id));
        toast("Row deleted successfully.");
        fetchReferralsData(page);
      }
    } catch (error) {
      toast("An unexpected error occurred.");
    }
  };

  const handleActionMenu = (value: string, row: any) => {
    if (value === "edit") {
      setFormData({
        user: row.user_name || "",
        email: row.email || "",
        store_name: row.store_name || "",
        referred_store_name: row.referred_store_name || "",
        commission_rate: row.commission_rate?.toString() || "",
        order_number: row.order_number || "",
        quantity_of_order: row.quantity_of_order?.toString() || "",
        paypal_address: row.paypal_address || "",
        total_commission: row.total_commission?.toString() || "",
      });
      setEditData(row);
      setAddNewModalOpen(true);
    }

    if (value === "delete") {
      deleteRow(row.id);
    }
  };

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    actionPresent: true,
    actionList: ["edit", "delete"],
    onActionClick: handleActionMenu,
    columns: [
      {
        field: "user_name",
        headerName: "User",
        customRender: (row: any) => {
          return (
              <p>{row?.user_name ? row?.user_name : '-'}</p>
          );
        },
      },
      {
        field: "created_at",
        headerName: "Time Created",
        customRender: (row: any) => {
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Months are zero-based
            const day = date.getDate();
            return `${year}/${month}/${day}`;
          };

          return <div>{formatDate(row.created_at)}</div>;
        },
      },
      // {
      //   field: "store_name",
      //   headerName: "Store Name",
      // },
      {
        field: "commission_rate",
        headerName: "Commission Rate",
      },
      {
        field: "order_number",
        headerName: "Order Number",
      },
      {
        field: "quantity_of_order",
        headerName: "Order QTY",
      },
      {
        field: "total_commission",
        headerName: "Commission",
        customRender: (row: any) => {
          return <p className="text-[#4aaa40]">{row?.total_commission}</p>;
        },
      },
    ],
    rows: referralsData || [],
  };

  const fetchReferralsData = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const start = (currentPage - 1) * limit;
      const { data, count, error }: any = await supabase
        .from("referrals")
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
    fetchReferralsData(page);
  }, [page]);

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
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="referred_store_name"
                      placeholder="Enter referred store name"
                      type="text"
                      className="mt-[8px]"
                      label={`Referred store name`}
                      value={formData.referred_store_name}
                      onChange={(e: any) =>
                        handleOnChange(e, {
                          referred_store_name: e.target.value,
                        })
                      }
                    />
                    {errors?.referred_store_name && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.referred_store_name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="paypal_address"
                      placeholder="Enter Paypal Address"
                      type="text"
                      className="mt-[8px]"
                      label={`Paypal address`}
                      value={formData.paypal_address}
                      onChange={(e: any) =>
                        handleOnChange(e, { paypal_address: e.target.value })
                      }
                    />
                    {errors?.paypal_address && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.paypal_address}
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
