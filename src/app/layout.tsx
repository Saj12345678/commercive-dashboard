"use client";

import { useEffect, useState } from "react";
import { Flip, ToastContainer } from "react-toastify";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import LabelBottomNavigation from "@/components/bottom-navigation";
import Chat from "@/components/chat";
import { StoreProvider } from "@/context/StoreContext";
import { createClient } from "./utils/supabase/client";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

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
  const supabase = createClient();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }
    };

    checkUser();
  }, [supabase]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        <StoreProvider>
          <div className="flex flex-col h-[100dvh] w-full">
            <div className="flex sticky top-0 z-50">
              {!pathName?.includes("/login") &&
                !pathName?.includes("/signUp") &&
                !pathName?.includes("/error") &&
                !pathName?.includes("/admin") && (
                  <Header
                    toggleSidebar={toggleSidebar}
                    openChat={() => setChatOpen(true)}
                  />
                )}
            </div>
            <div className="flex flex-col h-screen max-h-screen overflow-hidden">
              <div
                className={`flex w-full h-full ${
                  pathName?.includes("/admin") && "bg-[#1b1838] p-4"
                }`}
              >
                {!pathName?.includes("/login") &&
                  !pathName?.includes("/signUp") &&
                  !pathName?.includes("/error") && (
                    <Sidebar
                      isOpen={isSidebarOpen}
                      handleToggleSidebar={toggleSidebar}
                    />
                  )}
                {children}
              </div>
              <div className="flex md:hidden sticky bottom-0 z-50">
                {!pathName?.includes("/login") &&
                  !pathName?.includes("/signUp") &&
                  !pathName?.includes("/error") && <LabelBottomNavigation />}
              </div>
            </div>
          </div>
          <ToastContainer position="top-right" transition={Flip} />
          <Chat open={chatOpen} setOpen={setChatOpen} />
        </StoreProvider>
      </body>
    </html>
  );
}
