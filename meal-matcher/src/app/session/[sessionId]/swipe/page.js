"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RestaurantCard from "@/app/Component/RestaurantCard";

async function fetchSwipeData(sessionId, participantName) {
  try {
    const sessionRes = await fetch(`/api/decision-sessions/${sessionId}`);
    if (!sessionRes.ok) {
      return [];
    }
    const session = await sessionRes.json();

   
    let userLocation;
    try {
      userLocation = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => reject(error)
          );
        } else {
          reject(new Error("Geolocation is not supported by this browser."));
        }
      });
    } catch (error) {
      return [];
    }
    const placesRes = await fetch(`/api/places?lat=${userLocation.lat}&lng=${userLocation.lng}`);
    if (!placesRes.ok) {
      return [];
    }
    const placesData = await placesRes.json();

    
    const votesRes = await fetch(`/api/decision-sessions/${sessionId}/swipe?participantName=${encodeURIComponent(participantName)}`);
    if (!votesRes.ok) {
      return [];
    }
    const existingItems = await votesRes.json();
    const existingItemIds = new Set(existingItems.map(item => item.sessionItemId));

    // Format the restaurant data and create session items in batches
    const batchSize = 5;
    const formattedRestaurants = [];

    formattedRestaurants.push(...existingItems);

    for (let i = 0; i < placesData.results.length; i += batchSize) {
      const batch = placesData.results.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(async (place) => {
        try {
          const restaurantRes = await fetch(`/api/decision-sessions/${sessionId}/restaurants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantName,
              name: place.name,
              description: place.vicinity,
              googlePlaceId: place.place_id,
              rating: place.rating,
              priceLevel: place.price_level,
              isOpen: place.opening_hours?.open_now,
              userTotalRating: place.user_ratings_total,
              types: place.types.filter(type => type !== 'restaurant').join(", ")
            })
          });

          if (!restaurantRes.ok) {
            return null;
          }

          const { restaurant, sessionItem } = await restaurantRes.json();

          if (existingItemIds.has(sessionItem.id)) {
            return null;
          }

          return {
            sessionItemId: sessionItem.id,
            name: restaurant.name,
            description: restaurant.description,
            rating: restaurant.rating || "No Rating",
            priceLevel: restaurant.priceLevel ? "$".repeat(restaurant.priceLevel) : "N/A",
            isOpen: restaurant.isOpen,
            userTotalRating: restaurant.userTotalRating || "0",
            imageUrl: place.photos
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
              : "/default.jpg",
            types: restaurant.types || "Unknown",
            userVote: null,
            totalLikes: 0,
            totalDislikes: 0
          };
        } catch (error) {
          return null;
        }
      }));

      formattedRestaurants.push(...batchResults.filter(r => r !== null));
    }

    return formattedRestaurants;
  } catch (error) {
    return [];
  }
}

async function recordSwipe(sessionId, participantName, sessionItemId, vote) {
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

  const handleSwipe = async (direction, restaurant) => {
    if (isSwiping) {
      return;
    }
    setIsSwiping(true);
    try {
      setRestaurants((prev) =>
        prev.filter((r) => r.sessionItemId !== restaurant.sessionItemId)
      );
      const vote = direction === "right" ? "LIKE" : "DISLIKE";
      await recordSwipe(sessionId, participantName, restaurant.sessionItemId, vote);
      setForcedSwipe(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSwiping(false);
    }
  };

  const handleForceSwipe = (direction) => {
    if (restaurants.length > 0 && !isSwiping) {
      setForcedSwipe(direction);
    } else {
      console.log("No restaurants available to swipe or already swiping");
    }
  };


  const handleDone = async () => {
    try {
      const sessionRes = await fetch(`/api/decision-sessions/${sessionId}`);
      if (!sessionRes.ok) {
        throw new Error("Cannot load session for done status");
      }
      const session = await sessionRes.json();
      const participants = session.participants.map((p) => {
        if (p.name === participantName) {
          return { ...p, done: true };
        }
        return p;
      });

      await fetch(`/api/decision-sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants }),
      });

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
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white text-2xl shadow-lg hover:bg-red-600 focus:outline-none ${isSwiping ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          ✕
        </button>
        <button
          onClick={() => handleForceSwipe("right")}
          disabled={isSwiping}
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white text-2xl shadow-lg hover:bg-green-600 focus:outline-none ${isSwiping ? "opacity-50 cursor-not-allowed" : ""
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
