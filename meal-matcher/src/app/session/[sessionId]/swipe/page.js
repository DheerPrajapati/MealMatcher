"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RestaurantCard from "@/app/Component/RestaurantCard";

// Helper: Fetch swipe data for the given participant
async function fetchSwipeData(sessionId, participantName) {
  const res = await fetch(
    `/api/decision-sessions/${sessionId}/swipe?participantName=${encodeURIComponent(
      participantName
    )}`
  );
  if (!res.ok) {
    console.error("Failed to fetch swipe data");
    return [];
  }
  return await res.json(); // Expected: array of items { sessionItemId, name, description, ... }
}

// Helper: Record a swipe (LIKE or DISLIKE) for one restaurant
export async function recordSwipe(sessionId, participantName, sessionItemId, vote) {
  console.log("Recording swipe:");
  const res = await fetch(`/api/decision-sessions/${sessionId}/swipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      participantName,
      sessionItemId,
      vote, // Expected: "LIKE" or "DISLIKE"
    }),
  });
  if (!res.ok) {
    const errData = await res.json();
    console.error("Failed to record swipe:", errData.error);
    throw new Error(errData.error || "Failed to record swipe");
  }
  return await res.json();
}

export default function SwipePage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState([]);
  const [forcedSwipe, setForcedSwipe] = useState(null);
  const [participantName, setParticipantName] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false); // debounce flag

  // On mount, load participantName from sessionStorage or prompt
  useEffect(() => {
    if (!sessionId) return;
    const localKey = `session_user_${sessionId}`;
    let userStr = sessionStorage.getItem(localKey);
    if (!userStr) {
      const name = prompt("Enter your participant name:") || "Anonymous";
      userStr = JSON.stringify({ name, done: false });
      sessionStorage.setItem(localKey, userStr);
    }
    const user = JSON.parse(userStr);
    setParticipantName(user.name);
  }, [sessionId]);

  // Once we have participantName, load the swipe items from the DB
  useEffect(() => {
    if (!sessionId || !participantName) return;
    (async () => {
      try {
        const data = await fetchSwipeData(sessionId, participantName);
        setRestaurants(data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [sessionId, participantName]);

  useEffect(() => {
    if (!sessionId || !participantName) return;
  
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/decision-sessions/${sessionId}");
        if (!res.ok) return;
        const session = await res.json();
        const me = session.participants.find(
          (p) => p.name.toLowerCase() === participantName.toLowerCase()
        );
        if (me?.done) {
          console.log("Session is done for this participant");
          handleDone();
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000); // every 2 seconds
  
    return () => clearInterval(interval);
  }, [sessionId, participantName]);

  // Handle a swipe action with debounce
  const handleSwipe = async (direction, restaurant) => {
    if (isSwiping) return; // Prevent multiple simultaneous swipes
    setIsSwiping(true);
    try {
      console.log(`Swiped ${direction} on ${restaurant.name}`);
      // Remove the restaurant from the local deck
      setRestaurants((prev) =>
        prev.filter((r) => r.sessionItemId !== restaurant.sessionItemId)
      );
      // Determine vote value
      const vote = direction === "right" ? "LIKE" : "DISLIKE";
      // Record the swipe on the server (await ensures one at a time)
      await recordSwipe(sessionId, participantName, restaurant.sessionItemId, vote);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsSwiping(false);
    }
  };

  const handleForceSwipe = (direction) => {
    if (restaurants.length > 0) {
      setForcedSwipe(direction);
    }
  };


  const handleDone = async () => {
    // Mark ourselves as done. We'll do a quick "PUT" to the session to set done = true
    try {
      // fetch the session
      const sessionRes = await fetch(`/api/decision-sessions/${sessionId}`);
      if (!sessionRes.ok) {
        throw new Error("Cannot load session for done status");
      }
      const session = await sessionRes.json();
      // find ourselves
      const participants = session.participants.map((p) => {
        if (p.name === participantName) {
          return { ...p, done: true };
        }
        return p;
      });

      // Update session
      await fetch(`/api/decision-sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants }),
      });

      // Go to results
      router.push(`/session/${sessionId}/results`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">Swipe Restaurants</h1>

      <div className="relative w-full max-w-sm h-96">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.sessionItemId}
            restaurant={restaurant}
            onSwipe={handleSwipe}
            style={{ zIndex: restaurants.length - index }}
            forceSwipe={index === 0 ? forcedSwipe : null}
          />
        ))}

        {restaurants.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xl text-gray-700">No more restaurants to swipe.</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-8">
        <button
          onClick={() => handleForceSwipe("left")}
          disabled={isSwiping}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white text-2xl shadow-lg hover:bg-red-600 focus:outline-none ${
            isSwiping ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          ✕
        </button>
        <button
          onClick={() => handleForceSwipe("right")}
          disabled={isSwiping}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white text-2xl shadow-lg hover:bg-green-600 focus:outline-none ${
            isSwiping ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <button
        onClick={handleDone}
        className="mt-6 rounded bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700"
      >
        Done
      </button>
    </div>
  );
}
