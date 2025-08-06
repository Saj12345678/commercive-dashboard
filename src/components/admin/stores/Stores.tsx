"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomTable from "@/components/ui/custom-table";
import CustomButton from "../../ui/custom-button";
import { createClient } from "@/app/utils/supabase/client";
import CustomModal from "../../ui/modal";
import {
  Autocomplete,
  Checkbox,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FiPlus } from "react-icons/fi";
import InputField from "../../ui/custom-inputfild";
import { useStoreContext } from "@/context/StoreContext";
import { StoreRow } from "@/app/utils/types";
import { deleteUserByAdmin, signUpByAdmin } from "../action";

const initialFormData = {
  store_name: "",
  store_url: "",
};
const initialError = {
  store_name: "",
  store_url: "",
};

export function Stores() {
  const supabase = createClient();
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreRow>();
  const { allStores: storeData, fetchStoreData } = useStoreContext();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const [storeFilter, setStoreFilter] = useState<StoreRow[]>([]);
  const [storePage, setPageFilter] = useState<
    { label: string; value: string }[]
  >([]);

  let limit = 10;

  const [formData, setFormData] = useState(initialFormData);
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

  const handlePageChange = (
    _: any,
    newValue: { label: string; value: string }[]
  ) => {
    setPageFilter(newValue);
    // Extract only store values
    const selectedPages = newValue.map((page) => page.value);
    setFormData((prev) => ({ ...prev, pages: selectedPages }));
  };

  const handleNewOpenModal = () => {
    setSelectedStore(undefined);
    setAddNewModalOpen(true);
  };

  const closeNewModal = () => {
    setAddNewModalOpen(false);
    setErrors(initialError);
    setFormData(initialFormData);
    setSelectedStore(undefined);
    setStoreFilter([]);
  };

  const handlePagination = (curPage: number) => {
    setPage(curPage);
  };
  const handleCheckboxClick = (store: StoreRow) => {
    setAddNewModalOpen(true);
    setSelectedStore(store);
    setFormData({
      store_name: store.store_name,
      store_url: store.store_url,
    });
  };
  const handleOnDelete = (store: StoreRow) => {
    setDeleteModalOpen(true);
    setSelectedStore(store);
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("stores")
      .delete()
      .eq("id", selectedStore!.id);
    if (!error) {
      await fetchStores();
      toast.success("User deleted successfully!");
    } else {
      toast.error("Error");
    }
    setSaving(false);
    setDeleteModalOpen(false);
    setSelectedStore(undefined);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Custom validation
  const validateForm = () => {
    const newErrors = initialError;

    if (!formData?.store_name?.trim())
      newErrors.store_name = "Store Name is required.";

    if (
      !formData?.store_url?.trim() ||
      !formData.store_url.endsWith("myshopify.com")
    ) {
      newErrors.store_url = "Invalid Store URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isLoading) return;
    let error;
    if (validateForm()) {
      setSaving(true);
      try {
        if (!selectedStore) {
          ({ error } = await supabase.from("stores").insert({
            ...formData,
            is_inventory_fetched: false,
            is_store_listed: false,
          }));
        } else {
          ({ error } = await supabase
            .from("stores")
            .update(formData)
            .eq("id", selectedStore.id));
        }
        if (error instanceof Error) {
          toast.error(
            error.message || "Failed to save data. Please try again."
          );
          setSaving(false);
          return;
        } else {
          toast(
            selectedStore
              ? "Data updated successfully"
              : "Data added successfully"
          );
          fetchStores();
          fetchStoreData();
          setEditData({});
        }
      } catch (error: unknown) {
        console.error("Unexpected error:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      }
      setSaving(false);
      setStoreFilter([]);
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
        field: "store_name",
        headerName: "Store Name",
        customRender: (row: StoreRow) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.store_name}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "store_url",
        headerName: "Store URL",
        customRender: (row: StoreRow) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">{row?.store_url}</p>
              </div>
            </div>
          );
        },
      },
      {
        field: "store_url",
        headerName: "Installed APP?",
        customRender: (row: StoreRow) => {
          return (
            <div className="flex gap-2">
              <div>
                <p className="text-white">
                  {row.is_inventory_fetched ? "Installed" : "N/A"}
                </p>
              </div>
            </div>
          );
        },
      },
    ],
    rows: stores || [],
  };

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const start = (page - 1) * limit;
      const { data, count, error } = await supabase
        .from("stores")
        .select("*", { count: "exact" }) // Fetch data with exact count
        .range(start, start + limit - 1);

      if (error) {
        console.error("Error fetching referrals data:", error);
      } else {
        setStores(data || []);
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
    fetchStores();
  }, [page]);

  return (
    <div className="flex flex-col w-full gap-5">
      <h1 className="text-2xl text-white">Stores</h1>
      {addNewModalOpen && (
        <CustomModal onClose={closeNewModal} maxWidth={"max-w-[800px]"}>
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">
              {selectedStore ? "Update Store" : "Add a new Store"}
            </h2>
            <div className="flex flex-col gap-6 max-sm:h-full max-sm:max-h-[350px] custom-scrollbar">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="store_name"
                    placeholder="Enter Store Name"
                    type="text"
                    className="mt-[8px]"
                    label="Store Name"
                    value={formData.store_name || ""}
                    onChange={(e: any) =>
                      handleAddNewUserChange(e, { store_name: e.target.value })
                    }
                  />
                  {errors?.store_name && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.store_name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col relative w-full">
                  <InputField
                    name="password"
                    placeholder="example.myshopify.com"
                    type="text"
                    className="mt-[8px]"
                    label="Store URL(***.myshopify.com)"
                    value={formData.store_url || ""}
                    onChange={(e: any) =>
                      handleAddNewUserChange(e, { store_url: e.target.value })
                    }
                  />
                  {errors?.store_url && (
                    <p className="text-red-500 absolute text-sm -bottom-[20px] message">
                      {errors?.store_url}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end w-full">
              <CustomButton
                label={"Save"}
                callback={handleSave}
                className="bg-[#342d5f] text-[#5e568f]"
                interactingAPI={saving}
                disabled={saving}
              />
            </div>
          </div>
        </CustomModal>
      )}
      {deleteModalOpen && (
        <CustomModal
          onClose={() => setDeleteModalOpen(false)}
          maxWidth={"max-w-[400px]"}
        >
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold">Delete Store?</h2>

            <div className="flex justify-end w-full">
              <CustomButton
                label={"OK"}
                callback={handleDelete}
                className="bg-[#342d5f] text-[#5e568f]"
                interactingAPI={saving}
                disabled={saving}
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
        onDelete={handleOnDelete}
      />
    </div>
  );
}
