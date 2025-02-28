"use client";

import { usePathname } from "next/navigation";
import Partner from "@/components/admin/partner";
import Ticket from "@/components/admin/ticket";

export default function AdminPage() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-full gap-4 border-4 border-[#373163] rounded-[24px] bg-[#231e45] p-4 md:p-8 overflow-auto custom-scrollbar ">
      {pathname === "/admin/partners" && <Partner />}
      {pathname === "/admin/tickets" && <Ticket />}
    </div>
  );
}
