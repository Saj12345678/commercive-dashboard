"use client";

import dynamic from "next/dynamic";
import * as turf from "@turf/turf";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import {
  Paper,
  LinearProgress,
  Box,
  Typography,
  Button,
  Breadcrumbs,
} from "@mui/material";
import { useStoreContext } from "@/context/StoreContext";
import "leaflet/dist/leaflet.css";
import {
  differenceInDays,
  differenceInHours,
  format,
  formatDistanceToNow,
} from "date-fns";
import { enGB } from "date-fns/locale";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// ✅ Dynamically Import Components to Fix SSR Issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);

import { useMap } from "react-leaflet";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";
import { ParamValue } from "next/dist/server/request/params";
import { createClient } from "@/app/utils/supabase/client";

// ✅ Map styles
const mapStyles = {
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; <a href='https://carto.com/'>CartoDB</a>",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; <a href='https://carto.com/'>CartoDB</a>",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; <a href='https://www.esri.com/'>Esri</a>",
  },
};
const color = {
  dark: {
    color: "white",
  },
  light: {
    color: "purple",
  },
  satellite: {
    color: "white",
  },
};

const generateArcPath = (start: [number, number], end: [number, number]) => {
  const startLngLat: [number, number] = [start[1], start[0]];
  const endLngLat: [number, number] = [end[1], end[0]];
  const midpoint = turf.midpoint(startLngLat, endLngLat).geometry.coordinates;
  const arcHeightFactor = 0.2;
  const distance = turf.distance(startLngLat, endLngLat);
  const bearing = turf.bearing(startLngLat, endLngLat);
  const perpendicularBearing = bearing - 90;
  const arcMidpoint = turf.destination(
    midpoint,
    distance * arcHeightFactor,
    perpendicularBearing
  ).geometry.coordinates;

  const line = turf.lineString([startLngLat, arcMidpoint, endLngLat]);
  const curvedPath = turf.bezierSpline(line, {
    resolution: 10000,
    sharpness: 0.5,
  });

  return curvedPath.geometry.coordinates.map(
    (coord) => [coord[1], coord[0]] as [number, number]
  );
};

export default function OrderDetails() {
  const supabase = createClient();
  const { selectedStore, setChatOpen } = useStoreContext();
  const { order_id } = useParams();
  console.log(order_id);
  const [destination, setDestination] = useState<[number, number]>([0, 0]);
  const [storeLocation, setStoreLocation] = useState<[number, number]>([
    10, 10,
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [trackingData, setTrackingData] = useState<any>({});
  const [orderData, setOrderData] = useState<any>({});
  const [formattedStoreLocation, setFormattedStoreLocation] =
    useState<string>("");
  const [formattedShippingLocation, setFormattedShippingLocation] =
    useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>("light"); // 🌟 Track selected map style

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const { data: trackingData, error: trackingError } = await supabase
        .from("trackings")
        .select("*")
        .eq("order_id", order_id as string)
        .single();

      if (trackingError) throw trackingError;

      if (trackingData) {
        const destination = trackingData.destination as any;
        setDestination([
          destination?.latitude || 0,
          destination?.longitude || 0,
        ]);
        setStoreLocation([
          destination?.latitude || 10,
          destination?.longitude || 10,
        ]);
        setTrackingData(trackingData);
        if (trackingData.store_location) {
          try {
            const storeLocationData = JSON.parse(trackingData.store_location);
            if (storeLocationData) {
              const formatted = [
                storeLocationData.address1,
                storeLocationData.city,
                storeLocationData.country,
                storeLocationData.zip,
              ]
                .filter(Boolean)
                .join(", ");
              setFormattedStoreLocation(formatted);
            }
          } catch (error) {
            console.error("Error parsing store_location JSON:", error);
            setFormattedStoreLocation("Error: Could not parse address");
          }
        } else {
          setFormattedStoreLocation("—");
        }
      }
      const { data: orderData, error: orderError } = await supabase
        .from("order")
        .select("*")
        .eq("order_id", order_id as string)
        .single();

      if (orderError) throw orderError;
      if (orderData && orderData.shipping_address) {
        try {
          const shippingLocationData = JSON.parse(orderData.shipping_address);
          if (shippingLocationData) {
            const formatted = [
              shippingLocationData.address1,
              shippingLocationData.city,
              shippingLocationData.country_code,
              shippingLocationData.zip,
            ]
              .filter(Boolean)
              .join(", ");
            setFormattedShippingLocation(formatted);
          }
        } catch (error) {
          console.error("Error parsing shipping_address JSON:", error);
          setFormattedShippingLocation("Error: Could not parse address");
        }
      } else {
        setFormattedShippingLocation("—");
      }

      if (orderData) setOrderData(orderData);
      try {
        if (orderData && orderData.line_items) {
          const lineItems =
            typeof orderData.line_items === "string"
              ? JSON.parse(orderData.line_items)
              : orderData.line_items;
          if (Array.isArray(lineItems)) {
            const products = lineItems.map((item) => ({
              quantity: item.quantity,
              sku: item.sku || "00000",
              title: item.title,
            }));
            setProductDetails(products);
          } else {
            console.error("line_items is not an array:", lineItems);
            setProductDetails([]);
          }
        } else {
          console.warn("line_items is missing from orderData");
          setProductDetails([]);
        }
      } catch (error) {
        console.error("Error parsing line_items JSON:", error);
        setProductDetails([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, [selectedStore]);

  const polylinePositions = useMemo(
    () => generateArcPath(storeLocation, destination),
    [storeLocation, destination]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const calculateTimeDifference = (createdAt: string) => {
    if (!createdAt) return "N/A";

    const createdAtDate = new Date(createdAt);
    const now = new Date();

    const days = differenceInDays(now, createdAtDate);
    const hours = differenceInHours(now, createdAtDate) % 24;

    if (days === 0 && hours === 0) {
      return "Less than an hour";
    }

    const daysText = days > 0 ? `${days} day${days > 1 ? "s" : ""}` : "";
    const hoursText = hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : "";

    const separator = daysText && hoursText ? ", " : "";

    return `${daysText}${separator}${hoursText}`;
  };

  const formattedCurrentTime = format(currentTime, "dd/MM/yyyy h:mm a", {
    locale: enGB,
  });

  const handleCopyTracking = () => {
    if (trackingData?.tracking_url) {
      navigator.clipboard
        .writeText(trackingData.tracking_url)
        .then(() => {
          toast.success("Copied successfully!", {
            position: "top-right",
            autoClose: 2000,
          });
        })
        .catch(() => {
          toast.error("Failed to copy.", {
            position: "top-right",
            autoClose: 2000,
          });
        });
    } else {
      toast.warning("No tracking URL found.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const breadcrumbs = [
    <Link key="1" color="inherit" href="/shipments" className="text-md">
      Shipments
    </Link>,
    <Typography variant="body1" key="2" sx={{ color: "#969697" }}>
      Order #{order_id}
    </Typography>,
  ];

  return (
    <Box
      className="w-full border-l-none md:border-l-2 border-t-2 border-[#F4F4F7] rounded-tl-0 md:rounded-tl-[24px] overflow-hidden"
      style={{ height: "100%" }}
    >
      {loading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <LinearProgress />
        </div>
      )}
      {/* 🌟 Dropdown to Select Map Style */}
      {/* <div className="mb-4">
        <label className="text-sm font-semibold">Select Map Style:</label>
        <select
          className="ml-2 p-1 border-2 rounded"
          value={mapStyle}
          onChange={(e) =>
            setMapStyle(e.target.value as keyof typeof mapStyles)
          }
        >
          <option value="light">Light Mode</option>
          <option value="dark">Dark Mode</option>
          <option value="satellite">Satellite</option>
        </select>
      </div> */}

      <div
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        <MapContainer
          center={storeLocation}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          keyboard={false}
        >
          <ForceMapUpdate />

          {/* ✅ Use the selected map style */}
          <TileLayer
            url={mapStyles[mapStyle].url}
            attribution={mapStyles[mapStyle].attribution}
          />

          <CircleMarker
            center={storeLocation}
            pathOptions={{ color: color[mapStyle].color }}
            radius={20}
            stroke={false}
          >
            <Popup>Store Location</Popup>
          </CircleMarker>
          <CircleMarker
            center={destination}
            pathOptions={{ color: color[mapStyle].color }}
            radius={20}
            stroke={false}
          >
            <Popup>Destination</Popup>
          </CircleMarker>
          <Polyline
            positions={polylinePositions}
            color={color[mapStyle].color}
            weight={1}
          />
        </MapContainer>
        <Box className="absolute top-10 left-10" sx={{ zIndex: 1000 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            className="pb-4"
            aria-label="breadcrumb"
          >
            {breadcrumbs}
          </Breadcrumbs>
          <Box className="pb-6">
            <Typography
              variant="h4"
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.2rem",
                  md: "1.9rem",
                },
              }}
            >
              Shipment #{order_id}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.2rem",
                  md: "1rem",
                },
              }}
            >
              Started on{" "}
              {orderData.created_at
                ? format(
                    new Date(orderData.created_at),
                    "dd/MM/yyyy h:mm a"
                  ).toLowerCase()
                : "—"}
            </Typography>
          </Box>
        </Box>
        <Box
          className="absolute top-[5vh] right-5 h-[80vh] bg-white shadow-lg rounded-xl p-6 w-[400px]"
          sx={{
            border: "2px solid #E5E7EB",
            zIndex: 1000,
            width: { xs: "90%", sm: "60%", md: "460px" },
            left: { xs: "50%", sm: "65%", md: "auto" },
            transform: {
              xs: "translateX(-50%)",
              sm: "translateX(-50%)",
              md: "none",
            }, // Center it correctly
            marginX: { xs: 2, sm: 2, md: 0 },
          }}
        >
          {/* Title */}
          <Typography
            variant="h6"
            fontWeight={600}
            className="text-[#454545]"
            sx={{
              fontSize: {
                xs: "1.2rem",
                sm: "1.4rem",
                md: "1.5rem",
              },
            }}
          >
            Details
          </Typography>

          {/* Departure & Arrival */}
          <Box mt={2} className="relative">
            {/* Departure */}
            <Box className="flex items-start gap-2">
              <Typography
                variant="body2"
                className="text-gray-500 font-semibold"
              >
                •
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-500 font-semibold"
              >
                Departure
              </Typography>
            </Box>
            <Typography variant="body2" className="text-gray-700 pl-3">
              {formattedStoreLocation ? formattedStoreLocation : "—"}
            </Typography>

            {/* Animated Vertical Line */}
            <div className="absolute left-[0.45px] top-3 h-[67px] w-1 bg-[#F2F2F5]"></div>

            {/* Arrival */}
            <Box mt={4} className="flex items-start gap-2">
              <Typography
                variant="body2"
                className="text-gray-500 font-semibold"
              >
                •
              </Typography>
              <Typography
                variant="body2"
                className="text-gray-500 font-semibold"
              >
                Arrival
              </Typography>
            </Box>
            <Typography variant="body2" className="text-gray-700 pl-3">
              {formattedShippingLocation ? formattedShippingLocation : "—"}
            </Typography>
          </Box>

          {/* Time Details */}
          <Box
            mt={2}
            className="grid grid-cols-3 gap-x-8 text-start pt-4 whitespace-nowrap"
          >
            {/* Labels (Keys) */}
            <Typography variant="body2" className="text-gray-500 font-semibold">
              Total Time
            </Typography>
            <Typography variant="body2" className="text-gray-500 font-semibold">
              Departure Time
            </Typography>
            <Typography
              variant="body2"
              className="text-gray-500 font-semibold pl-4"
            >
              Arrival Time
            </Typography>

            {/* Values */}
            <Typography variant="caption" className="text-gray-700 font-medium">
              {orderData?.created_at
                ? calculateTimeDifference(orderData.created_at)
                : "—"}
            </Typography>
            <Typography variant="caption" className="text-gray-700 font-medium">
              {formattedCurrentTime}
            </Typography>
            <Typography
              variant="caption"
              className="text-gray-700 font-medium pl-4"
            >
              —
            </Typography>
          </Box>
          <Box className="relative my-4">
            <div className="w-full h-0.5 bg-[#F2F2F5]"></div>
          </Box>

          {/* Products Section */}
          <Box mt={4}>
            <Typography
              variant="h6"
              fontWeight={600}
              className="text-[#454545]"
            >
              Products
            </Typography>

            {/* Product Item */}
            {productDetails.length > 0 ? (
              productDetails.map((product, index) => (
                <Box key={index} mt={2} className="flex items-center gap-3">
                  <div
                    style={{
                      backgroundColor: "#f4f4f7",
                      width: "48px",
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  ></div>
                  <Box className="flex-1">
                    <Typography
                      variant="body2"
                      className="text-gray-700 font-semibold"
                    >
                      {product.title || "Unknown Product"}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      #{product.sku || "N/A"}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    className="text-gray-700 font-semibold"
                  >
                    QTY <span className="font-bold">{product.quantity}</span>
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" className="text-gray-500 mt-2">
                No products found.
              </Typography>
            )}
          </Box>

          {/* Buttons */}
          <Box mt={4} className="absolute bottom-6 right-6 flex gap-3">
            <Button
              variant="outlined"
              className="!rounded-md"
              sx={{
                borderColor: "#f0edf5",
                borderWidth: 2,
                color: "#454545",
                textTransform: "initial",
              }}
              onClick={handleCopyTracking}
            >
              Copy Tracking
            </Button>
            <Button
              variant="outlined"
              className="!rounded-md"
              sx={{
                borderColor: "#f0edf5",
                borderWidth: 2,
                color: "#454545",
                textTransform: "initial",
              }}
              onClick={() => setChatOpen(true)}
            >
              Create Ticket
            </Button>
          </Box>
        </Box>
      </div>
    </Box>
  );
}

const ForceMapUpdate = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);

  return null;
};
