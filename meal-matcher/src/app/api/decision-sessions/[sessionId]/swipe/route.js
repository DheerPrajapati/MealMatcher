export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";


// GET => Return items the participant hasn't voted on, including the number of likes (score)
// ?participantName=NAME
const likeThreshold = 2;

export async function GET(request, { params }) {
  const { sessionId } = params;
  const url = new URL(request.url);
  const participantName = url.searchParams.get("participantName") || "";
  const id = parseInt(sessionId, 10);

  // 1) Load session with sessionItems (restaurants + votes)
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

  // 2) Filter out items the participant has already voted on
  const remaining = session.sessionItems
    .filter((item) => {
      // Has this item been voted on by participantName?
      const alreadyVoted = item.votes.some(
        (v) => v.participantName.toLowerCase() === participantName.toLowerCase()
      );
      return !alreadyVoted;
    })
    .map((item) => ({
      sessionItemId: item.id,
      name: item.restaurant.name,
      description: item.restaurant.description,
      likes: item.score, // Include the score (number of likes)
    }));

  return NextResponse.json(remaining);
}

// POST => Record a single "swipe" (LIKE or DISLIKE) for participant
// Body: { participantName, sessionItemId, vote: "LIKE" | "DISLIKE" }
export async function POST(request, { params }) {
  const { sessionId } = params;
  const id = parseInt(sessionId, 10);
  const { participantName, sessionItemId, vote } = await request.json();

  if (!participantName || !sessionItemId || !vote) {
    return NextResponse.json(
      { error: "Must provide participantName, sessionItemId, and vote" },
      { status: 400 }
    );
  }

  // 1) Find the sessionItem
  const item = await prisma.sessionItem.findUnique({
    where: { id: sessionItemId },
  });
  if (!item || item.sessionId !== id) {
    return NextResponse.json(
      { error: "SessionItem not found in this session" },
      { status: 404 }
    );
  }

  // 2) Check if participantName already voted
  const existingVote = await prisma.restaurantVote.findUnique({
    where: {
      sessionItemId_participantName: {
        sessionItemId,
        participantName,
      },
    },
  });
  if (existingVote) {
    return NextResponse.json(
      { error: "Already voted on this item" },
      { status: 400 }
    );
  }

  // 3) If it's LIKE, increment item.score
  let newScore = item.score;
  if (vote === "LIKE") {
    newScore += 1;
    if(newScore >= likeThreshold) {
      // If score reaches 2, mark the item as done for all participants
      console.log("score has reached 2")
      await prisma.decisionSessionParticipant.updateMany({
        where: { sessionId: id },
        data: { done: true },
      });
    }
  }

  // 4) Create the RestaurantVote + update sessionItem score
  await prisma.restaurantVote.create({
    data: {
      participantName,
      vote,
      sessionItemId: item.id,
      restaurantId: item.restaurantId,
    },
  });

  await prisma.sessionItem.update({
    where: { id: item.id },
    data: { score: newScore },
  });

  return NextResponse.json({ success: true, newScore });
}