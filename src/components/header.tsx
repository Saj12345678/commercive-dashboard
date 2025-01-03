import React, { useState } from "react";
import LogoIcon from "./images/full-logo";
import Logo from "./images/logo";
import { Avatar } from "@mui/material";
import { Menu, MenuItem } from "@mui/material";
import Image from "next/image";

export interface HeaderProps {
  toggleSidebar?: any;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="w-full flex justify-between py-4 px-6 h-[70px] bg-white">
      <div className="flex">
        <button className="md:hidden mr-4 flex" onClick={toggleSidebar}>
          <Logo width={24} height={35} />
        </button>
        <div className="hidden md:flex items-center justify-center">
          <LogoIcon width={150} height={35} />
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
        {/* <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My Account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu> */}
      </div>
    </div>
  );
};

export default Header;
