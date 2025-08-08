"use client";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import SparklineChart from "./charts/spartLineChart";
import { useState } from "react";
import CustomModal from "@/components/ui/modal";
import CustomButton from "./ui/custom-button";
import InputField from "./ui/custom-inputfild";
import { toast } from "react-toastify";
import { createClient } from "@/app/utils/supabase/client";
import { useStoreContext } from "@/context/StoreContext";

export interface FeatureCardProps {
  data?: any;
  page: any;
  dateRange?: any;
  userId?: string;
}
const amount = ["100", "500", "100", "Max"];

export default function FeatureCard({
  data,
  page,
  dateRange,
  userId,
}: FeatureCardProps) {
  const supabase = createClient();
  const { selectedStore, userinfo } = useStoreContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [address, setAddress] = useState<string>(userinfo!.email || "");
  const [selectedAmount, setSelectedAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handlePayoutChange = (e: any) => {
    const { name, value } = e.target;
    setAddress(value);
  };

  const handlePayoutSubmit = async () => {
    if (!address.trim()) {
      toast.error("Please enter your wallet address.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payouts")
        .insert({
          amount: Number(selectedAmount),
          paypal_address: address,
          userId: userId,
          store_url: selectedStore?.store_url!,
          status: "Pending",
        })
        .select();

      if (error) {
        toast.error(error.message);
      } else {
        if (data) {
          toast.success("Request payout successfully!");
        }
        setAddress("");
        setModalOpen(false);
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalClick = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAmount("");
    setAddress("");
  };
  return (
    <>
      {data?.map((data: any, index: any) => (
        <div className="flex flex-1" key={index}>
          <div
            className={`flex flex-col w-full bg-[#ffffff] ${
              index === 3 ? "mr-0" : "mr-0"
            } pl-6 py-4 pr-4 flex-0 overflow-hidden custom-box-shadow`}
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full flex-wrap justify-between items-center">
                <h2
                  className={`text-[#454545] font-semibold ${
                    page === "home"
                      ? index === 3
                        ? "mt-1"
                        : "mt-1"
                      : page === "commercive" && index === 3
                      ? "mt-0"
                      : "mt-1"
                  }`}
                >
                  {data.name}
                </h2>
                {data.name === "Wallet" && (
                  <div
                    onClick={handleWithdrawalClick}
                    className="flex border-2 bg-[#F4F4F7] text-[#3D3C3C] font-semibold rounded-md p-2 cursor-pointer"
                  >
                    Withdraw
                  </div>
                )}
              </div>
              <div className="flex w-full gap-2 items-end">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold text-[#454545] text-[18px]">
                      {page === "home"
                        ? index === 2
                          ? "$" + data.amount
                          : data.amount
                        : page === "commercive" && index === 0
                        ? data.amount
                        : "$" + data.amount}
                    </p>
                    <div
                      className={`rounded-full w-[26px] h-[26px] flex justify-center items-center ${
                        parseFloat(data.percentage) === 0 ? "hidden" : "" // Hide the entire div if percentage is 0
                      }`}
                      style={{
                        backgroundColor:
                          parseFloat(data.percentage) === 0
                            ? "transparent"
                            : data.bgColor,
                      }}
                    >
                      {index === 3 || parseFloat(data.percentage) < 0 ? (
                        <FaArrowDown color={data.color} fontWeight="bold" />
                      ) : parseFloat(data.percentage) > 0 ? (
                        <FaArrowUp color={data.color} fontWeight="bold" />
                      ) : null}{" "}
                    </div>
                    <p className="font-semibold" style={{ color: data.color }}>
                      {data.percentage}
                    </p>
                  </div>
                  <p className="text-sm">Compared to </p>
                  <p className="text-[#B1B0B0] text-sm">
                    {dateRange[0]?.startDate && dateRange[0]?.endDate
                      ? `${dateRange[0].startDate.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })} - ${dateRange[0].endDate.toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}`
                      : "Select a date range"}
                  </p>
                </div>
                <div className="flex">
                  <div className="block w-full h-full overflow-hidden max-w-[200px]">
                    <SparklineChart
                      data={data.series}
                      stokeColor={data.color}
                      fillColor={data.bgColor}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isModalOpen && (
            <CustomModal onClose={closeModal}>
              <div className="">
                <h2 className="text-lg font-semibold">Withdrawal</h2>
                <div className="flex flex-col items-center gap-3 mt-2">
                  <p className="text-3xl font-bold">
                    $ {selectedAmount || "1393.73"}
                  </p>
                  <div className="flex gap-3">
                    {amount.map((amt: any, index: any) => (
                      <p
                        key={index}
                        className="text-sm font bold bg-slate-200 rounded-full px-4 py-1 cursor-pointer"
                        onClick={() => setSelectedAmount(amt)}
                      >
                        {`$${amt}`}
                      </p>
                    ))}
                  </div>
                  <div className="w-full">
                    <p>To</p>
                    <InputField
                      name="address"
                      placeholder="Enter your paypal address"
                      type="text"
                      className="mt-[8px]"
                      label=""
                      value={address}
                      onChange={handlePayoutChange}
                      showPasswordSuffix={false}
                    />
                  </div>
                  <CustomButton
                    type="submit"
                    label={"REQUEST PAYOUT"}
                    className="w-full whitespace-nowrap px-6 text-sm lg:h-full"
                    callback={handlePayoutSubmit}
                    interactingAPI={loading}
                  />
                </div>
              </div>
            </CustomModal>
          )}
        </div>
      ))}
    </>
  );
}

export function FeatureCardSkeleton({ page }: { page: string }) {
  return (
    <div className="flex">
      {Array(4)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={`flex flex-col w-full bg-[#ffffff] ${
              index === 3 ? "mr-0" : "mr-6"
            } 
            pl-6 py-4 pr-4 flex-0 overflow-hidden custom-box-shadow`}
          >
            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full flex-wrap justify-between items-center">
                <p className="h-[22px] w-[135px] mt-1 bg-gray-200 rounded-md animate-pulse"></p>
                {page === "commercive" && index === 3 && (
                  <div className="h-[30px] w-[100px] bg-gray-200 rounded-md animate-pulse"></div>
                )}
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <p className="h-[22px] w-[80px] bg-gray-200 rounded-md animate-pulse"></p>
                    {page === "commercive" && (
                      <div className="w-[28px] h-[28px] bg-gray-200 rounded-full animate-pulse"></div>
                    )}
                    <p className="h-[20px] w-[30px] bg-gray-200 rounded-md animate-pulse"></p>
                  </div>
                  <p className="h-[18px] w-[100px] bg-gray-200 rounded-md animate-pulse"></p>
                  <p className="h-[18px] w-[110px] bg-gray-200 rounded-md animate-pulse"></p>
                </div>
                <div className="h-[50px] w-[181px] bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
