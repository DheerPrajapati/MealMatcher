"use client"; // Ensure this is a client component
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RestaurantCard from "@/app/Component/RestaurantCard";

export default function SwipePage() {
  const router = useRouter();

  // For demonstration, we assume the session ID was set on session creation
  const sessionId = localStorage.getItem("sessionId") || "demo123";

  // Example list of restaurants – replace with dynamic data later
  const initialRestaurants = [
    {
      id: 1,
      name: "Italian",
      description: "pizza",
      imageUrl: "/pizza.jpg", // Update with a valid image path
    },
    {
      id: 2,
      name: "Japanese",
      description: "sushi",
      imageUrl: "/sushi.jpg",
    },
    {
      id: 3,
      name: "Burger",
      description: "burger",
      imageUrl: "/burger.jpg",
    },
  ];

  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [swiped, setSwiped] = useState([]); // Store swipe decisions of the current user
  const [forcedSwipe, setForcedSwipe] = useState(null);

  const handleSwipe = (direction, restaurant) => {
    console.log(`Swiped ${direction} on ${restaurant.name}`);
    // Remove the swiped restaurant from the list
    setRestaurants((prev) => prev.filter((r) => r.id !== restaurant.id));
    // Record the swipe decision for the current user
    setSwiped((prev) => [...prev, { ...restaurant, direction }]);
    if (forcedSwipe) setForcedSwipe(null);
  };

  const handleForceSwipe = (direction) => {
    if (restaurants.length > 0) {
      setForcedSwipe(direction);
    }
  };

  // When the user clicks "Done", store their swipe results for the session and navigate to the results page.
  const handleDone = () => {
    // Retrieve any existing results for this session
    const key = `swipeResults_${sessionId}`;
    const existingResults = JSON.parse(localStorage.getItem(key)) || [];
    // For demo, we simply append the current user's swiped results to the session data.
    localStorage.setItem(key, JSON.stringify([...existingResults, swiped]));
    // Navigate to the results page
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
        {restaurants.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xl text-gray-700">No more restaurants to swipe.</p>
          </div>
        )}
      </div>

      {/* Action buttons for swipe */}
      <div className="mt-6 flex justify-center gap-8">
        <button
          onClick={() => handleForceSwipe("left")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white text-2xl shadow-lg hover:bg-red-600 focus:outline-none"
        >
          ✕
        </button>
        <button
          onClick={() => handleForceSwipe("right")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white text-2xl shadow-lg hover:bg-green-600 focus:outline-none"
        >
          {/* Check mark SVG */}
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

      {/* "Done" button to finish swiping */}
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