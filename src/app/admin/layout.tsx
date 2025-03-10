"use client";
import { ReactNode, useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user: userData },
        } = await supabase.auth.getUser();

        if (!userData) {
          setIsAuthorized(false);
          return;
        }

        const { data: user, error } = await supabase
          .from("user")
          .select("role")
          .eq("id", userData.id)
          .single();

        if (error || !user) {
          console.error("Error fetching user role:", error);
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(user.role === "admin");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user details:", error);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };

    getUserDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="text-white w-full font-bold text-center mt-12 sm:mt-80">
        Loading...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="text-white w-full font-bold text-center mt-12 sm:mt-80">
        Unauthorized Access
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4 border-4 border-[#373163] rounded-[24px] bg-[#231e45] p-4 md:p-8 overflow-auto custom-scrollbar">
      {children}
    </div>
  );
}
