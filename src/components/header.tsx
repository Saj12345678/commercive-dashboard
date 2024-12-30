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
import { RxHamburgerMenu } from "react-icons/rx";

export interface HeaderProps {
  toggleSidebar?: any;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <div className="w-full flex justify-between py-4 px-6 h-[60px] bg-white">
      <div className="flex">
        <button className="md:hidden mr-4 flex" onClick={toggleSidebar}>
          <RxHamburgerMenu size={24} />
        </button>
        <h1 className="hidden md:flex text-xl text-[#4F11C9] font-bold">
          Commercive
        </h1>
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
