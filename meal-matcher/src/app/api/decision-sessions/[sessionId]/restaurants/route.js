// app/api/decision-sessions/[sessionId]/restaurants/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST => Add a new Restaurant + SessionItem, with validations
export async function POST(request, { params }) {
  try {
    const { sessionId } = params;
    const id = parseInt(sessionId, 10);

    // Expect body = { name, description, participantName }
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
    // Assume your front end passes participantName to identify who is adding the restaurant
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

    // 3) If participant is done, block
    if (participant.done) {
      return NextResponse.json(
        { error: "Cannot add restaurants after you're done." },
        { status: 400 }
      );
    }

    // 4) Check for a duplicate restaurant in this session (by name + description)
    const nameLC = body.name.toLowerCase().trim();
    const descLC = (body.description || "").toLowerCase().trim();
    const duplicate = session.sessionItems.some((item) => {
      const r = item.restaurant;
      return (
        r.name.toLowerCase().trim() === nameLC &&
        (r.description || "").toLowerCase().trim() === descLC
      );
    });
    if (duplicate) {
      return NextResponse.json(
        { error: `Restaurant "${body.name}" already exists in this session.` },
        { status: 400 }
      );
    }

    // 5) Create the Restaurant
    const newRestaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        description: body.description || null,
      },
    });

    // 6) Create the SessionItem
    const newSessionItem = await prisma.sessionItem.create({
      data: {
        sessionId: id,
        restaurantId: newRestaurant.id,
      },
    });

    // Return the newly created row(s)
    return NextResponse.json({
      restaurant: newRestaurant,
      sessionItem: newSessionItem,
    });
  } catch (error) {
    console.error("Error adding restaurant to session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
