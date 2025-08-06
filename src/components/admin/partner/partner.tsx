"use client";

import CustomTable from "@/components/ui/custom-table";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import CustomButton from "../../ui/custom-button";
import { MdOutlineFileDownload } from "react-icons/md";
import { createClient } from "@/app/utils/supabase/client";
import { FiPlus } from "react-icons/fi";
import CustomModal from "../../ui/modal";
import InputField from "../../ui/custom-inputfild";
import { toast } from "react-toastify";
import { Autocomplete, TextField } from "@mui/material";
import { useStoreContext } from "@/context/StoreContext";
import { ReferralRow, StoreRow } from "@/app/utils/types";
import { Database } from "@/app/utils/supabase/database.types";
import { WalletTable } from "./WalletTable";

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

type ReferralInsert = Database["public"]["Tables"]["referrals"]["Insert"];

const initialError = {
  user_name: "",
  email: "",
  store_url: "",
  referred_store_url: "",
  commission_rate: "",
  quantity_of_order: "",
  paypal_address: "",
};

export default function Partner() {
  const supabase = createClient();
  const { allStores } = useStoreContext();

  const [referralsData, setReferralsData] = useState<ReferralRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let limit = 5;

  const initialFormData: ReferralInsert = {
    user_name: "",
    email: "",
    store_url: allStores[0].store_url,
    referred_store_url: allStores[0].store_url,
    commission_rate: 0.2,
    quantity_of_order: 0,
    paypal_address: "",
  };

  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialError);
  const [storeFilter, setStoreFilter] = useState<StoreRow | null>(allStores[0]);
  const [referredStoreFilter, setReferredStoreFilter] =
    useState<StoreRow | null>(allStores[0]);
  const [triggerKey, setTriggerKey] = useState(0);

  // Handle input changes
  const handleOnChange = (updatedField: Partial<typeof formData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedField,
    }));
    setErrors((prev) => ({
      ...prev,
      ...Object.keys(updatedField).reduce((acc, key) => {
        acc[key as keyof typeof errors] = "";
        return acc;
      }, {} as typeof errors),
    }));
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Custom validation
  const validateForm = () => {
    const newErrors = {} as typeof initialError;

    if (!formData.user_name?.trim())
      newErrors.user_name = "User name is required.";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.store_url.trim())
      newErrors.store_url = "Store URL is required.";
    if (
      !formData.referred_store_url.trim() ||
      formData.store_url == formData.referred_store_url
    )
      newErrors.referred_store_url = "Invalid Referred Store URL.";
    if (formData.commission_rate == 0) {
      newErrors.commission_rate = "Commission rate is required.";
    } else if (isNaN(Number(formData.commission_rate))) {
      newErrors.commission_rate = "Commission rate must be a number.";
    }
    if (formData.quantity_of_order == 0) {
      newErrors.quantity_of_order = "Order QTY is required.";
    } else if (isNaN(Number(formData.quantity_of_order))) {
      newErrors.quantity_of_order = "Order QTY must be a number.";
    }
    if (!formData.paypal_address?.trim()) {
      newErrors.paypal_address = "Paypal address is required.";
    }
    console.log("newErrors :>> ", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        let data, error;

        if (formData.id) {
          // Update existing data
          ({ data, error } = await supabase
            .from("referrals")
            .update({
              user_name: formData.user_name,
              email: formData.email,
              store_url: formData.store_url,
              referred_store_url: formData.referred_store_url,
              commission_rate: formData.commission_rate,
              quantity_of_order: formData.quantity_of_order,
              paypal_address: formData.paypal_address,
            } as ReferralRow)
            .eq("id", formData.id));
        } else {
          ({ data, error } = await supabase.from("referrals").insert({
            user_name: formData.user_name,
            email: formData.email,
            store_url: formData.store_url,
            referred_store_url: formData.referred_store_url,
            commission_rate: Number(formData.commission_rate),
            quantity_of_order: Number(formData.quantity_of_order),
            paypal_address: formData.paypal_address,
          }));
        }

        if (error) {
          toast.error(error.message);
        } else {
          toast.success(
            formData.id
              ? "Data updated successfully:"
              : "Data added successfully:"
          );
          fetchReferralsData(page);
        }
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

  const deleteRow = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("referrals")
        .delete()
        .eq("id", formData.id!);
      if (error) {
        toast("Failed to delete the row.");
      } else {
        await fetchReferralsData(page);
        toast("Row deleted successfully.");
        setDeleteModalOpen(false);
        setFormData(initialFormData);
      }
    } catch (error) {
      toast("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  const handleDelete = (row: ReferralRow) => {
    setFormData(row);
    setDeleteModalOpen(true);
  };

  const handleSelectEdit = async (row: ReferralRow) => {
    setFormData(row);
    setAddNewModalOpen(true);
  };

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    actionPresent: true,
    actionList: ["edit", "delete"],
    columns: [
      {
        field: "user_name",
        headerName: "User",
        customRender: (row: any) => {
          return <p>{row?.user_name ? row?.user_name : "-"}</p>;
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
      {
        field: "store_url",
        headerName: "Store URL / Referred Store URL",
        customRender: (row: ReferralRow) => (
          <p>
            {row.store_url} <br />({row.referred_store_url})
          </p>
        ),
      },
      {
        field: "commission_rate",
        headerName: "Commission Rate",
        customRender: (row: any) => <p>{row.commission_rate || 0}%</p>,
      },
      {
        field: "quantity_of_order",
        headerName: "Order QTY",
      },
      {
        headerName: "Commission",
        customRender: (row: ReferralRow) => {
          return (
            <p className="text-[#4aaa40]">
              ${(row.commission_rate * row.quantity_of_order).toFixed(2)}
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
        .from("referrals")
        .select("*", { count: "exact" }) // Fetch data with exact count
        .range(start, start + limit - 1);

      if (error) {
        console.error("Error fetching referrals data:", error);
      } else {
        setReferralsData(data || []);
        setTotalRecords(count || 0); // Update total records
        setTriggerKey(triggerKey + 1);
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
              <h2 className="text-lg font-semibold">
                {formData.id ? "Update" : "Add new"}
              </h2>
              <div className="flex flex-col gap-6 max-sm:h-full max-sm:max-h-[350px]">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="user"
                      placeholder="Enter user name"
                      type="text"
                      className="mt-[8px]"
                      label={`User`}
                      value={formData.user_name}
                      onChange={(e: any) =>
                        handleOnChange({ user_name: e.target.value })
                      }
                    />
                    {errors?.user_name && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.user_name}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="email"
                      placeholder="Enter user email"
                      type="email"
                      className="mt-[8px]"
                      label={`Email`}
                      value={formData.email}
                      onChange={(e: any) =>
                        handleOnChange({ email: e.target.value })
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
                  <div className="flex flex-col relative w-full gap-2">
                    <label htmlFor="">Store URL</label>
                    <div className="flex w-full">
                      <Autocomplete
                        options={allStores}
                        getOptionLabel={(option) => option.store_url}
                        value={storeFilter}
                        onChange={(event, newValue) => {
                          setStoreFilter(newValue);
                          handleOnChange({ store_url: newValue?.store_url });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // label="Select store"
                            variant="outlined"
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                // color: "white",
                                padding: "0px 10px !important",
                                "& fieldset": { borderColor: "#403a6b" },
                                "&:hover fieldset": { borderColor: "#403a6b" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#403a6b",
                                },
                              },
                              "& .MuiInputLabel-root": { color: "white" },
                              "& .MuiInputLabel-root.Mui-focused": {
                                color: "white",
                              },
                              width: "100%",
                            }}
                            className="tests"
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        clearOnEscape
                        sx={{
                          width: "100%",
                        }}
                      />
                    </div>
                    {errors?.store_url && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.store_url}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full gap-2">
                    <label htmlFor="">Referred Store URL</label>
                    <div className="flex w-full">
                      <Autocomplete
                        options={allStores}
                        getOptionLabel={(option) => option.store_url}
                        value={referredStoreFilter}
                        onChange={(event, newValue) => {
                          setReferredStoreFilter(newValue);
                          handleOnChange({
                            referred_store_url: newValue?.store_url,
                          });
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            // label="Select store"
                            variant="outlined"
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                // color: "white",
                                padding: "0px 10px !important",
                                "& fieldset": { borderColor: "#403a6b" },
                                "&:hover fieldset": { borderColor: "#403a6b" },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#403a6b",
                                },
                              },
                              "& .MuiInputLabel-root": { color: "white" },
                              "& .MuiInputLabel-root.Mui-focused": {
                                color: "white",
                              },
                              width: "100%",
                            }}
                            className="tests"
                          />
                        )}
                        isOptionEqualToValue={(option, value) =>
                          option.id === value.id
                        }
                        clearOnEscape
                        sx={{
                          width: "100%",
                        }}
                      />
                    </div>
                    {errors?.referred_store_url && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.referred_store_url}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="email"
                      placeholder="Enter Paypal Address"
                      type="email"
                      className="mt-[8px]"
                      label={`Paypal address`}
                      value={formData.paypal_address || ""}
                      onChange={(e: any) =>
                        handleOnChange({ paypal_address: e.target.value })
                      }
                    />
                    {errors?.paypal_address && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.paypal_address}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="quantity_of_order"
                      placeholder="Enter order QTY"
                      type="number"
                      className="mt-[8px]"
                      label={`Order QTY`}
                      value={formData.quantity_of_order.toString()}
                      onChange={(e: any) =>
                        handleOnChange({ quantity_of_order: e.target.value })
                      }
                    />
                    {errors?.quantity_of_order && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.quantity_of_order}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="commission_rate"
                      placeholder="Enter commission rate"
                      type="number"
                      className="mt-[8px]"
                      label={`Commission Rate`}
                      value={formData.commission_rate.toString()}
                      onChange={(e: any) =>
                        handleOnChange({ commission_rate: e.target.value })
                      }
                    />
                    {errors.commission_rate && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.commission_rate}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="commission"
                      placeholder="Enter commission"
                      type="text"
                      className="mt-[8px]"
                      label={`Commission`}
                      value={(
                        formData.commission_rate * formData.quantity_of_order
                      ).toFixed(2)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end w-full">
                <CustomButton
                  label={formData.id ? "Update" : "Add"}
                  callback={handleSave}
                  className="bg-[#342d5f] text-[#5e568f]"
                  interactingAPI={loading}
                />
              </div>
            </div>
          </CustomModal>
        )}
        {deleteModalOpen && (
          <CustomModal
            onClose={() => {
              setDeleteModalOpen(false);
              setFormData(initialFormData);
            }}
            maxWidth={"max-w-[400px]"}
          >
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Delete the Row?</h2>

              <div className="flex justify-end w-full">
                <CustomButton
                  label={"OK"}
                  callback={deleteRow}
                  className="bg-[#342d5f] text-[#5e568f]"
                  interactingAPI={isLoading}
                  disabled={isLoading}
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
        showCheckbox={true}
        onCheckboxClick={handleSelectEdit}
        onDelete={handleDelete}
      />
      <WalletTable triggerKey={triggerKey} />
    </div>
  );
}
