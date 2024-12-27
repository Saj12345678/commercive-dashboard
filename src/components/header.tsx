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

const Header = () => {
  return (
    <div className="w-full flex justify-between py-4 px-6 h-[60px] bg-white">
      <div className="flex">
        <h1 className="text-xl text-[#4F11C9] font-bold">Commercive</h1>
      </div>
      <MenuRoot>
        <MenuTrigger asChild>
        <div className="flex gap-2 items-center cursor-pointer">
          <Avatar src="https://bit.ly/broken-link" colorPalette="purple" />
          <Image src="/svgs/DownArrow.svg" width={14} height={14} alt="down-arrow"/>
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
