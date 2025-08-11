import { AFFILIATE_STATUS, roleOptions } from "@/app/utils/constants";
import { createClient } from "@/app/utils/supabase/client";
import { Database } from "@/app/utils/supabase/database.types";
import { AffiliateRow, StoreRow, UserRow } from "@/app/utils/types";
import CustomButton from "@/components/ui/custom-button";
import InputField from "@/components/ui/custom-inputfild";
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

type AffiliateUpdateModalProps = {
  selectedUser: AffiliateRow;
  onClose: () => void;
  fetchUsers: () => Promise<void>;
};

export const AffiliateUpdateModal: FC<AffiliateUpdateModalProps> = ({
  selectedUser,
  onClose,
  fetchUsers,
}) => {
  const supabase = createClient();

  const [selectedRole, setSelectedRole] = useState(selectedUser.status);
  const [saving, setSaving] = useState(false);
  const [customerID, setCustomerID] = useState(selectedUser.customer_id);
  const [formURL, setFormURL] = useState(selectedUser.form_url);

  const handleUpdate = async () => {
    console.log("selectedRole :>> ", selectedRole);
    setSaving(true);
    const { error } = await supabase
      .from("affiliates")
      .update({
        status: selectedRole,
        customer_id: customerID,
        form_url: formURL,
      })
      .eq("id", selectedUser.id);
    console.log("error :>> ", error);
    await fetchUsers();
    setSaving(false);
  };

  return (
    <CustomModal maxWidth={"max-w-[400px]"} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">
          Update Affiliate ({selectedUser.user.email})
        </h2>
        <div className="flex flex-col gap-4">
          <label>Status</label>
          <Select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value! as any)}
          >
            {AFFILIATE_STATUS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </div>
        <div>
          <InputField
            name="customer_id"
            placeholder="Enter customer id"
            type="text"
            className="mt-[8px]"
            label="Affiliate ID"
            value={customerID || ""}
            onChange={(e: any) => setCustomerID(e.target.value)}
          />
        </div>
        <div>
          <InputField
            name="form_url"
            placeholder="Enter Google Form URL"
            type="text"
            className="mt-[8px]"
            label="Google Form URL"
            value={formURL || ""}
            onChange={(e: any) => setFormURL(e.target.value)}
          />
        </div>

        <div className="flex justify-end w-full">
          <CustomButton
            label={"Save"}
            callback={handleUpdate}
            className="bg-[#342d5f] text-[#5e568f]"
            interactingAPI={saving}
            disabled={saving}
          />
        </div>
      </div>
    </CustomModal>
  );
};
