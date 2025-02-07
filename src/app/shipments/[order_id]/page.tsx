"use client";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Paper, LinearProgress, Box } from "@mui/material";
import { useStoreContext } from "@/context/StoreContext";
import { createClient } from "../../utils/supabase/client";
import "leaflet/dist/leaflet.css";

// ✅ Dynamically Import Components to Fix SSR Issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

import { useMap } from "react-leaflet";

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
    }
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
    }
}
const generateArcPath = (start: [number, number], end: [number, number]) => {
    const startLngLat: [number, number] = [start[1], start[0]];
    const endLngLat: [number, number] = [end[1], end[0]];

    const midpoint = turf.midpoint(startLngLat, endLngLat).geometry.coordinates;
    const arcHeightFactor = 0.2;
    const distance = turf.distance(startLngLat, endLngLat);
    const bearing = turf.bearing(startLngLat, endLngLat);
    const perpendicularBearing = bearing - 90;
    const arcMidpoint = turf.destination(midpoint, distance * arcHeightFactor, perpendicularBearing).geometry.coordinates;

    const line = turf.lineString([startLngLat, arcMidpoint, endLngLat]);
    const curvedPath = turf.bezierSpline(line, { resolution: 10000, sharpness: 0.5 });

    return curvedPath.geometry.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
};

export default function OrderDetails() {
    const supabase = createClient();
    const { selectedStore } = useStoreContext();
    const [destination, setDestination] = useState<[number, number]>([0, 0]);
    const [storeLocation, setStoreLocation] = useState<[number, number]>([10, 10]);
    const [loading, setLoading] = useState<boolean>(false);
    const [trackingData, setTrackingData] = useState<any>({});
    const [orderData, setOrderData] = useState<any>({});
    const [mapStyle, setMapStyle] = useState<keyof typeof mapStyles>("light"); // 🌟 Track selected map style

    const fetchOrderData = async () => {
        setLoading(true);
        try {
            const { data: trackingData, error: trackingError } = await supabase
                .from("trackings")
                .select("*")
                .eq("order_id", "6055369801926")
                .single();

            if (trackingError) throw trackingError;

            if (trackingData) {
                setDestination([
                    trackingData?.destination?.latitude || 0,
                    trackingData?.destination?.longitude || 0,
                ]);
                setStoreLocation([
                    trackingData?.store_location?.latitude || 10,
                    trackingData?.store_location?.longitude || 10,
                ]);
                setTrackingData(trackingData);
            }

            const { data: orderData, error: orderError } = await supabase
                .from("order")
                .select("*")
                .eq("order_id", "6055369801926")
                .single();

            if (orderError) throw orderError;

            if (orderData) setOrderData(orderData);

        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderData();
    }, [selectedStore]);

    const polylinePositions = useMemo(() => generateArcPath(storeLocation, destination), [storeLocation, destination]);

    return (
        <Box className="w-full px-4 py-6 sm:px-6 sm:py-8" style={{ height: "100%" }}>
            {loading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <LinearProgress />
                </div>
            )}

            {/* 🌟 Dropdown to Select Map Style */}
            <div className="mb-4">
                <label className="text-sm font-semibold">Select Map Style:</label>
                <select
                    className="ml-2 p-1 border rounded"
                    value={mapStyle}
                    onChange={(e) => setMapStyle(e.target.value as keyof typeof mapStyles)}
                >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="satellite">Satellite</option>
                </select>
            </div>

            <div style={{ height: "100%", width: "100%" }}>
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

                    <CircleMarker center={storeLocation} pathOptions={{ color: color[mapStyle].color }} radius={20} stroke={false}>
                        <Popup>Store Location</Popup>
                    </CircleMarker>
                    <CircleMarker center={destination} pathOptions={{ color: color[mapStyle].color }} radius={20} stroke={false}>
                        <Popup>Destination</Popup>
                    </CircleMarker>
                    <Polyline positions={polylinePositions} color={color[mapStyle].color} weight={1} />
                </MapContainer>
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
