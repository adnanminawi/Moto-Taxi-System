"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getPendingRide, rideService } from "@/services/driver";
import type { RideRequest } from "@/types";

type RidePopupProps = {
  setRideRequest: Dispatch<SetStateAction<RideRequest | null>>;
};

export default function RidePopup({ setRideRequest }: RidePopupProps) {
  useEffect(() => {
    console.log("[RidePopup] mounted");

    let lastRideId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function checkRide() {
      try {
        const ride = await getPendingRide();
        if (!ride || ride.id === lastRideId) return;

        lastRideId = ride.id;
        setRideRequest({
          id: ride.id,
          customer: { name: ride.customer_name, phone: ride.customer_phone },
          pickup: { lat: ride.pickup_lat, lng: ride.pickup_lng, address: ride.pickup_address },
          destination: { lat: ride.destination_lat, lng: ride.destination_lng, address: ride.destination_address },
        });

        if (timeoutId) clearTimeout(timeoutId);
        console.log("[RidePopup] timer started for ride", ride.id);

        timeoutId = setTimeout(async () => {
          console.log("[RidePopup] 30s passed, rejecting ride", ride.id);
          try {
            await rideService({ action: "reject", rideId: ride.id });
            console.log("[RidePopup] reject sent for ride", ride.id);
          } catch (err) {
            console.error("[RidePopup] auto-reject failed:", err);
          }
          setRideRequest(null);
        }, 30000);
      } catch (err) {
        console.error("[RidePopup] poll error:", err);
      }
    }

    checkRide();
    const interval = setInterval(checkRide, 3000);

    return () => {
      console.log("[RidePopup] cleanup — timer cleared");
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [setRideRequest]);

  return null;
}