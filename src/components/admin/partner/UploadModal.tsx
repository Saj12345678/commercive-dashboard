import { roleOptions } from "@/app/utils/constants";
import { createClient } from "@/app/utils/supabase/client";
import { Database } from "@/app/utils/supabase/database.types";
import { AffiliateRow, StoreRow, UserRow } from "@/app/utils/types";
import CustomButton from "@/components/ui/custom-button";
import CustomModal from "@/components/ui/modal";
import { useStoreContext } from "@/context/StoreContext";
import {
  Autocomplete,
  Checkbox,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";

type UserModalProps = {
  onClose: () => void;
  setSelectedAffiliateID: (id: string | undefined) => void;
  handleUpload: () => void;
};

export const UploadModal: FC<UserModalProps> = ({
  onClose,
  setSelectedAffiliateID,
  handleUpload,
}) => {
  const supabase = createClient();

  const [allAffiliates, setAllAffiliates] = useState<AffiliateRow[]>([]);
  const [affiliateFilter, setAffiliateFilter] = useState<AffiliateRow>();
  const [saving, setSaving] = useState(false);

  const handleStoreChange = (_: any, newValue: AffiliateRow | null) => {
    if (newValue) {
      setAffiliateFilter(newValue);
    }
  };

  const handleUpdate = async () => {
    console.log("affiliateFilter :>> ", affiliateFilter);
    if (affiliateFilter) {
      setSelectedAffiliateID(affiliateFilter.customer_id!);
      handleUpload();
    } else {
      toast.error("Please Select an Affiliate.");
    }
  };

  useEffect(() => {
    const getAllAffiliates = async () => {
      const { data } = await supabase
        .from("affiliates")
        .select("*, user(*)")
        .eq("status", "Approved")
        .not("customer_id", "is", null);
      setAllAffiliates(data || []);
    };
    getAllAffiliates();
    setSelectedAffiliateID(undefined);
  }, []);

  return (
    <CustomModal maxWidth={"max-w-[400px]"} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">Select Partner</h2>

        <div>
          <Autocomplete
            options={allAffiliates}
            getOptionLabel={(option) => option.customer_id!}
            value={affiliateFilter}
            onChange={handleStoreChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            clearOnEscape
            renderOption={(props, option, { selected }) => (
              <MenuItem {...props} key={option.id}>
                <Checkbox key={option.id} checked={selected} />
                {option.customer_id}
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Affiliate"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>
        <div className="flex justify-end w-full">
          <CustomButton
            label={"Select a File"}
            callback={handleUpdate}
            className="bg-[#342d5f] text-[#5e568f]"
            interactingAPI={saving}
            disabled={saving || affiliateFilter == undefined}
          />
        </div>
      </div>
    </CustomModal>
  );
};
