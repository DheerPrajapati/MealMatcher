// app/api/decision-sessions/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/decision-sessions
// Creates a new session row in the DB
export async function POST(request) {
  try {
    const { name } = await request.json();

    // Insert a new row in DecisionSession. 
    const newSession = await prisma.decisionSession.create({
      data: {
        name: name || "New Session",
        status: "VOTING",
      },
    });

    return NextResponse.json(newSession); // e.g. { id: 13, name: "New Session", ...}
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
