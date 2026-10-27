import { NextRequest, NextResponse } from "next/server";

// search a place name in Lebanon → up to 5 results with coordinates
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ message: "Type at least 3 characters." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=lb&limit=5`,
      { headers: { "User-Agent": "MotoTaxiApp/1.0" } }
    );
    if (!res.ok) {
      return NextResponse.json({ message: "Search is unavailable right now." }, { status: 502 });
    }

    const data = await res.json();
    const places = data.map((p: any) => ({
      name: p.display_name,
      lat: Number(p.lat),
      lng: Number(p.lon),
    }));
    return NextResponse.json(places);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}