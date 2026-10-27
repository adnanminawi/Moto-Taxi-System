    import L from "leaflet";

// shared map markers for the admin maps — same look as the customer and driver maps

const motoSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="17" r="3"/><circle cx="19" cy="17" r="3"/><path d="M8 17h6l3-6h-4l-2-4H8"/><path d="M15 7h3l2 4"/></svg>`;

// black circle + ring: green = online, yellow = on a ride
export function driverIcon(status: string) {
  const ring = status === "busy" ? "rgba(244,197,66,.4)" : "rgba(22,163,74,.3)";
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

// pickup: green dot. waiting for a driver = yellow halo so it stands out
export function pickupIcon(waiting: boolean, selected: boolean) {
  const size = selected ? 22 : 16;
  const halo = waiting ? "0 0 0 8px rgba(244,197,66,.45)" : "0 0 0 6px rgba(22,163,74,.2)";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:${halo}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// destination: black square
export const destinationIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:4px;background:#111;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});