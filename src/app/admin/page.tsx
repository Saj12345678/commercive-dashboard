"use client";

import { usePathname, useRouter } from "next/navigation";
import Partner from "@/components/admin/partner";
import Ticket from "@/components/admin/ticket";
import Roles from "@/components/admin/roles";
import Inventory from "@/components/admin/inventory";
import Home from "@/components/admin/home";
import { useEffect } from "react";

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin") {
      router.replace("/admin/home");
    }
  }, [pathname, router]);

  return (
    <div className="flex flex-col w-full gap-4 border-4 border-[#373163] rounded-[24px] bg-[#231e45] p-4 md:p-8 overflow-auto custom-scrollbar">
      {pathname === "/admin/home" && <Home />}
      {pathname === "/admin/inventory" && <Inventory />}
      {pathname === "/admin/partners" && <Partner />}
      {pathname === "/admin/tickets" && <Ticket />}
      {pathname === "/admin/roles" && <Roles />}
    </div>
  );
}
