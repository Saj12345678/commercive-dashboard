import { Database } from "./supabase/database.types";

export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type UserRow = Database["public"]["Tables"]["user"]["Row"];
