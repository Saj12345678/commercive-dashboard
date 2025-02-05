"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { usePathname } from "next/navigation";
import { Flip, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import LabelBottomNavigation from "@/components/bottom-navigation";
import { StoreProvider } from "@/context/StoreContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathName = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <StoreProvider>
          <div className="flex flex-col h-[100dvh] w-full">
             <div className="flex sticky top-0 z-50">
            {!pathName?.includes("/login") &&
              !pathName?.includes("/signUp") &&
              !pathName?.includes("/error") &&
              !pathName?.includes("/admin") && (
                <Header toggleSidebar={toggleSidebar} />
              )}
              </div>
            <div className="flex flex-col h-screen max-h-screen overflow-hidden">
            <div className={`flex w-full h-full ${pathName?.includes("/admin") && 'bg-[#1b1838] p-4'}`}>
              {!pathName?.includes("/login") &&
                !pathName?.includes("/signUp") &&
                !pathName?.includes("/error") && (
                  <Sidebar
                    isOpen={isSidebarOpen}
                    handleToggleSidebar={toggleSidebar}
                  />
                )}
      {children} {/* All components under this will have access to the context */}
            </div>
            <div className="flex md:hidden sticky bottom-0 z-50">
            {!pathName?.includes("/login") &&
                !pathName?.includes("/signUp") &&   
                !pathName?.includes("/error") && (
                  <LabelBottomNavigation />
                )}
            </div>
            </div>
          </div>
          <ToastContainer position="top-right" transition={Flip} />             
        </StoreProvider>
      </body>
    </html>
  );
}
