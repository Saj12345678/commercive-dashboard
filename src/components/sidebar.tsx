"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Button, Tooltip } from "@mui/material";
import { createClient } from "@/app/utils/supabase/client";
import Union from "./images/union";
import HouseIcon from "./images/home";
import InventoryIcon from "./images/inventory";
import ShipmentIcon from "./images/shipment";
import SettingIcon from "./images/setting";
import { Menu, MenuItem } from "@mui/material";
import Image from "next/image";
import LogoIcon from "./images/full-logo";
import { toast } from "react-toastify";
import CustomModal from "./ui/modal";
import { MdOutlineClose } from "react-icons/md";
import InputField from "./ui/custom-inputfild";
import CustomButton from "./ui/custom-button";
import { BsCopy } from "react-icons/bs";
import CustomSelection from "./ui/custom-select";
import { useStoreContext } from "@/context/StoreContext";
import { FiPlus } from "react-icons/fi";
import { IoIosMore } from "react-icons/io";

export interface SidebarProps {
  isOpen?: any;
  handleToggleSidebar?: any;
}

const data = [
  {
    title: "Home",
    href: "/home",
    icon: <HouseIcon width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: <InventoryIcon width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Shipments",
    href: "/shipments",
    icon: <ShipmentIcon width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Commercive Partners",
    href: "/commercive-partners",
    icon: <Union width={20} height={20} color={"#000000"} />,
  },
];

const adminData = [
  {
    title: "Home",
    href: "/admin/home",
    icon: <HouseIcon width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: <InventoryIcon width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Partners",
    href: "/admin/partners",
    icon: <Union width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Roles & Permissions",
    href: "/admin/roles",
    icon: <ShipmentIcon width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Tickets",
    href: "/admin/tickets",
    icon: <Union width={20} height={20} color={"#000000"} />,
  },
  {
    title: "Payouts",
    href: "/admin/payouts",
    icon: <Union width={20} height={20} color={"#000000"} />,
  },
];

export default function Sidebar({ isOpen, handleToggleSidebar }: SidebarProps) {
  const supabase = createClient();
  const pathName = usePathname();
  const router = useRouter();
  const { selectedStore, setSelectedStore, storeData } = useStoreContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [tooltipInfoMessage, setTooltipInfoMessage] = useState("");
  const [isInfoTooltipOpen, setInfoIsTooltipOpen] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showStoreData, setShowStoreData] = useState(false);
  const storeName = selectedStore ? selectedStore.label : null;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeStore, setActiveStore] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [stores, setStores] = useState<
    { id: string; store_name: string; is_store_listed: boolean }[]
  >([]);
  const [showList, setShowList] = useState(false);

  const filteredAdminData =
    userData?.visible_pages && Array.isArray(userData.visible_pages)
      ? adminData.filter((item) => {
          const pageName = item.href
            .replace("/admin/", "")
            .trim()
            .toLowerCase();
          console.log("userData.visible_pages :>> ", userData.visible_pages);
          return (userData.visible_pages ?? [])
            .map((page: string) => page?.trim().toLowerCase())
            .includes(pageName);
        })
      : [];

  const sidebarData = pathName?.includes("/admin")
    ? filteredAdminData?.length > 0
      ? filteredAdminData
      : adminData
    : data;

  // const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);

    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStoreData(false);
        setShowDisconnect(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // setAnchorEl(event.currentTarget); // Keeps the Menu functionality intact
    setShowStoreData((prev) => !prev); // Toggles the display of storeData
  };

  const handleStoreSelect = (store: any) => {
    setSelectedStore(store); // Set selected store
    setShowStoreData(false); // Hide store list after selection
    setShowDisconnect(false);
  };

  const handleAddStore = () => {
    console.log("Add Store");
  };
  const handleMoreClick = (store: { value: string; label: string } | null) => {
    setShowStoreData(true);

    if (activeStore?.value === store?.value) {
      setShowDisconnect((prev) => !prev);
    }
    setActiveStore(store);
    setShowDisconnect(true);
  };

  const disconnectStore = async () => {
    if (activeStore) {
      try {
        const { error } = await supabase
          .from("stores")
          .update({ is_store_listed: false })
          .eq("id", activeStore.value);

        if (error) {
          console.error("Error disconnecting store:", error.message);
          return;
        }
        window.location.reload();
        setShowDisconnect(false);
      } catch (error) {
        console.error("Unexpected error while disconnecting store:", error);
      }
    }
  };

  const fetchStores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stores")
      .select("id, store_name, is_store_listed");
    if (error) {
      console.error("Error fetching stores:", error.message);
    } else {
      setStores(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const connectStore = async (storeId: string) => {
    const { error } = await supabase
      .from("stores")
      .update({ is_store_listed: true })
      .eq("id", storeId);

    if (error) {
      console.error("Error connecting store:", error.message);
    } else {
      window.location.reload();
      fetchStores();
    }
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

  // const handleLogout = async () => {
  //   const { error } = await supabase.auth.signOut();
  //   if (!error) {
  //     router.push("/login");
  //   }
  // };

  const generateNameFromEmail = (email: string) => {
    if (!email || typeof email !== "string") {
      return "Anonymous";
    }
    const localPart = email.split("@")[0];
    const parts = localPart.match(/[a-z]+/gi);

    if (!parts) return "Anonymous";

    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const handleAffiliateClick = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Unable to fetch user information.");
        return;
      }

      const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data?.referral_code) {
        toast.error("Unable to fetch referral code.");
        return;
      }

      setReferralLink(
        `${process.env.NEXT_PUBLIC_CLIENT_URL}/signUp?referral=${data.referral_code}`
      );
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleReferralLinkChange = (event: any) => {
    setReferralLink(event.target.value);
  };

  const handleReferralLinkCopy = () => {
    if (referralLink) {
      navigator.clipboard
        .writeText(referralLink)
        .then(() => {
          setTooltipMessage("Copied!");
          setIsTooltipOpen(true);
          setTimeout(() => setIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        })
        .catch(() => {
          setTooltipMessage("Failed to copy.");
          setIsTooltipOpen(true);
          setTimeout(() => setIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        });
    } else {
      setTooltipMessage("No referral link to copy.");
      setIsTooltipOpen(true);
      setTimeout(() => setIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
    }
  };
  const handleLinkInfoCopy = () => {
    const textToCopy = `Hey! I just started using this fantastic Order Tracking App that keeps me updated on all my deliveries. It’s super convenient and saves me so much time! If you sign up with my link, we both get exclusive discounts on our next orders. Check it out!
      ${referralLink}`;
    if (textToCopy) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setTooltipInfoMessage("Copied!");
          setInfoIsTooltipOpen(true);
          setTimeout(() => setInfoIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        })
        .catch(() => {
          setTooltipInfoMessage("Failed to copy.");
          setInfoIsTooltipOpen(true);
          setTimeout(() => setInfoIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
        });
    } else {
      setTooltipInfoMessage("No referral link to copy.");
      setInfoIsTooltipOpen(true);
      setTimeout(() => setInfoIsTooltipOpen(false), 2000); // Hide tooltip after 2 seconds
    }
  };

  useEffect(() => {
    const getUserDetails = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("No user found");
        return;
      }

      const { data: userData, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      let visiblePages = userData?.visible_pages;

      if (Array.isArray(visiblePages) && typeof visiblePages[0] === "string") {
        try {
          visiblePages = JSON.parse(visiblePages[0]);
        } catch (err) {
          console.error("Error parsing visible_pages:", err);
          visiblePages = [];
        }
      }

      setUserData({ visible_pages: visiblePages });
    };

    getUserDetails();
  }, []);

  return (
    <>
      {/* Sidebar for larger screens */}
      {/* {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="loader"></div>
        </div>
      )} */}
      <div
        className={`hidden md:flex flex-col ${
          isCollapsed ? "w-24" : "w-[360px]"
        } transition-all duration-500 ${
          pathName?.includes("/admin") ? "bg-[#1b1838]" : "bg-white"
        } h-full pb-6`}
      >
        <div
          className={`flex flex-col ${
            isCollapsed ? "gap-5" : "gap-8"
          } justify-between h-full px-3 pb-3`}
        >
          <div
            className={`flex flex-col ${
              isCollapsed ? "gap-5" : "gap-8"
            } h-full`}
          >
            <div className="flex flex-col gap-2 relative">
              {!pathName?.includes("/admin") && (
                <div
                  className={`w-full flex justify-between border-2 border-[#F4F4F7] rounded-md py-2 px-4 ${
                    isCollapsed && "!px-1"
                  }`}
                >
                  <div className={`flex w-full ${isCollapsed && "hidden"}`}>
                    <div
                      className="flex w-full gap-2 items-center cursor-pointer"
                      onClick={toggleSidebar}
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
                      <div className="flex flex-col">
                        <h2>
                          {storeName == "satish-dev" ? "Golf Pro" : storeName}
                        </h2>
                        <p className="text-[#B1B0B0]">Connected</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div
                        onClick={handleClick}
                        className="flex gap-2 items-center cursor-pointer"
                      >
                        <Image
                          src="/svgs/DownArrow.svg"
                          width={14}
                          height={14}
                          alt="down-arrow"
                          // className={`transition-transform duration-300 ${showStoreData ? 'rotate-180' : ''}`}
                        />
                      </div>
                      {/* <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu> */}
                    </div>
                  </div>
                  <div
                    className={`${
                      !isCollapsed && "hidden"
                    } flex w-full cursor-pointer justify-center`}
                    onClick={toggleSidebar}
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
                  </div>
                </div>
              )}
              {showStoreData && !isCollapsed && (
                <div
                  ref={dropdownRef}
                  className="w-full border-2 rounded shadow-lg absolute top-[78px] "
                >
                  <div className="h-full max-h-[147px] overflow-y-auto custom-scrollbar cursor-pointer">
                    {storeData && storeData.length > 0 ? (
                      storeData.map((store, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 border-b ${
                            store.label === storeName
                              ? "bg-[#F3E8FF] hover:bg-none"
                              : "bg-[#F9F9FF] hover:bg-[#F9F9FF]"
                          }`}
                          onClick={() => handleStoreSelect(store)} // Select store on click
                        >
                          <p>
                            {store.label == "satish-dev"
                              ? "Golf Pro"
                              : store.label}
                          </p>
                          <IoIosMore
                            scale={20}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click event
                              handleMoreClick(store);
                            }}
                          />
                          {showDisconnect &&
                            activeStore?.value === store.value && (
                              <div className="absolute top-0 right-0 mt-2 w-32 bg-white shadow-md rounded-md p-2 text-sm">
                                <button
                                  className="w-full text-red-500 rounded-md py-2"
                                  onClick={disconnectStore}
                                >
                                  Disconnect Store
                                </button>
                              </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <p className="p-4 bg-white">No stores available.</p>
                    )}
                  </div>
                  <div
                    className="p-3 cursor-pointer bg-white hover:bg-[#f9f9ff] border-t"
                    onClick={() => handleAddStore()} // Call function to add a store
                  >
                    <p
                      className="flex items-center gap-1 text-[#4F12CA]"
                      onClick={() => setShowList(!showList)}
                    >
                      <span>
                        <FiPlus size={20} />
                      </span>{" "}
                      Connect new store
                    </p>
                  </div>
                  {showList && (
                    <CustomModal
                      onClose={() => setShowList(false)}
                      maxWidth={"max-w-[400px]"}
                    >
                      <div className="bg-white mt-1 p-3 rounded-lg">
                        <h3 className="font-semibold text-lg">
                          Available Stores
                        </h3>
                        {loading ? (
                          <p>Loading...</p>
                        ) : stores.length === 0 ? (
                          <p>No stores available to connect.</p>
                        ) : (
                          <div>
                            {stores.map((store) => (
                              <div
                                className="flex flex-row justify-between items-center gap-4 py-2"
                                key={store.id}
                              >
                                <p className="flex-1">{store.store_name}</p>
                                <p
                                  className={`w-3 h-3 rounded-full ${
                                    store.is_store_listed
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></p>
                                <button
                                  onClick={() => connectStore(store.id)}
                                  className={`px-3 py-1 ml-4 rounded-lg ${
                                    store.is_store_listed
                                      ? "bg-gray-200 text-white cursor-not-allowed"
                                      : "bg-[#4710B5] text-white"
                                  }`}
                                  disabled={store.is_store_listed}
                                >
                                  Connect store
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CustomModal>
                  )}
                </div>
              )}
            </div>
            {pathName?.includes("/admin") && (
              <div className="p-3">
                <LogoIcon width={150} height={35} color={"#ffffff"} />
              </div>
            )}

            {/* <CustomSelection
                className="rounded-[8px] cursor-pointer"
                placeholder={"Select store"}
                data={storeData} // Pass the fetched store data
                value={selectedStore}
                onChange={setSelectedStore}
                label={'Select store'}
            /> */}
            <div
              className={`flex flex-col gap-2 overflow-y-auto custom-scrollbar`}
            >
              {sidebarData.map((link, index) => {
                return (
                  <div key={index}>
                    <Link
                      href={link.href}
                      key={index}
                      prefetch={false}
                      className={`flex items-center rounded-md gap-3 p-3 
                       ${
                         pathName?.includes("/admin")
                           ? pathName === link.href
                             ? "text-white bg-[#231e45]"
                             : "text-white bg-[#1b1838] hover:bg-[#231e45]"
                           : pathName === link.href
                           ? "text-black bg-[#F9F9FF]"
                           : "text-black bg-[#FFF] hover:bg-purple-100"
                       } 
                      ${isCollapsed && "justify-center"}`}
                    >
                      <span className={`${isCollapsed && "justify-center"}`}>
                        {React.cloneElement(link.icon, {
                          color: pathName?.includes("/admin")
                            ? pathName === link.href
                              ? "white"
                              : "white"
                            : pathName === link.href
                            ? "#4F11C9"
                            : "#000000",
                        })}
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
                );
              })}
            </div>
          </div>

          {!pathName?.includes("/admin") && (
            <div
              className="flex flex-col w-full gap-2 cursor-pointer"
              onClick={() => {
                router.push("/profile");
              }}
            >
              <div
                className={`flex ${isCollapsed && "justify-center"} ${
                  pathName === "setting"
                    ? "text-black bg-[#F9F9FF]"
                    : "text-black bg-[#FFF] hover:bg-purple-100"
                } items-center w-full gap-3 p-3`}
              >
                <SettingIcon
                  width={20}
                  height={20}
                  color={pathName === "setting" ? "#4F11C9" : "#000000"}
                />
                {!isCollapsed && (
                  <p className="text-black text-sm tracking-wider">Settings</p>
                )}
              </div>
            </div>
          )}
          {!pathName?.includes("/admin") && (
            <div
              className={`w-full flex flex-col bg-[#9474E4] border-2 border-[#F4F4F7] rounded-[24px] py-8 px-4 gap-4 ${
                isCollapsed && "hidden"
              }`}
              style={{
                borderRadius: "25px",
                background:
                  "linear-gradient(130deg, rgb(47,13,116) 0%, rgb(126,81,216) 36%, rgb(225,217,248) 100%)",
              }}
            >
              <div>
                <LogoIcon width={"70%"} height={35} color={"#ffffff"} />
              </div>
              <p className="text-white text-sm">
                Refer new members to commercive and unlock up to 1% commision on
                all orders placed through us
              </p>
              <Button
                className="!w-[140px] !capitalize !text-sm !text-nowrap !bg-white !text-[#454545] !font-bold !rounded-md !mt-3"
                onClick={handleAffiliateClick}
              >
                + Invite People
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* for mobile screen */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
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
              {!pathName?.includes("/admin") && (
                <div
                  className={`w-full flex justify-between border-2 border-[#F4F4F7] rounded-md p-2 bg-white`}
                >
                  <div
                    className={`flex w-full`}
                    onClick={() => {
                      setIsCollapsed(false);
                    }}
                  >
                    <div className="flex w-full gap-2">
                      <div className="flex items-center">
                        <Avatar
                          alt="User Avatar"
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#D7C9F7",
                            color: "#4F12CA",
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <h2>{storeName}</h2>
                        <p className="text-[#B1B0B0]">Connected</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div
                        onClick={handleClick}
                        className="flex gap-2 items-center cursor-pointer"
                      >
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
                    >
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu> */}
                    </div>
                  </div>
                </div>
              )}
              {showStoreData && !isCollapsed && (
                <div
                  ref={dropdownRef}
                  className="w-[275px] border-2 rounded shadow-lg absolute top-24 left-3 z-[100] bg-white"
                >
                  <div className="h-full max-h-[147px] overflow-y-auto custom-scrollbar cursor-pointer">
                    {storeData && storeData.length > 0 ? (
                      storeData.map((store, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 border-b ${
                            store.label === storeName
                              ? "bg-[#F3E8FF] hover:bg-none"
                              : "bg-[#F9F9FF] hover:bg-[#F9F9FF]"
                          }`}
                          onClick={() => handleStoreSelect(store)} // Select store on click
                        >
                          <p>{store.label}</p>
                          <IoIosMore
                            scale={20}
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click event
                              handleMoreClick(store);
                            }}
                          />
                          {showDisconnect &&
                            activeStore?.value === store.value && (
                              <div className="absolute top-0 right-0 mt-2 w-32 bg-white shadow-md rounded-md p-2 text-sm">
                                <button
                                  className="w-full text-red-500 rounded-md py-2"
                                  onClick={disconnectStore}
                                >
                                  Disconnect Store
                                </button>
                              </div>
                            )}
                        </div>
                      ))
                    ) : (
                      <p className="p-4">No stores available.</p>
                    )}
                  </div>
                  <div
                    className="p-3 cursor-pointer bg-white hover:bg-[#f9f9ff] border-t"
                    onClick={() => handleAddStore()} // Call function to add a store
                  >
                    <p
                      className="flex items-center gap-1 text-[#4F12CA]"
                      onClick={() => setShowList(!showList)}
                    >
                      <span>
                        <FiPlus size={20} />
                      </span>{" "}
                      Connect new store
                    </p>
                    {showList && (
                      <CustomModal
                        onClose={() => setShowList(false)}
                        maxWidth={"max-w-[350px]"}
                      >
                        <div className="bg-white mt-1 rounded-lg">
                          <h3 className="font-semibold text-lg">
                            Available Stores
                          </h3>
                          {loading ? (
                            <p>Loading...</p>
                          ) : stores.length === 0 ? (
                            <p>No stores available to connect.</p>
                          ) : (
                            <div>
                              {stores.map((store) => (
                                <div
                                  className="flex flex-row justify-between items-center gap-4 py-2"
                                  key={store.id}
                                >
                                  <p className="flex-1">{store.store_name}</p>
                                  <p
                                    className={`w-3 h-3 rounded-full ${
                                      store.is_store_listed
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  ></p>
                                  <button
                                    onClick={() => connectStore(store.id)}
                                    className={`px-3 py-1 rounded-lg ${
                                      store.is_store_listed
                                        ? "bg-gray-200 text-white cursor-not-allowed"
                                        : "bg-[#4710B5] text-white"
                                    }`}
                                    disabled={store.is_store_listed}
                                  >
                                    Connect store
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CustomModal>
                    )}
                  </div>
                </div>
              )}
              {/* <CustomSelection
                className="rounded-[8px] cursor-pointer"
                placeholder={"Select store"}
                data={storeData} // Pass the fetched store data
                value={selectedStore}
                onChange={setSelectedStore}
                label={'Select store'}
            /> */}
              {/* Links Section */}
              <div
                className={`flex flex-col gap-2 overflow-y-auto custom-scrollbar bg-white`}
              >
                {sidebarData.map((link, index) => (
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
                      <span className={`${isCollapsed && "justify-center"}`}>
                        {React.cloneElement(link.icon, {
                          color: pathName === link.href ? "#4F11C9" : "#000000",
                        })}
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
            {!pathName?.includes("/admin") && (
              <div
                className="flex flex-col w-full gap-2 cursor-pointer bg-white"
                onClick={() => {
                  router.push("/profile");
                }}
              >
                <div
                  className={`flex ${
                    pathName === "setting"
                      ? "text-black bg-[#F9F9FF]"
                      : "text-black bg-[#FFF] hover:bg-purple-100"
                  } items-center w-full gap-3 p-3`}
                >
                  <SettingIcon
                    width={20}
                    height={20}
                    color={pathName === "setting" ? "#4F11C9" : "#000000"}
                  />
                  <p className="text-black text-sm tracking-wider">Settings</p>
                </div>
              </div>
            )}

            {/* Footer Section */}
            {!pathName?.includes("/admin") && (
              <div
                className={`w-full flex flex-col bg-[#9474E4] border-2 border-[#F4F4F7] rounded-[24px] py-8 px-4 gap-4 }`}
                style={{
                  borderRadius: "25px",
                  background:
                    "linear-gradient(130deg, rgb(47,13,116) 0%, rgb(126,81,216) 36%, rgb(225,217,248) 100%)",
                }}
              >
                <div>
                  <LogoIcon width={"70%"} height={35} color={"#ffffff"} />
                </div>
                <p className="text-white text-sm">
                  Refer new members to commercive and unlock up to 1% commission
                  on all orders placed through us
                </p>
                <Button
                  className="!w-[140px] !capitalize !text-sm !text-nowrap !bg-white !text-[#454545] !font-bold !rounded-md !mt-3"
                  onClick={handleAffiliateClick}
                >
                  + Invite People
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      {isModalOpen && (
        <CustomModal maxWidth={"w-max"}>
          <div className="flex flex-col rounded p-2 gap-4">
            <div className="flex justify-between">
              <p className="text-xl font-semibold">Share</p>
              <MdOutlineClose size={24} onClick={closeModal} />
            </div>
            <p className="text-sm">
              Copy the link and send it to your friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <InputField
                name="referralLink"
                placeholder=""
                type="text"
                className="!h-10 !text-[#929292] text-sm"
                label={""}
                value={referralLink}
                onChange={handleReferralLinkChange}
                bgColor={"#F5F5F5"}
                boxBorder={"border-transparent"}
                readOnly
              />
              <Tooltip
                title={tooltipMessage}
                open={isTooltipOpen}
                arrow
                disableFocusListener
                disableHoverListener
                disableTouchListener
              >
                <div>
                  <CustomButton
                    label="Copy"
                    className="w-max"
                    callback={handleReferralLinkCopy}
                  />
                </div>
              </Tooltip>
            </div>
            <div className="flex flex-col bg-[#F5F5F5] border px-4 py-6 rounded-lg gap-3">
              <div className="flex justify-between items-center">
                <p className="font-bold">Text Preview</p>
                <Tooltip
                  title={tooltipInfoMessage}
                  open={isInfoTooltipOpen}
                  arrow
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                >
                  <div>
                    <CustomButton
                      label="Copy"
                      className="w-max !bg-transparent !text-[#4F11C9]"
                      callback={handleLinkInfoCopy}
                      prefixIcon={<BsCopy size={14} color="#4F11C9" />}
                    />
                  </div>
                </Tooltip>
              </div>
              <p className="max-w-[500px] text-sm">
                Hey! I just started using this fantastic Order Tracking App that
                keeps me updated on all my deliveries. It’s super convenient and
                saves me so much time! If you sign up with my link, we both get
                exclusive discounts on our next orders. Check it out!
                <br />
                {referralLink}
              </p>
            </div>
          </div>
        </CustomModal>
      )}
    </>
  );
}
