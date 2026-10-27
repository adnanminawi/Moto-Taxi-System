"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getOnlineDrivers } from "@/services/admin";
import type { OnlineDriver } from "@/types";

// same driver icon as the driver and customer maps — ring color shows the status
const motoSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M8 17h6l3-6h-4l-2-4H8"/><path d="M15 7h3l2 4"/></svg>`;

function driverIcon(status: string) {
  const ring = status === "busy" ? "rgba(244,197,66,.4)" : "rgba(22,163,74,.3)"; // yellow = on a ride, green = online
  return L.divIcon({
    className: "",
    html: `
      <div style="width:60px;height:60px;border-radius:50%;background:${ring};display:grid;place-items:center">
        <div style="width:40px;height:40px;border-radius:50%;background:#111;border:3px solid #fff;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.3)">
          ${motoSvg}
        </div>
      </div>`,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [0, -24],
  });
}

// fit the map to the drivers ONCE, so the admin can zoom freely afterwards
function FitDriversOnce({ drivers }: { drivers: OnlineDriver[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || drivers.length === 0) return;
    const bounds = drivers.map(
      (d) => [Number(d.current_lat), Number(d.current_lng)] as [number, number]
    );
    map.fitBounds(bounds, { padding: [40, 40] });
    hasFitted.current = true;
  }, [drivers, map]);

  return null;
}

export default function LiveDriversMap() {
  const [drivers, setDrivers] = useState<OnlineDriver[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setDrivers(await getOnlineDrivers());
      } catch (err) {
        console.error("Failed loading drivers:", err);
      }
    }
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <MapContainer center={[33.8938, 35.5018]} zoom={10} style={{ height: "100%", width: "100%" }}>
      <FitDriversOnce drivers={drivers} />
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {drivers.map((d) => (
        <Marker key={d.id} position={[Number(d.current_lat), Number(d.current_lng)]} icon={driverIcon(d.status)}>
          <Popup>
            <div className="min-w-[120px]">
              <p className="font-bold">{d.name}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                <span className={`h-2 w-2 rounded-full ${d.status === "busy" ? "bg-[#f4c542]" : "bg-green-600"}`} />
                {d.status === "busy" ? "On a ride" : "Online"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}