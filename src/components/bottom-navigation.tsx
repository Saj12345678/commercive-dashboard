"use client"
import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HouseIcon from "./images/home";
import InventoryIcon from "./images/inventory";
import ShipmentIcon from "./images/shipment";
import UnionIcon from "./images/union";
import { useRouter } from "next/navigation";

export default function LabelBottomNavigation(props: any) {
  const router = useRouter();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue); 
  };

  const getIconColor = (route: string) =>
    props.route === route ? "#4f11c9" : "#000000";

  return (
    <BottomNavigation
      sx={{ width: 500, background: '#E5DCFB' }}
      value={props.route} 
      onChange={handleChange}
      className="bg-[#E5DCFB]"
    >
      <BottomNavigationAction
        value="/home"
        icon={<HouseIcon width={20} height={20} color={getIconColor("/home")} />}
      />
      <BottomNavigationAction
        value="/inventory"
        icon={
          <InventoryIcon
            width={20}
            height={20}
            color={getIconColor("/inventory")}
          />
        }
      />
      <BottomNavigationAction
        value="/shipment"
        icon={
          <ShipmentIcon
            width={20}
            height={20}
            color={getIconColor("/shipment")}
          />
        }
      />
      <BottomNavigationAction
        value="/"
        icon={<UnionIcon width={20} height={20} color={getIconColor("/")} />}
      />
    </BottomNavigation>
  );
}
