// app/api/decision-sessions/[sessionId]/restaurants/route.js

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const { sessionId } = params;    // dynamic route
    const id = parseInt(sessionId, 10);

    // parse the body => { name, description, ... }
    const body = await request.json();

    // (1) Create a new Restaurant row
    // In a real app, you'd check if it already exists, etc.
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });

    // (2) Create a SessionItem referencing the new restaurant
    const newSessionItem = await prisma.sessionItem.create({
      data: {
        sessionId: id,
        restaurantId: newRestaurant.id,
      },
    });

    // (3) Return updated session or the newly created rows
    return NextResponse.json({
      restaurant: newRestaurant,
      sessionItem: newSessionItem,
    });
  } catch (error) {
    console.error("Error adding restaurant to session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
