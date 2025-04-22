"use client";
import Navbar_signedin from "../Component/Navbar_signedin";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RestaurantCard from "@/app/Component/RestaurantCard";

export default function SwipePage() {
  const router = useRouter();

  // For demonstration, we assume the session ID was set on session creation
  let sessionId = "demo123";
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("sessionId");
    if (stored) sessionId = stored;
  }

  const [restaurants, setRestaurants] = useState([]);
  const [swiped, setSwiped] = useState([]); // Store swipe decisions of the current user
  const [forcedSwipe, setForcedSwipe] = useState(null);

  useEffect(() => {
    if (navigator.geolocation == false) {
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`/api/places?lat=${latitude}&lng=${longitude}`);
        const data = await res.json();

        console.log(data.results);

        const formatted_names = data.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          description: place.vicinity,
          rating: place.rating || "No Rating",
          open: place.open_now,
          price_lvl:
            place.price_level == 1
              ? "$"
              : place.price_level == 2
              ? "$$"
              : place.price_level == 3
              ? "$$$"
              : place.price_level == 4
              ? "$$$$"
              : "N/A",
          isOpen: place.opening_hours?.open_now ?? null,
          user_total_rating: place.user_ratings_total || "0",
          imageUrl: place.photos
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
            : "/default.jpg",
        }));

        setRestaurants(formatted_names);
      } catch (err) {
        console.log("Error formatting api data");
      }
    });
  }, []);

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
    <>
      <Navbar_signedin />
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">
          Swipe Restaurants
        </h1>

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
              <p className="text-xl text-gray-700">
                No more restaurants to swipe.
              </p>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
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
    </>
  );
}
