"use client";

import { useEffect, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import Image from "next/image";
import { Button } from "@mui/material";
import EastIcon from "@mui/icons-material/East";
import SearchIcon from "@mui/icons-material/Search";
import FadeView from "./fade-view";
import { InventoryItem } from "@/app/(authentificated)/home/page";

type InventoryProps = {
  inventoryData: InventoryItem[];
};

export default function Forecast({ inventoryData }: InventoryProps) {
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventoryData: [...inventoryData].map((item) => ({
            ...item,
            name: `${item.color}(${item.name || "NO SKU"})`,
          })),
        }),
      });
      const result = await response.json();
      setForecastData(result.forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inventoryData?.length) {
      fetchForecast();
    }
  }, [inventoryData]);

  return (
    <div className="mb-16 px-4 py-6 sm:px-6 sm:py-8 border-2 rounded-lg border-white bg-white shadow-lg custom-box-shadow">
      <div className="mb-5 flex items-center gap-3">
        <Image
          className="text-[#5014ca]"
          src={"/svgs/Forecast.svg"}
          width={30}
          height={30}
          alt="forecast"
        />

        <h3 className="sm:text-2xl font-bold">Stock Forecast</h3>

        <Button
          variant="contained"
          className={`!ml-auto !capitalize font-semibold ${
            loading ? "bg-gray-300" : "!bg-[#4F12CA]"
          }`}
          loading={loading}
          onClick={fetchForecast}
        >
          Forecast
        </Button>
      </div>

      {loading ? (
        <span className="blink-dot"></span>
      ) : forecastData ? (
        <div className="flex flex-col gap-3">
          <p className="flex sm:items-center gap-1">
            <SearchIcon className="text-xl" />
            <TypeAnimation
              sequence={[
                "Based on your recent sales trends, here's what we recommend:",
                1000,
              ]}
              cursor={false}
              speed={60}
              style={{ fontWeight: 700 }}
            />
          </p>

          <FadeView
            componentsArray={forecastData.map((item: any, index: number) => (
              <div
                key={index}
                className={`px-4 py-2 flex flex-wrap items-center gap-2 rounded ${
                  item.current_stocks === 0
                    ? "bg-red-100"
                    : item.current_stocks < 50
                    ? "bg-orange-100"
                    : "bg-green-100"
                }`}
              >
                <p className="flex flex-wrap items-center gap-1">
                  <span>{item.product_name}</span>
                  <span className="font-bold">
                    ({item.current_stocks} in stock)
                  </span>
                  <EastIcon className="text-xl" />
                  <span className="font-bold">Selling 4/day.</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  Predicted Demand:
                  <span className="font-bold">{item.forecasted_demand}.</span>
                </p>
                <p className="flex flex-wrap items-center gap-1">
                  Reorder Suggestion:
                  <span className="font-bold">{item.reorder_suggestion}.</span>
                </p>
              </div>
            ))}
          />
        </div>
      ) : (
        <p className="p-6 text-center text-gray-400">No data available.</p>
      )}
    </div>
  );
}
