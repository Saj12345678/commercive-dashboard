"use client";
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

  const getIconBgColor = (route: string) =>
    props.route === route ? "#E5DCFB" : "#FFFFFF";

  return (
    <BottomNavigation
      sx={{ width: 500, background: "#ffffff", borderTop: "2px solid #ebebeb", paddingX: '18px' }}
      value={props.route}
      onChange={handleChange}
      className="bg-[#E5DCFB]"
    >
      <BottomNavigationAction
        value="/home"
        icon={
          <div
            style={{
              backgroundColor: `${getIconBgColor("/home")}`,
              borderRadius: "50%",
              padding: "10px",
            }}
          >
            <HouseIcon width={20} height={20} color={getIconColor("/home")} />
          </div>
        }
      />
      <BottomNavigationAction
        value="/inventory"
        icon={
          <div
            style={{
              backgroundColor: `${getIconBgColor("/inventory")}`,
              borderRadius: "50%",
              padding: "10px",
            }}
          >
            <InventoryIcon
              width={20}
              height={20}
              color={getIconColor("/inventory")}
            />
          </div>
        }
      />
      <BottomNavigationAction
        value="/shipment"
        icon={
          <div
            style={{
              backgroundColor: `${getIconBgColor("/shipment")}`,
              borderRadius: "50%",
              padding: "10px",
            }}
          >
            <ShipmentIcon
              width={20}
              height={20}
              color={getIconColor("/shipment")}
            />
          </div>
        }
      />
      <BottomNavigationAction
        value="/"
        icon={
          <div
            style={{
              backgroundColor: `${getIconBgColor("/")}`,
              borderRadius: "50%",
              padding: "10px",
            }}
          >
            <UnionIcon width={20} height={20} color={getIconColor("/")} />
          </div>
        }
      />
    </BottomNavigation>
  );
}
