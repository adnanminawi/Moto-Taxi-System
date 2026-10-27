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
  last_location_update?: string | null;
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
export type DriverDetails = {
  driver_Profile: Driver[];   // the endpoint returns the row array
  rides: DriverRide[];
  totalRides: number;
};
export type Place = {
  name: string;
  lat: number;
  lng: number;
};
export type LiveDriver = {
  id: number;
  name: string;
  phone: string;
  status: "online" | "busy";
  current_lat: string | number;
  current_lng: string | number;
  last_location_update?: string | null;
};

export type LiveRide = {
  id: number;
  status: "searching" | "assigned" | "en_route";
  pickup_lat: string | number;
  pickup_lng: string | number;
  pickup_address: string | null;
  destination_lat: string | number;
  destination_lng: string | number;
  destination_address: string | null;
  customer_name: string;
  customer_phone: string;
  driver_name: string | null;
};

export type LiveData = { drivers: LiveDriver[]; rides: LiveRide[] };