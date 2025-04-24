// app/api/decision-sessions/[sessionId]/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET => Return the session (with participants, sessionItems, etc.)
export async function GET(request, context) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const id = parseInt(sessionId, 10);

    const session = await prisma.decisionSession.findUnique({
      where: { id },
      include: {
        participants: true,
        sessionItems: {
          include: {
            restaurant: true,
            votes: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Calculate scores for each restaurant
    const sessionWithScores = {
      ...session,
      sessionItems: session.sessionItems.map(item => {
        const likes = item.votes.filter(v => v.vote === "LIKE").length;
        const dislikes = item.votes.filter(v => v.vote === "DISLIKE").length;
        const totalVotes = likes + dislikes;
        const score = totalVotes > 0 ? (likes / totalVotes) * 100 : 0;

        return {
          ...item,
          score: Math.round(score * 10) / 10, // Round to 1 decimal place
          likes,
          dislikes
        };
      })
    };

    return NextResponse.json(sessionWithScores);
  } catch (error) {
    console.error("Session GET - Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST => Create a new session
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Session name is required" },
        { status: 400 }
      );
    }

    const session = await prisma.decisionSession.create({
      data: {
        name,
        description: description || null,
      },
    });
    return NextResponse.json(session);
  } catch (error) {
    console.error("Session POST - Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE => Delete a session
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const id = parseInt(sessionId, 10);

    const session = await prisma.decisionSession.findUnique({
      where: { id },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.decisionSession.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Session DELETE - Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT => Update session: upsert participants (with duplicates check), update status, etc.
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const id = parseInt(sessionId, 10);

    const body = await request.json();

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

          await prisma.decisionSessionParticipant.update({
            where: { id: p.id },
            data: {
              name: p.name,
              done: p.done ?? false,
            },
          });
        } else {
          // CREATE new participant
          const nameExists = existingSession.participants.some(
            (part) => part.name.toLowerCase() === p.name.toLowerCase()
          );
          if (nameExists) {
            return NextResponse.json(
              { error: `Participant name "${p.name}" is already in use.` },
              { status: 400 }
            );
          }

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
  } catch (error) {
    console.error("Session PUT - Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
