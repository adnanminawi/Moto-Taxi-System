import api from "./axios";
import {  type Customer, type UpdateCustomer, AdminLogin, AdminLoginResponse, AssignDriver, CreateDriver, Driver, RideInfo, Stats, DriverDetails,OnlineDriver} from "@/types";


export async function getCustomers(): Promise<Customer[]> {
    const res = await api.get<{customers: Customer[]}>("/customer")
    return res.data.customers;
}
export async function oneCustomer(id: number): Promise <Customer> {
    const res = await api.get<{ Customer_Profile: Customer[] }>(`/customer/${id}`);
    return res.data.Customer_Profile[0];
}
export async function updateCustomer(id: number, data: UpdateCustomer): Promise<{ message: string }> {
  const res = await api.put<{ message: string }>(`/customer/${id}`, data);
  return res.data;
}
export async function getDrivers(): Promise <Driver[]> {
    const res = await api.get<{ drivers: Driver[] }>("/admin/drivers");
    return res.data.drivers;
}
export async function createDriver(data :CreateDriver): Promise<{ok: string}> {
    const res = await api.post<{ok: string}>("/admin/drivers",data);
    return res.data;
}
export async function login(data: AdminLogin): Promise<AdminLoginResponse> {
    const res = await api.post<AdminLoginResponse>("/admin/login", data);
    return res.data;    
}
export async function getRides(): Promise<RideInfo[]> {
    const res = await api.get<{rides_info: RideInfo[]}>("/admin/ride");
    return res.data.rides_info;
}
export async function assignDriver(data:AssignDriver): Promise<{message: string}> {
    const res = await api.post<{message:string}>("/admin/assign",data);
    return res.data;
}
export async function getDriverDetails(id: number): Promise<DriverDetails> {
  const res = await api.get<DriverDetails>(`/admin/drivers/${id}`);
  return res.data;
}
export async function getStats(): Promise<Stats> {
    const res = await api.get<Stats>("/admin");
    return res.data;
}
export async function getOnlineDrivers(): Promise<OnlineDriver[]> {
  const res = await api.get<{ drivers: OnlineDriver[] }>("/admin/online");
  return res.data.drivers;
}
export async function deleteDriver(id: number): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/admin/drivers/${id}`);
  return res.data;
}
export async function logout() {
  const res = await api.post("/admin/logout");
  return res.data;
}