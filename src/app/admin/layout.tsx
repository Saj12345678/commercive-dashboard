import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col w-full gap-4 border-4 border-[#373163] rounded-[24px] bg-[#231e45] p-4 md:p-8 overflow-auto custom-scrollbar">
      {children}
    </div>
  );
}