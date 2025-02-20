"use client";

import CustomButton from "@/components/ui/custom-button";
import InputField from "@/components/ui/custom-inputfild";
import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { toast } from "react-toastify";

export default function Profile() {
  const supabase = createClient();
  const [userData, setUserData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    user_name: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getUserData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Unable to fetch user information.");
        return;
      }

      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        toast.error("Unable to get data.");
        return;
      }

      setUserData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Unable to fetch user information.");
        return;
      }

      const { error } = await supabase
        .from("user")
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          user_name: userData.user_name,
          // phone_number: userData.phone_number,
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to update user data.");
        return;
      }

      toast.success("User data updated successfully.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="flex flex-col w-full h-screen p-4 md:p-8">
      <h2 className="text-lg font-semibold pb-4">
        Personal Information
      </h2>
      <div className="flex flex-col gap-5 max-w-[550px] w-full">
        <div className="flex flex-col md:flex-row gap-4">
          <InputField
            name="first_name"
            placeholder="Enter first name"
            type="text"
            className="mt-[8px]"
            label="First Name"
            value={userData.first_name}
            onChange={handleInputChange}
          />
          <InputField
            name="last_name"
            placeholder="Enter last name"
            type="text"
            className="mt-[8px]"
            label="Last Name"
            value={userData.last_name}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <InputField
            name="email"
            placeholder="Enter email"
            type="text"
            className="mt-[8px]"
            label="Email"
            value={userData.email}
            onChange={handleInputChange}
            active
          />
          <InputField
            name="phone_number"
            placeholder="Enter phone number"
            type="text"
            className="mt-[8px]"
            label="Phone"
            // value={userData.phone_number}
            onChange={handleInputChange}
          />
        </div>

        <InputField
          name="user_name"
          placeholder="Enter user name"
          type="text"
          className="mt-[8px]"
          label="User Name"
          value={userData.user_name}
          onChange={handleInputChange}
        />

        <CustomButton
          type="button"
          interactingAPI={loading}
          label="Save"
          className="max-w-[100px]"
          callback={handleSubmit}
        />
      </div>
    </div>
  );
}
