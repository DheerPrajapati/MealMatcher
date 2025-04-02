// app/api/decision-sessions/[sessionId]/route.js

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET => Return the session (with participants, sessionItems, etc.)
export async function GET(request, { params }) {
  const { sessionId } = params;
  const id = parseInt(sessionId, 10);

  const session = await prisma.decisionSession.findUnique({
    where: { id },
    include: {
      participants: true,
      sessionItems: {
        include: {
          restaurant: true, 
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}

// PUT => Update session: upsert participants, mark done, etc.
export async function PUT(request, { params }) {
  const { sessionId } = params;
  const id = parseInt(sessionId, 10);

  const body = await request.json();
  // e.g. body = {
  //   participants: [
  //     { id: 1, name: "Alice", done: false }, 
  //     { name: "Bob", done: false }
  //   ],
  //   status: "VOTING",
  //   ...
  // }

  // 1) Confirm the session exists
  const existingSession = await prisma.decisionSession.findUnique({
    where: { id },
    include: { participants: true },
  });
  if (!existingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // 2) Upsert participants
  if (Array.isArray(body.participants)) {
    // Count how many participants exist right now
    let currentCount = existingSession.participants.length;

    for (const p of body.participants) {
      if (p.id) {
        // If we have p.id, it's an existing participant => just update
        await prisma.decisionSessionParticipant.update({
          where: { id: p.id },
          data: {
            name: p.name,
            done: p.done ?? false,
            // Typically we won't change isHost here 
            // unless you want to reassign host
          },
        });
      } else {
        // Create new participant
        // If the session had 0 participants, make this new user the host
        const isHost = currentCount === 0; 
        // Increment currentCount so subsequent new participants 
        // in this same request won't also become hosts
        if (isHost) currentCount++;

        await prisma.decisionSessionParticipant.create({
          data: {
            name: p.name,
            done: p.done ?? false,
            isHost, 
            sessionId: id,
          },
        });
      }
    }
  }

  // 3) Update session fields (like status, name) if provided
  const updatedSession = await prisma.decisionSession.update({
    where: { id },
    data: {
      status: body.status ?? existingSession.status,
      name: body.name ?? existingSession.name,
      // etc.
    },
    include: {
      participants: true,
      sessionItems: true,
    },
  });

  return NextResponse.json(updatedSession);
}
