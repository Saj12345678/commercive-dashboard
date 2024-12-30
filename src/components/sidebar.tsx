"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "./ui/menu";
import { createClient } from "@/app/utils/supabase/client";
import { User } from "@supabase/supabase-js";
export interface SidebarProps {
  isOpen?: any;
  handleToggleSidebar?: any;
}

const data = [
  {
    title: "Home",
    href: "/home",
    icon: <Image src="/svgs/Home.svg" width={20} height={20} alt="home" />,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: (
      <Image src="/svgs/Inventory.svg" width={20} height={20} alt="inventory" />
    ),
  },
  {
    title: "Shipments",
    href: "/shipment",
    icon: (
      <Image src="/svgs/Shipments.svg" width={20} height={20} alt="shipments" />
    ),
  },
  {
    title: "Commercive Partners",
    href: "/",
    icon: <Image src="/svgs/Union.svg" width={20} height={20} alt="union" />,
  },
];

export default function Sidebar({ isOpen, handleToggleSidebar }: SidebarProps) {
  const supabase = createClient();
  const pathName = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState<string>();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  const generateNameFromEmail = (email: string) => {
    const localPart = email.split("@")[0];
    const parts = localPart.match(/[a-z]+/gi);

    if (!parts) return "Anonymous";

    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const name = generateNameFromEmail(user?.user_metadata?.email);
      setUserData(name);
    };

    getUserDetails();
  }, []);

  return (
    <>
      {/* Sidebar for larger screens */}
      <div
        className={`hidden md:flex flex-col ${
          isCollapsed ? "w-24" : "w-[360px]"
        } transition-all duration-500 bg-white h-full pb-6`}
      >
        <div
          className={`flex flex-col ${
            isCollapsed ? "gap-5" : "gap-8"
          } justify-between h-full p-3`}
        >
          <div
            className={`flex flex-col ${
              isCollapsed ? "gap-5" : "gap-8"
            } h-full`}
          >
            <div
              className={`w-full flex justify-between border-4 border-[#F4F4F7] rounded-md py-2 px-4 ${
                isCollapsed && "!px-1"
              }`}
            >
              <div className={`flex w-full ${isCollapsed && "hidden"}`}>
                <div className="flex w-full gap-2">
                  <div className="flex cursor-pointer" onClick={toggleSidebar}>
                    <Avatar
                      src="https://bit.ly/broken-link"
                      colorPalette="purple"
                      width={12}
                      height={12}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h2>{userData}</h2>
                    <p className="text-[#B1B0B0]">Connected</p>
                  </div>
                </div>
                <div className="flex">
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <div className="flex gap-2 items-center cursor-pointer">
                        <Image
                          src="/svgs/DownArrow.svg"
                          width={14}
                          height={14}
                          alt="down-arrow"
                        />
                      </div>
                    </MenuTrigger>
                    <MenuContent>
                      <MenuItem
                        value="new-txt-a"
                        className="cursor-pointer"
                        onClick={handleLogout}
                      >
                        Logout
                      </MenuItem>
                    </MenuContent>
                  </MenuRoot>
                </div>
              </div>
              <div
                className={`${
                  !isCollapsed && "hidden"
                } flex w-full cursor-pointer`}
                onClick={toggleSidebar}
              >
                <Avatar
                  src="https://bit.ly/broken-link"
                  colorPalette="purple"
                  width={12}
                  height={12}
                />
              </div>
            </div>
            <div
              className={`flex flex-col gap-2 overflow-y-auto custom-scrollbar`}
            >
              {data.map((link, index) => (
                <div key={index}>
                  <Link
                    href={link.href}
                    key={index}
                    prefetch={false}
                    className={`flex items-center rounded-md gap-3 p-3 ${
                      pathName === link.href
                        ? "text-black bg-[#F9F9FF]"
                        : "text-black bg-[#FFF] hover:bg-purple-100"
                    } ${isCollapsed && "justify-center"}`}
                  >
                    <span
                      className={`${
                        pathName === link.href ? "text-[#4F11C9]" : "text-black"
                      } ${isCollapsed && "justify-center"}`}
                    >
                      {link.icon}
                    </span>
                    {!isCollapsed && (
                      <span
                        className={`flex text-sm font-medium overflow-hidden`}
                      >
                        {link.title}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-full gap-2 cursor-pointer">
            <div
              className={`flex ${isCollapsed && "justify-center"} ${
                pathName === "setting"
                  ? "text-black bg-[#F9F9FF]"
                  : "text-black bg-[#FFF] hover:bg-purple-100"
              } items-center w-full gap-3 p-3`}
            >
              <Image
                src="/svgs/Setting.svg"
                width={20}
                height={20}
                alt="setting"
              />
              {!isCollapsed && (
                <p className="text-black text-sm tracking-wider">Settings</p>
              )}
            </div>
          </div>
          <div
            className={`w-full flex flex-col bg-[#9474E4] border border-[#F4F4F7] rounded-[24px] py-8 px-4 gap-4 ${
              isCollapsed && "hidden"
            }`}
          >
            <h2 className="text-white font-bold text-[24px]">Commercive</h2>
            <p className="text-white text-sm">
              Refer new members to commercive and unlock up to 1% commision on
              all orders placed through us
            </p>
            <Button className="w-[140px] bg-white text-black font-bold rounded-md mt-3">
              + Invite People
            </Button>
          </div>
        </div>
      </div>
      {/* for mobile screen */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black opacity-40"
            onClick={handleToggleSidebar}
          />

          {/* Sidebar Container */}
          <div
            className={`flex w-[300px] bg-white h-full z-50 flex-col ${
              isCollapsed ? "gap-5" : "gap-8"
            } justify-between p-3`}
          >
            {/* Top Section */}
            <div
              className={`flex flex-col ${
                isCollapsed ? "gap-5" : "gap-8"
              } h-full`}
            >
              {/* User Section */}
              <div
                className={`w-full flex justify-between border-4 border-[#F4F4F7] rounded-md py-2 px-4 bg-white`}
              >
                <div
                  className={`flex w-full`}
                  onClick={() => {
                    setIsCollapsed(true);
                  }}
                >
                  <div className="flex w-full gap-2">
                    <div className="flex">
                      <Avatar
                        src="https://bit.ly/broken-link"
                        colorPalette="purple"
                        width={12}
                        height={12}
                      />
                    </div>
                    <div className="flex flex-col">
                      <h2>{userData}</h2>
                      <p className="text-[#B1B0B0]">Connected</p>
                    </div>
                  </div>
                  <div className="flex">
                    <MenuRoot>
                      <MenuTrigger asChild>
                        <div className="flex gap-2 items-center cursor-pointer">
                          <Image
                            src="/svgs/DownArrow.svg"
                            width={14}
                            height={14}
                            alt="down-arrow"
                          />
                        </div>
                      </MenuTrigger>
                      <MenuContent>
                        <MenuItem
                          value="new-txt-a"
                          className="cursor-pointer"
                          onClick={handleLogout}
                        >
                          Logout
                        </MenuItem>
                      </MenuContent>
                    </MenuRoot>
                  </div>
                </div>
              </div>

              {/* Links Section */}
              <div
                className={`flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-white`}
              >
                {data.map((link, index) => (
                  <div key={index}>
                    <Link
                      href={link.href}
                      key={index}
                      prefetch={false}
                      className={`flex items-center rounded-md gap-3 p-3 ${
                        pathName === link.href
                          ? "text-black bg-[#F9F9FF]"
                          : "text-black bg-[#FFF] hover:bg-purple-100"
                      } `}
                    >
                      <span
                        className={`${
                          pathName === link.href
                            ? "text-[#4F11C9]"
                            : "text-black"
                        } `}
                      >
                        {link.icon}
                      </span>
                      <span
                        className={`flex text-sm font-medium overflow-hidden`}
                      >
                        {link.title}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col w-full gap-2 cursor-pointer bg-white">
              <div
                className={`flex ${
                  pathName === "setting"
                    ? "text-black bg-[#F9F9FF]"
                    : "text-black bg-[#FFF] hover:bg-purple-100"
                } items-center w-full gap-3 p-3`}
              >
                <Image
                  src="/svgs/Setting.svg"
                  width={20}
                  height={20}
                  alt="setting"
                />
                <p className="text-black text-sm tracking-wider">Settings</p>
              </div>
            </div>

            {/* Footer Section */}
            <div
              className={`w-full flex flex-col bg-[#9474E4] border border-[#F4F4F7] rounded-[24px] py-8 px-4 gap-4 }`}
            >
              <h2 className="text-white font-bold text-[24px]">Commercive</h2>
              <p className="text-white text-sm">
                Refer new members to commercive and unlock up to 1% commission
                on all orders placed through us
              </p>
              <Button className="w-[140px] bg-white text-black font-bold rounded-md mt-3">
                + Invite People
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
