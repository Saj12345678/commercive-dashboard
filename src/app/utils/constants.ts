import { Database } from "./supabase/database.types";

export const roleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "employee", label: "Employee" },
];

export const AFFILIATE_STATUS: Database["public"]["Enums"]["AFFILIATE_STATUS"][] =
  ["Pending", "Approved", "Declined"];
