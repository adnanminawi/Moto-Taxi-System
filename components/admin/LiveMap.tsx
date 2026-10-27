"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LiveDriver, LiveRide } from "@/types";
import { driverIcon, pickupIcon, destinationIcon } from "./MapIcons";

// move the map to the selected ride's pickup (only when the selection changes)
function FlyTo({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();

  useEffect(() => {
    if (lat !== null && lng !== null) map.flyTo([lat, lng], 14);
  }, [lat, lng, map]);

  return null;
}

type LiveMapProps = {
  drivers: LiveDriver[];
  rides: LiveRide[];
  selectedId: number | null;
  onSelect: (rideId: number) => void;
};

export default function LiveMap({ drivers, rides, selectedId, onSelect }: LiveMapProps) {
  const selected = rides.find((r) => r.id === selectedId) ?? null;

  return (
    <MapContainer center={[33.8938, 35.5018]} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo
        lat={selected ? Number(selected.pickup_lat) : null}
        lng={selected ? Number(selected.pickup_lng) : null}
      />

      {/* every active ride's pickup — click to select it */}
      {rides.map((r) => (
        <Marker
          key={`ride-${r.id}`}
          position={[Number(r.pickup_lat), Number(r.pickup_lng)]}
          icon={pickupIcon(r.status === "searching", r.id === selectedId)}
          eventHandlers={{ click: () => onSelect(r.id) }}
        />
      ))}

      {/* selected ride: destination + a straight line to it */}
      {selected && (
        <>
          <Marker
            position={[Number(selected.destination_lat), Number(selected.destination_lng)]}
            icon={destinationIcon}
          />
          <Polyline
            positions={[
              [Number(selected.pickup_lat), Number(selected.pickup_lng)],
              [Number(selected.destination_lat), Number(selected.destination_lng)],
            ]}
            pathOptions={{ color: "#111", weight: 3, dashArray: "6 8" }}
          />
        </>
      )}

      {drivers.map((d) => (
        <Marker
          key={`driver-${d.id}`}
          position={[Number(d.current_lat), Number(d.current_lng)]}
          icon={driverIcon(d.status)}
        >
          <Popup>
            <p className="font-bold">{d.name}</p>
            <p className="text-xs text-gray-500">{d.phone}</p>
            <p className="mt-1 text-xs font-semibold">{d.status === "busy" ? "On a ride" : "Online"}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}