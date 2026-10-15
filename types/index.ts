export type DriverLocation = {
    current_lat: number;
    current_lng: number;
    name : string;
    phone: string;
}
export type CreateRide = {
    name : string;
    phone : string;
    pickup_lat: number;
    pickup_lng: number;
    destination_lat : number;
    destination_lng : number;
}

export type RideResult = {
  ok: boolean;
  driver: { name: string; phone: string } | null;
  rideId: number;
  assignedDriver: number | null;
}

export type Driver = {
  id: number;
  name: string;
  phone: string;
  status: "offline" | "online" | "busy";
  current_lat: number;  
  current_lng: number;
};

export type DriverLogin ={
    phone : string;
    password : string;
}

export type DriverLoginResponse ={
    message : string;
    driver : Driver;
}

export type SessionResponse = {
  driver: Driver;
  totalRides: number;
};
export type DriverStatus = "online" | "offline";

export type StatusResponse ={
  message : string;
}
export type RideAction ={
  action: string;
  rideId: number;
}
export type Customer= {
  id: number;
  phone: string;
  name : string;
}
export type UpdateCustomer ={
  phone: string;
  name: string;
}
export type CreateDriver ={
  name: string;
  phone: string;
  password: string;
}
export type Admin={
  id: number;
  username: string;
}
export type AdminLogin ={
  username: string;
  password: string;
}
export type AdminLoginResponse ={
  message: string;
  admin: Admin;
}
export type RideInfo = {
  id: number;
  customer_name: string;
  driver_name: string | null;  
  pickup_address: string;
  destination_address: string;
  status: "searching" | "assigned" | "en_route" | "completed" | "cancelled" | "no_driver_found";
};
export type DriverRide = {
  id: number;
  customer_name: string;
  pickup_address: string;
  destination_address: string;
  status: RideInfo["status"];
};
  export type AssignDriver = {
    rideId : number;
    driverId :number;
  }
export type Stats={
total_drivers: number;
  total_customers: number;
  total_rides: number;
  completed_rides: number;
  searching_rides: number;
  cancelled_rides: number;
  online: number;
  busy: number;
  offline: number;
  recent_customers: {
    id: number;
    name: string;
    phone: string;
    created_at: string;
  }[];
}

export type RidePoint = {
  lat: string | number;   
  lng: string | number;
  address: string;
};

export type RideRequest = {
  id: number;
  customer: { name: string; phone: string };
  pickup: RidePoint;
  destination: RidePoint;
  status?: "assigned" | "en_route";   
};
export type PendingRideRow = {
  id: number;
  status: "searching";
  customer_name: string;
  customer_phone: string;
  pickup_lat: string;
  pickup_lng: string;
  pickup_address: string;
  destination_lat: string;
  destination_lng: string;
  destination_address: string;
};
export type OnlineDriver = {
  id: number;
  name: string;
  status: "online" | "busy";
  current_lat: string;
  current_lng: string;
};
export type RideTracking = {
  status: "searching" | "assigned" | "en_route" | "completed" | "cancelled" | "no_driver_found";
  driver: {
    name: string;
    phone: string;
    current_lat: number;
    current_lng: number;
  } | null;
};