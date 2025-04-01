"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RestaurantCard from "@/app/Component/RestaurantCard";

// Simple helpers
function getSessionFromStorage(sessionId) {
  const data = localStorage.getItem(`session_${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export default function SwipePage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState([]);
  const [swiped, setSwiped] = useState([]); 
  const [forcedSwipe, setForcedSwipe] = useState(null);

  // 1) Load restaurants from the session
  useEffect(() => {
    if (!sessionId) return;
    const sessionData = getSessionFromStorage(sessionId);
    if (sessionData && sessionData.restaurants) {
      setRestaurants(sessionData.restaurants);
    }
  }, [sessionId]);

  // 2) Handle user swipes
  const handleSwipe = (direction, restaurant) => {
    console.log(`Swiped ${direction} on ${restaurant.name}`);
    // Remove from the deck
    setRestaurants((prev) => prev.filter((r) => r.id !== restaurant.id));
    // Record the swipe
    setSwiped((prev) => [...prev, { ...restaurant, direction }]);
    if (forcedSwipe) setForcedSwipe(null);
  };

  const handleForceSwipe = (direction) => {
    if (restaurants.length > 0) {
      setForcedSwipe(direction);
    }
  };

  // 3) Clicking "Done" => store results in localStorage => show results
  const handleDone = () => {
    const key = `swipeResults_${sessionId}`;
    const existingResults = JSON.parse(localStorage.getItem(key)) || [];
    // Add this user's swipes
    localStorage.setItem(key, JSON.stringify([...existingResults, swiped]));
    // Navigate to results
    router.push(`/session/${sessionId}/results`);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">Swipe Restaurants</h1>

      <div className="relative w-full max-w-sm h-96">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onSwipe={handleSwipe}
            style={{ zIndex: restaurants.length - index }}
            forceSwipe={index === 0 ? forcedSwipe : null}
          />
        ))}

        {/* If no more restaurants */}
        {restaurants.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xl text-gray-700">No more restaurants to swipe.</p>
          </div>
        )}
      </div>

      {/* Swipe controls (optional) */}
      <div className="mt-6 flex justify-center gap-8">
        <button
          onClick={() => handleForceSwipe("left")}
          className="flex h-12 w-12 items-center justify-center rounded-full 
            bg-red-500 text-white text-2xl shadow-lg hover:bg-red-600 focus:outline-none"
        >
          ✕
        </button>
        <button
          onClick={() => handleForceSwipe("right")}
          className="flex h-12 w-12 items-center justify-center rounded-full 
            bg-green-500 text-white text-2xl shadow-lg hover:bg-green-600 focus:outline-none"
        >
          {/* Check mark icon */}
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

      <div className="mt-6">
        <button
          onClick={handleDone}
          className="rounded bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}
