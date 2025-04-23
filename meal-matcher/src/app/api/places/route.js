// app/api/places/page.js

import { NextResponse } from 'next/server';


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const radius = 5000; 
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&key=${apiKey}`;

  
  try {
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Places API Error:", err);
    return NextResponse.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}