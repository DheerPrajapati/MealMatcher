export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET => Return all items with the user's vote status
// ?participantName=NAME
export async function GET(request, context) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
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

    // 2) Return all items with the user's vote status and full restaurant details
    const items = session.sessionItems.map((item) => {
      const userVote = item.votes.find(
        (v) => v.participantName.toLowerCase() === participantName.toLowerCase()
      );

      return {
        sessionItemId: item.id,
        name: item.restaurant.name,
        description: item.restaurant.description,
        rating: item.restaurant.rating || "No Rating",
        priceLevel: item.restaurant.priceLevel ? "$".repeat(item.restaurant.priceLevel) : "N/A",
        isOpen: item.restaurant.isOpen,
        userTotalRating: item.restaurant.userTotalRating || "0",
        types: item.restaurant.types || "Unknown",
        imageUrl: item.restaurant.googlePlaceId
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${item.restaurant.googlePlaceId}&key=${process.env.GOOGLE_PLACES_API_KEY}`
          : "/default.jpg",
        userVote: userVote ? userVote.vote : null,
        totalLikes: item.votes.filter(v => v.vote === "LIKE").length,
        totalDislikes: item.votes.filter(v => v.vote === "DISLIKE").length
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in GET /api/decision-sessions/[sessionId]/swipe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST => Record a vote for a restaurant
export async function POST(request, context) {
  try {
    const params = await context.params;
    const sessionId = params.sessionId;
    const id = parseInt(sessionId, 10);
    const body = await request.json();
    const { participantName, sessionItemId, vote } = body;

    // 1) Find the sessionItem
    const item = await prisma.sessionItem.findUnique({
      where: { id: sessionItemId },
      include: {
        votes: {
          where: {
            participantName: participantName
          }
        }
      }
    });

    if (!item || item.sessionId !== id) {
      return NextResponse.json(
        { error: "Session item not found" },
        { status: 404 }
      );
    }

    // Check if vote already exists
    if (item.votes.length > 0) {
      // Update existing vote
      const updatedVote = await prisma.restaurantVote.update({
        where: {
          id: item.votes[0].id
        },
        data: {
          vote: vote
        }
      });
      return NextResponse.json(updatedVote);
    }

    // 2) Create new vote if none exists
    const newVote = await prisma.restaurantVote.create({
      data: {
        participantName,
        sessionItemId,
        restaurantId: item.restaurantId,
        vote,
      },
    });

    return NextResponse.json(newVote);
  } catch (error) {
    console.error("Error in POST /api/decision-sessions/[sessionId]/swipe:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
