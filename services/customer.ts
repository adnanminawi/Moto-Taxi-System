import api from "./axios";
import {  type RideTracking, type CreateRide, type RideResult } from "@/types";


export async function fetchRideTracking(rideId :number): Promise<RideTracking >{
    const res = await api.get<RideTracking>(`/ride/${rideId}`);
    return res.data;

}

export async function createRide(data : CreateRide): Promise<RideResult>{
    const res = await api.post<RideResult>("/ride", data);
    return res.data;
    
}

export async function cancelRide(rideId: number): Promise<void> {
  await api.patch(`/ride/${rideId}`);
}