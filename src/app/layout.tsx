import { Flip, ToastContainer } from "react-toastify";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import LabelBottomNavigation from "@/components/bottom-navigation";
import Chat from "@/components/chat";
import { StoreProvider } from "@/context/StoreContext";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { createServerSideClient } from "./utils/supabase/server";
import { AffiliateRequestRow, StoreRow, UserRow } from "./utils/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let userinfo: UserRow | undefined = undefined;
  let affiliateRow: AffiliateRequestRow | null = null;
  let initialAllStore: StoreRow[] = [];
  const supabase = await createServerSideClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("user")
      .select()
      .eq("id", user.id)
      .single();
    userinfo = data!;
    const { data: affilate } = await supabase
      .from("affiliates")
      .select()
      .eq("user_id", user.id)
      .single();
    affiliateRow = affilate;
    const { data: allStoreData } = await supabase.from("stores").select();
    initialAllStore = allStoreData || [];
  }

  return (
    <html lang="en" suppressHydrationWarning className="overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-h-screen overflow-auto relative`}
        cz-shortcut-listen="true"
      >
        <StoreProvider
          initialUserinfo={userinfo}
          iniitialAffilateRow={affiliateRow}
          initialAllStore={initialAllStore}
        >
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
