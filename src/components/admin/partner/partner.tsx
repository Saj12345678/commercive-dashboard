"use client";

import CustomTable from "@/components/ui/custom-table";
import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import CustomButton from "../../ui/custom-button";
import { MdOutlineFileDownload, MdOutlineFileUpload } from "react-icons/md";
import { createClient } from "@/app/utils/supabase/client";
import { FiPlus } from "react-icons/fi";
import CustomModal from "../../ui/modal";
import InputField from "../../ui/custom-inputfild";
import { toast } from "react-toastify";
import { Autocomplete, TextField } from "@mui/material";
import { useStoreContext } from "@/context/StoreContext";
import { ReferralViewRow, StoreRow } from "@/app/utils/types";
import { Database } from "@/app/utils/supabase/database.types";
import { WalletTable } from "./WalletTable";
import { excelToTimestampZ } from "@/app/utils/date";
import { UploadModal } from "./UploadModal";
import { methodOptions } from "@/app/utils/constants";

const defaultHeaders = [
  "time",
  "affiliate_commission",
  "customer_number",
  "store_name",
  "commission_rate",
  "affiliate_id",
  "order_number",
  "quantity_of_orders",
  "quantity_of_products",
  "invoice_total",
  "total_commission",
];

type ReferralInsert = Database["public"]["Tables"]["referrals"]["Insert"];

const initialError = {
  store_name: "",
  commission_rate: "",
  quantity_of_order: "",
  order_number: "",
  customer_number: "",
  order_time: "",
  affiliate_id: "",
};

export default function Partner() {
  const supabase = createClient();
  const { allStores } = useStoreContext();

  let limit = 5;
  const initialFormData: ReferralInsert & {
    commission_method: number;
    commission_rate: number;
  } = {
    store_name: "",
    quantity_of_order: 0,
    customer_number: "",
    order_number: "",
    uuid: "",
    order_time: "",
    agent_name: "",
    affiliate_id: "",
    invoice_total: 0,
    commission_rate: 0,
    commission_method: 0,
  };

  const [storeFilter, setStoreFilter] = useState<StoreRow | null>(allStores[0]);
  const [referralsData, setReferralsData] = useState<ReferralViewRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialError);
  const [referredStoreFilter, setReferredStoreFilter] =
    useState<StoreRow | null>(allStores[0]);
  const [triggerKey, setTriggerKey] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [agentID, setAgentID] = useState<string>();

  const fileRef = useRef<HTMLInputElement>(null);
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

  const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  // Custom validation
  const validateForm = () => {
    const newErrors = {} as typeof initialError;

    if (!formData.customer_number?.trim())
      newErrors.customer_number = "Customer number is required.";

    if (!formData.order_number?.trim()) {
      newErrors.order_number = "Order number is required.";
    }

    if (!dateRegex.test(formData.order_time.split("T")[0])) {
      newErrors.order_time = "Invalid Order time.";
    }

    if (!formData.store_name.trim())
      newErrors.store_name = "Store URL is required.";
    // if (
    //   !formData.referred_store_url.trim() ||
    //   formData.store_name == formData.referred_store_url
    // )
    // if (formData.commission_rate == 0) {
    //   newErrors.commission_rate = "Commission rate is required.";
    // } else if (isNaN(Number(formData.commission_rate))) {
    //   newErrors.commission_rate = "Commission rate must be a number.";
    // }
    if (formData.quantity_of_order == 0) {
      newErrors.quantity_of_order = "Order QTY is required.";
    } else if (isNaN(Number(formData.quantity_of_order))) {
      newErrors.quantity_of_order = "Order QTY must be a number.";
    }
    // if (!formData.paypal_address?.trim()) {
    //   newErrors.paypal_address = "Paypal address is required.";
    // }
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
              store_name: formData.store_name,
              // commission_rate: formData.commission_rate,
              quantity_of_order: formData.quantity_of_order,
              order_number: formData.order_number,
              customer_number: formData.customer_number,
              uuid: `${formData.customer_number}-${formData.order_number}`,
              order_time: formData.order_time,
              invoice_total: formData.invoice_total,
            } as ReferralInsert)
            .eq("id", formData.id));
        } else {
          ({ data, error } = await supabase.from("referrals").insert({
            store_name: formData.store_name,
            // commission_rate: Number(formData.commission_rate),
            quantity_of_order: Number(formData.quantity_of_order),
            customer_number: formData.customer_number,
            order_number: formData.order_number,
            order_time: formData.order_time,
            uuid: `${formData.customer_number}-${formData.order_number}`,
            agent_name: agentID!,
            affiliate_id: formData.affiliate_id,
            invoice_total: formData.invoice_total,
          } as ReferralInsert));
        }

        const newSetting: Database["public"]["Tables"]["affiliate_customer_setting"]["Insert"] =
          {
            uid: `${formData.affiliate_id}:${formData.customer_number}`,
            affiliate: formData.affiliate_id,
            customer_id: formData.customer_number,
            commission_method: formData.commission_method,
            commission_rate: formData.commission_rate,
          };

        await supabase.from("affiliate_customer_setting").upsert(newSetting);

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

  const uploadToSupabase = async (data: ReferralInsert[]) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("referrals")
        .upsert(data, { onConflict: "uuid" });
      if (error) {
        toast("Failed to upload data to Supabase.");
      } else {
        await fetchReferralsData(page);
        toast(`Successfully uploaded rows to Supabase.`);
      }
    } catch (error) {
      toast("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (
      fileExtension === "xls" ||
      fileExtension === "xlsx" ||
      fileExtension === "csv"
    ) {
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
        console.log("parsedData :>> ", parsedData.shift());
        const sanitizedData = parsedData.map((row, idx) => ({
          // customer_number: row["Customer number"] || "",
          order_time: excelToTimestampZ(parseInt(row["time"])),
          store_name: row["store_name"] || "",
          // referred_store_url: referredStoreFilter!.store_url,
          // commission_rate: 0,
          order_number: row["order_number"] || "",
          quantity_of_order: Number(row["quantity_of_orders"]) || 0,
          customer_number: row["customer_number"],
          uuid: `${row["customer_number"]}-${row["order_number"]}`,
          agent_name: agentID!,
          affiliate_id: row["affiliate_id"],
          invoice_total: Number(row["invoice_total"] || 0),
        }));
        const uuidMap = new Map<string, number>();
        let order_id: string | undefined = undefined;
        sanitizedData.forEach((item) => {
          const prev = uuidMap.get(item.uuid) || 0;
          uuidMap.set(item.uuid, prev + 1);
          if (prev == 1) {
            console.log("sanitizedData", item);
            order_id = item.order_number;
          }
        });
        if (order_id) {
          toast.error(`Order Number "${order_id}" is duplicated!`);
          return;
        }

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

  const handleDelete = (row: ReferralViewRow) => {
    setFormData({
      ...(row as typeof formData),
      commission_rate: row.commission_rate || 0,
    });
    setDeleteModalOpen(true);
  };

  const handleSelectEdit = async (row: ReferralViewRow) => {
    setFormData({
      ...(row as typeof formData),
      commission_rate: row.commission_rate || 0,
    });
    setAddNewModalOpen(true);
  };

  const tableConfig = {
    handlePagination: handlePagination,
    notFoundData: "No Data found",
    actionPresent: true,
    actionList: ["edit", "delete"],
    columns: [
      {
        field: "order_time",
        headerName: "Order Time",
        customRender: (row: ReferralViewRow) => (
          <div>{row.order_time?.split("T")[0]}</div>
        ),
      },
      {
        field: "affiliate_id",
        headerName: "Affiliate ID",
      },
      {
        field: "customer_number",
        headerName: "Customer Number",
      },
      {
        field: "store_url",
        headerName: "Store Name",
        customRender: (row: ReferralViewRow) => <p>{row.store_name}</p>,
      },
      {
        field: "commission_method",
        headerName: "Commission Method",
        customRender: (row: ReferralViewRow) => (
          <p>
            {row.commission_method == 1
              ? "Per Order"
              : row.commission_method == 2
              ? "% of Total"
              : "-"}
          </p>
        ),
      },
      {
        field: "commission_rate",
        headerName: "Commission Rate",
        customRender: (row: ReferralViewRow) => (
          <p>
            {row.commission_method == undefined || row.commission_method == null
              ? "-"
              : row.commission_method == 1
              ? `$${row.commission_rate}`
              : row.commission_method == 2
              ? `${row.commission_rate || 0}`
              : "-"}
          </p>
        ),
      },
      {
        field: "quantity_of_order",
        headerName: "Order QTY",
      },
      {
        field: "invoice_total",
        headerName: "Invoice Total",
      },
      {
        field: "commission",
        headerName: "Commission",
        customRender: (row: ReferralViewRow) => {
          return (
            <p className="text-[#4aaa40]">
              ${row.total_commission?.toFixed(2)}
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
        .range(start, start + limit - 1)
        .order("id");
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

  const handleShowUploadModal = () => {
    fileRef.current?.click();
    // setUploadModalOpen(true);
  };

  const handleUploadClick = () => {
    fileRef.current?.click();
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
            className="w-max"
            label="Add New"
            prefixIcon={<FiPlus size={24} />}
            callback={handleAddNewOpenModal}
          />
          <div className="flex gap-4 items-center">
            <label
              className="flex cursor-pointer bg-[#4F11C9] text-[#F4F4F4] font-semibold py-2 px-4 rounded-[8px]"
              onClick={handleShowUploadModal}
            >
              <span>
                <MdOutlineFileUpload size={24} color="#F4F4F4" />
              </span>
              Upload CSV
            </label>
            <input
              className="hidden"
              type="file"
              id="selectedFile"
              name="selectedFile"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              onClick={(e: any) => {
                e.target.value = null;
              }}
              ref={fileRef}
            />
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
                      name="customer_number"
                      placeholder="Enter customer number"
                      type="text"
                      className="mt-[8px]"
                      label={`Customer Number`}
                      value={formData.customer_number || ""}
                      onChange={(e: any) =>
                        handleOnChange({ customer_number: e.target.value })
                      }
                    />
                    {errors?.customer_number && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.customer_number}
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
                      value={formData.order_number || ""}
                      onChange={(e: any) =>
                        handleOnChange({ order_number: e.target.value })
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
                  <div className="flex flex-col relative w-full gap-2">
                    <div className="flex flex-col relative w-full">
                      <InputField
                        name="store_name"
                        placeholder="Enter Store Name"
                        type="text"
                        className="mt-[8px]"
                        label={`Store Name`}
                        value={formData.store_name}
                        onChange={(e: any) =>
                          handleOnChange({ store_name: e.target.value })
                        }
                      />
                      {errors?.store_name && (
                        <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                          {errors?.store_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col relative w-full gap-2">
                    <div className="flex flex-col relative w-full">
                      <InputField
                        name="affiliate_id"
                        placeholder="Enter Affiliate ID"
                        type="text"
                        className="mt-[8px]"
                        label={`Affiliate ID`}
                        value={formData.affiliate_id}
                        onChange={(e: any) =>
                          handleOnChange({ store_name: e.target.value })
                        }
                      />
                      {errors?.affiliate_id && (
                        <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                          {errors?.affiliate_id}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="order_time"
                      placeholder="YYYY-MM-DD"
                      type="text"
                      className="mt-[8px]"
                      label={`Order Time (YYYY-MM-DD)`}
                      value={formData.order_time.split("T")[0]}
                      onChange={(e: any) =>
                        handleOnChange({ order_time: e.target.value })
                      }
                    />
                    {errors?.order_time && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.order_time}
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
                      name="invoice_total"
                      placeholder="Enter Invoice Total"
                      type="number"
                      className="mt-[8px]"
                      label={`Invoice Total`}
                      value={formData.invoice_total?.toString() || "0"}
                    />
                  </div>
                  <div className="flex flex-col relative w-full">
                    <InputField
                      name="commission_rate"
                      placeholder="Enter commission rate"
                      type="number"
                      className="mt-[8px]"
                      label={`Commission Rate (${
                        formData.commission_method == 2
                          ? `${formData.commission_rate * 100}%`
                          : `$${formData.commission_rate}`
                      })`}
                      value={formData.commission_rate?.toString()}
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
                </div>
                <div>
                  <div className="flex flex-col relative w-1/2">
                    <label htmlFor="">Commission Method</label>
                    <select
                      name="Role"
                      id=""
                      className="border border-color-[#D4D77D] border-opacity-5 p-[9px] mt-2.5 rounded-md focus-within:outline-none"
                      value={formData.commission_method || 0}
                      onChange={(e) =>
                        handleOnChange({
                          commission_method: Number(e.target.value),
                        })
                      }
                    >
                      {methodOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="focus-within:outline-none"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.commission_rate && (
                      <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                        {errors?.commission_rate}
                      </p>
                    )}
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
            maxWidth="max-w-[400px]"
          >
            <div className="flex flex-col gap-6">
              <h2 className="text-lg font-semibold">Delete the Row?</h2>
              <div className="flex justify-end w-full">
                <CustomButton
                  className="bg-[#342d5f] text-[#5e568f]"
                  label="OK"
                  callback={deleteRow}
                  interactingAPI={isLoading}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CustomModal>
        )}
        {uploadModalOpen && (
          <UploadModal
            onClose={() => {
              setUploadModalOpen(false);
            }}
            setAgentID={setAgentID}
            handleUpload={handleUploadClick}
          />
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
              className="bg-[#342d5f] text-[#5e568f]"
              label={"Next"}
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
      <WalletTable
        triggerKey={triggerKey}
        updateTables={() => {
          setTriggerKey(triggerKey + 1);
          fetchReferralsData(page);
        }}
      />
    </div>
  );
}
