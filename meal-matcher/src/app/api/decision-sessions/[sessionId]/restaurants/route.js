// app/api/decision-sessions/[sessionId]/restaurants/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST => Add a new Restaurant + SessionItem, with validations
export async function POST(request, context) {
  console.log("Restaurants POST - Starting request");
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const id = parseInt(sessionId, 10);

    // Expect body = { name, description, participantName, googlePlaceId, ... }
    const body = await request.json();

    // 1) Verify the session exists, including sessionItems & participants
    const session = await prisma.decisionSession.findUnique({
      where: { id },
      include: {
        sessionItems: { include: { restaurant: true } },
        participants: true,
      },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2) Identify the participant
    const participantName = body.participantName || "";
    const participant = session.participants.find(
      (p) => p.name.toLowerCase() === participantName.toLowerCase()
    );
    if (!participant) {
      return NextResponse.json(
        { error: `Participant "${participantName}" not found in this session.` },
        { status: 400 }
      );
    }

    
    if (participant.done) {
      await prisma.decisionSessionParticipant.update({
        where: { id: participant.id },
        data: { done: false },
      });
    }

    // 4) Check if this restaurant is already in this session
    const existingSessionItem = session.sessionItems.find((item) => {
      const r = item.restaurant;
      return (
        (body.googlePlaceId && r.googlePlaceId === body.googlePlaceId) ||
        (r.name.toLowerCase().trim() === body.name.toLowerCase().trim() &&
          (r.description || "").toLowerCase().trim() === (body.description || "").toLowerCase().trim())
      );
    });

    if (existingSessionItem) {
      return NextResponse.json({
        restaurant: existingSessionItem.restaurant,
        sessionItem: existingSessionItem,
      });
    }

    // 5) Check if restaurant exists in database (by googlePlaceId)
    let restaurant;
    if (body.googlePlaceId) {
      restaurant = await prisma.restaurant.findUnique({
        where: { googlePlaceId: body.googlePlaceId },
      });
    }

    // 6) If restaurant doesn't exist, create it
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: body.name,
          description: body.description || null,
          googlePlaceId: body.googlePlaceId || null,
          rating: body.rating || null,
          priceLevel: body.priceLevel || null,
          isOpen: body.isOpen,
          userTotalRating: body.userTotalRating || null,
          types: body.types || null
        },
      });
    }

    // 7) Create the SessionItem
    const newSessionItem = await prisma.sessionItem.create({
      data: {
        sessionId: id,
        restaurantId: restaurant.id,
      },
    });

    // Return the newly created row(s)
    return NextResponse.json({
      restaurant,
      sessionItem: newSessionItem,
    });
  } catch (error) {
    console.error("Restaurants POST - Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
