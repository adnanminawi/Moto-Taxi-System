"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

// default Leaflet icons break under bundlers, so point them at the CDN
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// leaflet-routing-machine bug: a response can still arrive after the control
// is removed on unmount. Skip clearing lines when there's no map.
const proto = L.Routing.Control.prototype as unknown as {
  _clearLines: (this: { _map: unknown }) => void;
};
const originalClearLines = proto._clearLines;
proto._clearLines = function () {
  if (this._map) originalClearLines.call(this);
};

type Point = { lat?: number | string; lng?: number | string };

type RouteLineProps = {
  from: Point | null;        // where the driver is
  to: Point | null;          // where they're heading
  showMarkers?: boolean;     // routing pins on/off
};

// 3 decimals ≈ 110 m — redraw only when the driver has really moved
const round = (v: number) => Math.round(v * 1000) / 1000;

export default function RouteLine({ from, to, showMarkers = false }: RouteLineProps) {
  const map = useMap();
  const controlRef = useRef<L.Routing.Control | null>(null);

  const fLat = round(Number(from?.lat));
  const fLng = round(Number(from?.lng));
  const tLat = Number(to?.lat);
  const tLng = Number(to?.lng);

  // 1. create the routing control ONCE, remove it only on unmount
  useEffect(() => {
    const plan = L.Routing.plan([], {
      addWaypoints: false,
      draggableWaypoints: false,
      ...(showMarkers ? {} : { createMarker: (() => false) as any }),
    });

    const control = L.Routing.control({
      plan,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    controlRef.current = control;

    return () => {
      controlRef.current = null;
      try {
        map.removeControl(control);
      } catch {
        // ignore async cleanup race
      }
    };
  }, [map, showMarkers]);

  // 2. when coordinates change, just move the waypoints
  useEffect(() => {
    const control = controlRef.current;
    if (!control) return;

    if (!fLat || !fLng || !tLat || !tLng) {
      control.setWaypoints([]); // no target → clear the route
      return;
    }

    control.setWaypoints([L.latLng(fLat, fLng), L.latLng(tLat, tLng)]);
  }, [fLat, fLng, tLat, tLng, showMarkers]);

  return null;
}