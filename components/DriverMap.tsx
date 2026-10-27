"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import RouteLine from "./RouteLine";
import type { RidePoint } from "@/types";

// same markers as the customer map
const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:0 0 0 6px rgba(22,163,74,.2)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:4px;background:#111;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const motoSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M8 17h6l3-6h-4l-2-4H8"/><path d="M15 7h3l2 4"/></svg>`;

const driverIcon = L.divIcon({
  className: "",
  html: `
    <div style="width:60px;height:60px;border-radius:50%;background:rgba(244,197,66,.3);display:grid;place-items:center">
      <div style="width:40px;height:40px;border-radius:50%;background:#111;border:3px solid #fff;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.3)">
        ${motoSvg}
      </div>
    </div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

// center the map on the driver once, when their location first arrives
function CenterOnDriver({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (position && !done.current) {
      map.setView(position, 14);
      done.current = true;
    }
  }, [position, map]);

  return null;
}

type DriverMapProps = {
  driverLocation: { lat?: number | string; lng?: number | string };
  pickup: RidePoint | null;
  destination: RidePoint | null;
  target: RidePoint | null; // where the driver is heading — the route goes there
};

export default function DriverMap({ driverLocation, pickup, destination, target }: DriverMapProps) {
  const hasLocation = driverLocation.lat != null && driverLocation.lng != null;
  const driverPos: [number, number] | null = hasLocation
    ? [Number(driverLocation.lat), Number(driverLocation.lng)]
    : null;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[33.8938, 35.5018]}
        zoom={10}
        zoomControl={false} // pinch / scroll to zoom; buttons would sit under the top bar
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CenterOnDriver position={driverPos} />

        {pickup && <Marker position={[Number(pickup.lat), Number(pickup.lng)]} icon={pickupIcon} />}
        {destination && <Marker position={[Number(destination.lat), Number(destination.lng)]} icon={destinationIcon} />}
        {driverPos && <Marker position={driverPos} icon={driverIcon} />}

        <RouteLine from={driverLocation} to={target} />
      </MapContainer>
    </div>
  );
}