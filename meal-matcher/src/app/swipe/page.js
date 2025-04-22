"use client";
import Navbar_signedin from "../Component/Navbar_signedin";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RestaurantCard from "@/app/Component/RestaurantCard";
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
import {recordSwipe} from "@/app/session/[sessionId]/swipe/page.js";

export default function SwipePage() {
  const router = useRouter();

  let sessionId = "demo123";
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("sessionId");
    if (stored) sessionId = stored;
  }

  const [restaurants, setRestaurants] = useState([]);
  const [swiped, setSwiped] = useState([]);
  const [forcedSwipe, setForcedSwipe] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`/api/places?lat=${latitude}&lng=${longitude}`);
        const data = await res.json();

        const formatted_names = data.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          description: place.vicinity,
          rating: place.rating || "No Rating",
          open: place.open_now,
          price_lvl:
            place.price_level === 1
              ? "$"
              : place.price_level === 2
              ? "$$"
              : place.price_level === 3
              ? "$$$"
              : place.price_level === 4
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
        console.log("Error formatting API data:", err);
      }
    });
  }, []);

  const handleSwipe = async (direction, restaurant) => {
    if (isSwiping) return;
    setIsSwiping(true);
    try {
      console.log("Swiped ${direction} on ${restaurant.name}");
      setRestaurants((prev) =>
        prev.filter((r) => r.sessionItemId !== restaurant.sessionItemId)
      );
  
      const vote = direction === "right" ? "LIKE" : "DISLIKE";
      
      console.log("Before the recordSwipe call");
      // Use the updated API response which now returns { done: true } if session is finished
      const result = await recordSwipe(sessionId, participantName, restaurant.sessionItemId, vote);
      console.log("Swipe recorded: ", result.done)
      if (result.done) {
        // Redirect to results if the session is marked as done
        console.log("Before handleDone call and result.done is true")
        handleDone();
      }
  
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

  const handleDone = () => {
    const key = `swipeResults_${sessionId}`;
    const existingResults = JSON.parse(localStorage.getItem(key)) || [];
    localStorage.setItem(key, JSON.stringify([...existingResults, swiped]));
    router.push(`/session/${sessionId}/results`);
  };

  return (
    <>
      <Navbar_signedin />
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

        <div className="mt-6 flex justify-center gap-8">
          <button
            onClick={() => handleForceSwipe("left")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white text-2xl shadow-lg hover:bg-red-600"
          >
            ✕
          </button>
          <button
            onClick={() => handleForceSwipe("right")}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white text-2xl shadow-lg hover:bg-green-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </>
  );
}
