import { useState } from "react";
import InputField from "../../../components/ui/custom-inputfild";
import CustomModal from "../../../components/ui/modal";
import CustomButton from "../../../components/ui/custom-button";
import { createClient } from "@/app/utils/supabase/client";
import { toast } from "react-toastify";
import { Typography } from "@mui/material";
import { useStoreContext } from "@/context/StoreContext";

export const AffiliateRequest = ({ balance }: { balance: number }) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const { affiliate, userinfo, updateAffiliate } = useStoreContext();

  const handleSave = async () => {
    setIsLoading(true);
    await supabase
      .from("affiliates")
      .insert({ user_id: userinfo!.id, status: "Pending" });
    await updateAffiliate();
    setIsLoading(false);
  };

  const buttonText =
    !affiliate || affiliate.status == "None" ? "Join Now" : affiliate.status;

  return (
    <div className="absolute elative w-full h-full bg-opacity-5 backdrop-blur-[5px] left-0 top-0 z-10">
      <div className="absolute w-[450px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-6 bg-white ring-1 ring-purple-300 rounded-md p-6">
        <h2 className="text-lg font-semibold">
          Want to join our affiliate program?
        </h2>
        <div className="flex flex-col gap-6 custom-scrollbar overflow-y-auto">
          <Typography>
            Earn money by sharing our platform. It's easy — just share your
            unique link, and get paid for every customer you refer.
          </Typography>
        </div>
        <div className="flex justify-end w-full">
          <CustomButton
            label={buttonText}
            callback={handleSave}
            className="bg-[#342d5f] text-[#5e568f]"
            interactingAPI={isLoading}
            disabled={affiliate?.status == "Pending"}
          />
        </div>
      </div>
    </div>
  );
};
