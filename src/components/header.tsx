import React from "react";
import { Avatar } from "./ui/avatar";
import {
  MenuContent,
  MenuItem,
  MenuItemCommand,
  MenuRoot,
  MenuTrigger,
} from "./ui/menu";
import Image from "next/image";
import LogoIcon from "./images/full-logo";
import Logo from "./images/logo";

export interface HeaderProps {
  toggleSidebar?: any;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <div className="w-full flex justify-between py-4 px-6 h-[60px] bg-white">
      <div className="flex">
        <button className="md:hidden mr-4 flex" onClick={toggleSidebar}>
          <Logo width={24} height={35} />
        </button>
        <div className="hidden md:flex items-center justify-center">
          <LogoIcon width={150} height={35} />
        </div>
      </div>
      <MenuRoot>
        <MenuTrigger asChild>
          <div className="flex gap-2 items-center cursor-pointer">
            <Avatar src="https://bit.ly/broken-link" colorPalette="purple" />
            <Image
              src="/svgs/DownArrow.svg"
              width={14}
              height={14}
              alt="down-arrow"
            />
          </div>
        </MenuTrigger>
        <MenuContent>
          <MenuItem value="new-txt-a">
            New Text File <MenuItemCommand>⌘E</MenuItemCommand>
          </MenuItem>
          <MenuItem value="new-file-a">
            New File... <MenuItemCommand>⌘N</MenuItemCommand>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </div>
  );
};

export default Header;
