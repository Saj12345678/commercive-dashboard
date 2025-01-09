"use client";
import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HouseIcon from "./images/home";
import InventoryIcon from "./images/inventory";
import ShipmentIcon from "./images/shipment";
import UnionIcon from "./images/union";
import { usePathname, useRouter } from "next/navigation";

export default function LabelBottomNavigation(props: any) {
  const router = useRouter();
  const pathName = usePathname();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };

  const getIconColor = (route: string) =>
    props.route === route ? "#4f11c9" : "#ffffff";

  const getIconBgColor = (route: string) =>
    props.route === route ? "#E5DCFB" : "#1b1838";

  const data = [{ value: "/home", icon: <HouseIcon width={20} height={20} color={getIconColor("/home")} /> },
  { value: "/inventory", icon: <InventoryIcon width={20} height={20} color={getIconColor("/inventory")} /> },
  { value: "/shipment", icon: <ShipmentIcon width={20} height={20} color={getIconColor("/shipment")} /> },
  { value: "/commercive-partners", icon: <UnionIcon width={20} height={20} color={getIconColor("/commercive-partners")} /> },
  ]

  const adminData = [{ value: "/admin/home", icon: <HouseIcon width={20} height={20} color={getIconColor("/admin/home")} /> },
  { value: "/admin/inventory", icon: <InventoryIcon width={20} height={20} color={getIconColor("/admin/inventory")} /> },
  { value: "/admin/partners", icon: <UnionIcon width={20} height={20} color={getIconColor("/admin/partners")} /> },
  { value: "/admin/roles", icon: <ShipmentIcon width={20} height={20} color={getIconColor("/admin/roles")} /> },
  ]

  const linkData = pathName?.includes("/admin") ? adminData : data

  return (
    <BottomNavigation
      sx={{ width: {xs:'100%'}, background: '#1b1838', borderTop: "2px solid #ebebeb", paddingX: '18px' }}
      value={props.route}
      onChange={handleChange}
      className="bg-[#E5DCFB]"
    >
      {linkData.map((item, index) => {
        return (
          <div key={index} className="flex items-center">
            <BottomNavigationAction
              value={item.value}
              icon={
                <div
                  style={{
                    backgroundColor: `${getIconBgColor(item.value)}`,
                    borderRadius: "50%",
                    padding: "10px",
                  }}
                >
                  {item.icon}
                </div>
              }
            />
          </div>)
      })}
    </BottomNavigation>
  );
}
