"use client";
import React, { useState, useEffect } from "react";
import LogoIcon from "./images/full-logo";
import Logo from "./images/logo";
import { Avatar, Menu, MenuItem } from "@mui/material";
import Image from "next/image";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";

export interface HeaderProps {
  toggleSidebar?: any;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/login");
    }
  };

  return (
    <div className={`w-full flex justify-between py-4 px-6 h-[70px] bg-white`}>
      <div className="flex">
        <button className="md:hidden mr-4 flex" onClick={toggleSidebar}>
          <Logo width={24} height={35}/>
        </button>
        <div className="hidden md:flex items-center justify-center">
          <LogoIcon width={150} height={35} color={"#4F11C9"} />
        </div>
      </div>
      <div>
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={handleClick}
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
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: {
                width: 200,
                marginTop: 1,
              },
            },
          }}
        >
          <MenuItem
            onClick={handleClose}
            className={`${
              userEmail
                ? "bg-[#F3E8FF] hover:bg-[#D1B7F2] active:bg-[#D1B7F2]"
                : "bg-[#F9F9FF] hover:bg-[#E1E1E1] active:bg-[#D0D0D0]"
            }`}
            sx={{
              "&.Mui-focusVisible": {
                backgroundColor: "transparent",
              },
            }}
          >
            {userEmail ? userEmail : "Not Logged In"}
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            className="hover:bg-[#E1E1E1] active:bg-[#D0D0D0]"
            sx={{
              "&.Mui-focusVisible": {
                backgroundColor: "transparent",
              },
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default Header;
