"use client";
import React, { useState, useEffect, useRef } from "react";
import LogoIcon from "./images/full-logo";
import Logo from "./images/logo";
import { Avatar } from "@mui/material";
import Image from "next/image";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BiWallet } from "react-icons/bi";
import { LuCircleHelp, LuLogOut, LuUserRound } from "react-icons/lu";
import { PiLockKey } from "react-icons/pi";

export interface HeaderProps {
  toggleSidebar?: any;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error.message);
      } else {
        setUserEmail(data.user?.email || null);
      }
    };

    fetchCurrentUser();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowDropdown, dropdownRef, avatarRef]);

  const handleLogout = async () => {
    const { error } = await supabase?.auth?.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <div className={`w-full flex justify-between py-4 px-6 h-[70px] bg-white`}>
      <div className="flex">
        <button className="md:hidden mr-4 flex" onClick={toggleSidebar}>
          <Logo width={24} height={35} />
        </button>
        <div className="hidden md:flex items-center justify-center">
          <LogoIcon width={150} height={35} color={"#4F11C9"} />
        </div>
      </div>
      <div>
        <div
          className="flex gap-2 items-center cursor-pointer relative"
          onClick={() => setShowDropdown(!showDropdown)}
          ref={avatarRef}
        >
          <Avatar
            alt="User Avatar"
            sx={{
              width: 40,
              height: 40,
              backgroundColor: "#D7C9F7",
              color: "#4F12CA",
            }}
          />
          <Image
            src="/svgs/DownArrow.svg"
            width={14}
            height={14}
            alt="down-arrow"
          />
        </div>
        {
          showDropdown &&
          <Dropdown userEmail={userEmail} handleLogout={handleLogout} dropdownRef={dropdownRef} />
        }
      </div>
    </div>
  );
};

export default Header;

interface DropdownProps {
  userEmail: string | null;
  handleLogout: (event: React.MouseEvent<HTMLElement>) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const Dropdown = ({ userEmail, handleLogout, dropdownRef }: DropdownProps) => {
  return (
    <div className="top-16 absolute right-4 bg-white border-2 border-custom-border-2 rounded-md text-sm text-custom-text-2 z-50 drop-down-shadow" ref={dropdownRef}>
      <div className="p-3 pt-2 border-b border-custom-border-2">
        <div className="flex items-center border-b border-custom-border-2 pb-2">
          <div className="bg-violet-300 w-7 h-7 flex justify-center items-center rounded-full overflow-hidden mr-1">
            <Avatar
              alt="User Avatar"
              sx={{
                width: 28,
                height: 28,
                backgroundColor: "#D7C9F7",
                color: "#4F12CA",
              }}
            />
          </div>
          <div className="ml-1">
            <p className="text-xs text-custom-text-3">{userEmail}</p>
          </div>
        </div>
        <div className="mt-2">
          <Link href="/profile" className="flex items-center mt-1 hover:underline">
            <LuUserRound size={14} />
            <p className="ml-2">Profile</p>
          </Link>
          <Link href="/reset-password" className="flex items-center mt-1 hover:underline">
            <PiLockKey size={14} />
            <p className="ml-2">Change Password</p>
          </Link>
          <Link href="#" className="flex items-center mt-1 hover:underline">
            <LuCircleHelp size={14} />
            <p className="ml-2">Help</p>
          </Link>
        </div>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center cursor-pointer hover:underline">
          <LuLogOut size={14} />
          <p className="ml-2" onClick={handleLogout}>Logout</p>
        </div>
      </div>
    </div>
  )
}