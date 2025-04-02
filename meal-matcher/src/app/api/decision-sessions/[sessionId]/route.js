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

// PUT => Update session: upsert participants (with duplicates check), update status, etc.
export async function PUT(request, { params }) {
  const { sessionId } = params;
  const id = parseInt(sessionId, 10);

  const body = await request.json();
  // Expected body example:
  // {
  //   participants: [
  //     { id: 1, name: "Alice", done: false },
  //     { name: "Bob", done: false }
  //   ],
  //   status: "VOTING" | "SWIPING" | "COMPLETED" | "EXPIRED",
  //   name: "My New Session"
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
    let currentCount = existingSession.participants.length;

    for (const p of body.participants) {
      if (p.id) {
        // Update existing participant
        const existingPart = await prisma.decisionSessionParticipant.findUnique({
          where: { id: p.id },
        });
        if (!existingPart) {
          return NextResponse.json(
            { error: "Participant does not exist" },
            { status: 404 }
          );
        }

        // (Optional) Block updates if participant is done:
        // if (existingPart.done) {
        //   return NextResponse.json(
        //     { error: "Cannot update a participant who is done." },
        //     { status: 400 }
        //   );
        // }

        await prisma.decisionSessionParticipant.update({
          where: { id: p.id },
          data: {
            name: p.name,
            done: p.done ?? false,
          },
        });
      } else {
        // CREATE new participant: first check for duplicate name
        const nameExists = existingSession.participants.some(
          (part) => part.name.toLowerCase() === p.name.toLowerCase()
        );
        if (nameExists) {
          return NextResponse.json(
            { error: `Participant name "${p.name}" is already in use.` },
            { status: 400 }
          );
        }

        // If there are no participants, this new user becomes host.
        const isHost = currentCount === 0;
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

  // 3) Update session fields (like status, name) if provided.
  // Note: Ensure that the value of "status" is one of the allowed enum values.
  const updatedSession = await prisma.decisionSession.update({
    where: { id },
    data: {
      status: body.status ?? existingSession.status,
      name: body.name ?? existingSession.name,
    },
    include: {
      participants: true,
      sessionItems: {
        include: {
          restaurant: true,
        },
      },
    },
  });

  return NextResponse.json(updatedSession);
}
