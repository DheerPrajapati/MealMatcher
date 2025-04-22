export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const likeThreshold = 2;

export async function GET(request, { params }) {
  const { sessionId } = params;
  const url = new URL(request.url);
  const participantName = url.searchParams.get("participantName") || "";
  const id = parseInt(sessionId, 10);

  const session = await prisma.decisionSession.findUnique({
    where: { id },
    include: {
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

  const remaining = session.sessionItems
    .filter((item) => {
      const alreadyVoted = item.votes.some(
        (v) => v.participantName.toLowerCase() === participantName.toLowerCase()
      );
      return !alreadyVoted;
    })
    .map((item) => ({
      sessionItemId: item.id,
      name: item.restaurant.name,
      description: item.restaurant.description,
      likes: item.score,
    }));

  return NextResponse.json(remaining);
}

export async function POST(req, {params}) {;
  const body = await req.json();
  const { sessionId } = params;
  const { participantName, sessionItemId, vote } = body;

  const item = await prisma.sessionItem.findUnique({
    where: { id: sessionItemId },
  });

  if (!item) {
    return NextResponse.json({ error: "Session item not found" }, { status: 404 });
  }

  let newScore = item.score || 0;
  let sessionDone = false;

  if (vote === "LIKE") {
    newScore += 1;
  }
    // If score reaches 2, mark session as done

  if(newScore >= likeThreshold) {
    console.log("score has reached 2")
    await prisma.decisionSessionParticipant.updateMany({
      where: { sessionId: id },
      data: { done: true },
    });
  }

  // Create the vote with relational connects
  await prisma.restaurantVote.create({
    data: {
      participantName,
      vote,
      sessionItem: {
        connect: { id: sessionItemId },
      },
      restaurant: {
        connect: { id: item.restaurantId },
      },
    },
  });

  // Update score on the session item
  await prisma.sessionItem.update({
    where: { id: sessionItemId },
    data: { score: newScore },
  });

  return NextResponse.json({ success: true, newScore, done: sessionDone });
}