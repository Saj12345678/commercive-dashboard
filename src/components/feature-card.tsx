"use client";
import { FaArrowDown, FaArrowUp } from "react-icons/fa6";
import SparklineChart from "./charts/spartLineChart";
import { useState } from "react";
import CustomModal from "@/components/ui/modal";
import { Button } from "@mui/material";

export interface FeatureCardProps {
  data?: any;
}
const amount = ["$100", "$500", "$100", "Max"];

export default function FeatureCard({ data }: FeatureCardProps) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleWithdrawalClick = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {data?.map((data: any, index: any) => (
        <div className="flex basis-1 flex-1" key={index}>
          <div className="flex flex-col w-full bg-[#ffffff] border-2 border-[#EBEBEB] rounded-lg mr-6 pl-6 py-4 pr-4 flex-0 overflow-hidden">
            <div className="flex w-full flex-col gap-8">
              <div className="flex w-full flex-wrap justify-between items-center">
                <h2
                  className={`text-[#454545] font-semibold ${
                    index === 3 ? "mt-0" : "mt-3"
                  }`}
                >
                  {data.name}
                </h2>
                {data.name === "Wallet" && (
                  <div
                    onClick={handleWithdrawalClick}
                    className="flex border bg-[#F4F4F7] text-[#3D3C3C] font-semibold rounded-md p-2 cursor-pointer"
                  >
                    Withdraw
                  </div>
                )}
              </div>
              <div className="flex w-full gap-2 items-end">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold text-[#454545] text-[18px]">
                      {index === 0 ? data.amount : "$" + data.amount}
                    </p>
                    <div
                      className="rounded-full w-[26px] h-[26px] flex justify-center items-center"
                      style={{ backgroundColor: data.bgColor }}
                    >
                      {index === 3 ? (
                        <FaArrowDown
                          color={data.color}
                          fontWeight="bold"
                        />
                      ) : (
                        <FaArrowUp color={data.color} fontWeight="bold" />
                      )}
                    </div>
                    <p
                      className="font-semibold"
                      style={{ color: data.color }}
                    >
                      {data.percentage}
                    </p>
                  </div>
                  <p className="text-[#B1B0B0]">compared to last week</p>
                </div>
                <div className="flex">
                  <div className="block w-full h-full overflow-hidden max-w-[100px]">
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
                  <p className="text-3xl font-bold">$ 1393.73</p>
                  <div className="flex gap-3">
                    {amount.map((amt: any, index) => (
                      <p
                        key={index}
                        className="text-sm font bold bg-slate-200 rounded-full px-4 py-1"
                      >
                        {amt}
                      </p>
                    ))}
                  </div>
                  <div className="w-full">
                    <p>To</p>
                    <div className="border rounded p-2">
                      <p className="text-sm">
                        Chase Bank **** **** **** 3842
                      </p>
                    </div>
                  </div>
                  <Button sx={{ width: '100%', background: '#4f11c9', color: '#ffffff', border: 'medium', fontWeight: 'bold'}}>
                    Pay out $ 1393.73
                  </Button>
                </div>
              </div>
            </CustomModal>
          )}
        </div>
      ))}
    </>
  );
}
