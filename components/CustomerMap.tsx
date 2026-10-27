"use client";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { MapContainer, TileLayer, useMapEvents, useMap, Marker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import RouteLine from "./RouteLine";

type LatLng = { lat: number; lng: number };
type SetLatLng = Dispatch<SetStateAction<LatLng | null>>;

// markers drawn with HTML so they match the dots in the panel
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

type ClickHandlerProps = {
  pickup: LatLng | null;
  destination: LatLng | null;
  setPickup: SetLatLng;
  setDestination: SetLatLng;
};

function ClickHandler({ pickup, destination, setPickup, setDestination }: ClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      if (!pickup) {
        setPickup({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else if (!destination) {
        setDestination({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

// if the point is off-screen (picked from search or "my location"), fly the map to it
function FlyTo({ point }: { point: LatLng | null }) {
  const map = useMap();

  useEffect(() => {
    if (point && !map.getBounds().contains([point.lat, point.lng])) {
      map.flyTo([point.lat, point.lng], 15);
    }
  }, [point, map]);

  return null;
}

type CustomerMapProps = ClickHandlerProps & {
  driverLocation: LatLng | null;
};

export default function CustomerMap({
  driverLocation,
  pickup,
  destination,
  setPickup,
  setDestination,
}: CustomerMapProps) {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[33.8938, 35.5018]}
        zoom={12}
        zoomControl={false} // default is top-left, under our logo
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControl position="topright" />
        <ClickHandler
          pickup={pickup}
          destination={destination}
          setPickup={setPickup}
          setDestination={setDestination}
        />
        <FlyTo point={pickup} />
        <FlyTo point={destination} />
        {pickup && <Marker position={pickup} icon={pickupIcon} />}
        {destination && <Marker position={destination} icon={destinationIcon} />}

        {/* before a driver: route pickup → destination. with a driver: driver → pickup */}
        {pickup && destination && !driverLocation && <RouteLine from={pickup} to={destination} />}
        {pickup && driverLocation && <RouteLine from={driverLocation} to={pickup} />}
        {driverLocation && <Marker position={driverLocation} icon={driverIcon} />}
      </MapContainer>
    </div>
  );
}