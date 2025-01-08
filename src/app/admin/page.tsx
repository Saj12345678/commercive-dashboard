'use client'

import Partner from "@/components/admin/partner";
import CustomTable from "@/components/ui/custom-table";
import { useState } from "react";

interface AdminProps {
  queryParams?: any;
  authId?: any;
}

export default function AdminLayout() {

  return (
    <div className="flex flex-col w-full gap-4 border-l-4 border-t-4 border-[#373163] rounded-tl-[24px] bg-[#231e45] p-4 md:p-8 overflow-auto custom-scrollbar ">
        < Partner /> 
    </div>
  )}
 

