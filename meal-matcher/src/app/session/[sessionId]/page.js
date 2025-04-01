"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function getSessionFromStorage(sessionId) {
  const data = localStorage.getItem(`session_${sessionId}`);
  return data ? JSON.parse(data) : null;
}

function saveSessionToStorage(sessionId, data) {
  localStorage.setItem(`session_${sessionId}`, JSON.stringify(data));
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [restaurantInput, setRestaurantInput] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!sessionId) return;
    
    const localUserKey = `currentUser_${sessionId}`;
    let user = localStorage.getItem(localUserKey);

    if (!user) {
      const name = prompt("Enter your name to join this session:");
      user = JSON.stringify({
        userId: Date.now().toString(),
        name,
        done: false,
      });
      localStorage.setItem(localUserKey, user);
    }
    setCurrentUser(JSON.parse(user));
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !currentUser) return;

    let sessionData = getSessionFromStorage(sessionId);

    if (!sessionData) {
      // First person to open the link becomes the host
      sessionData = {
        sessionId,
        host: { ...currentUser },
        participants: [{ ...currentUser }],
        restaurants: [],
      };
      saveSessionToStorage(sessionId, sessionData);
    } else {
      // Add current user if they're not already in participants
      const exists = sessionData.participants.find(
        (p) => p.userId === currentUser.userId
      );
      if (!exists) {
        sessionData.participants.push({ ...currentUser });
        saveSessionToStorage(sessionId, sessionData);
      }
    }

    setSession(sessionData);
  }, [sessionId, currentUser]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      const data = getSessionFromStorage(sessionId);
      if (data) setSession(data);
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Add a restaurant
  const addRestaurant = () => {
    if (!restaurantInput.name || !restaurantInput.description || !session) return;
    const newRestaurant = {
      id: Date.now().toString(),
      ...restaurantInput,
      addedBy: currentUser.userId,
    };
    const updatedSession = {
      ...session,
      restaurants: [...session.restaurants, newRestaurant],
    };
    saveSessionToStorage(sessionId, updatedSession);
    setSession(updatedSession);
    setRestaurantInput({ name: "", description: "" });
  };

  // Mark the current user as done
  const markAsDone = () => {
    if (!session || !currentUser) return;
    const updatedParticipants = session.participants.map((p) =>
      p.userId === currentUser.userId ? { ...p, done: true } : p
    );
    const updatedUser = { ...currentUser, done: true };

    localStorage.setItem(`currentUser_${sessionId}`, JSON.stringify(updatedUser));

    const updatedSession = {
      ...session,
      participants: updatedParticipants,
    };
    saveSessionToStorage(sessionId, updatedSession);
    setSession(updatedSession);
    setCurrentUser(updatedUser);
  };

  // Host starts the swipe session
  const startSwipeSession = () => {
    if (!session || !currentUser) return;
    if (session.host.userId !== currentUser.userId) {
      alert("Only the host can start the swipe session!");
      return;
    }
    // Check if everyone is done
    const allDone = session.participants.every((p) => p.done);
    if (!allDone) {
      alert("Not all participants are done yet!");
      return;
    }
    // Go to the swipe page
    router.push(`/session/${sessionId}/swipe`);
  };

  if (!session) {
    return <div className="p-6">Loading session data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">
        Session: {sessionId}
      </h1>

      {/* Participants */}
      <div className="mb-6 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-bold">Participants</h2>
        <ul className="space-y-1">
          {session.participants.map((p) => (
            <li key={p.userId} className="flex justify-between">
              <span>{p.name}</span>
              <span className={p.done ? "text-green-600" : "text-red-600"}>
                {p.done ? "Done" : "Not Done"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form to add a restaurant (if not done) */}
      {!currentUser.done && (
        <div className="mb-6 rounded bg-white p-4 shadow">
          <h2 className="mb-2 text-xl font-bold">Add a Restaurant</h2>
          <input
            type="text"
            placeholder="Restaurant Name"
            value={restaurantInput.name}
            onChange={(e) =>
              setRestaurantInput({ ...restaurantInput, name: e.target.value })
            }
            className="mb-2 w-full rounded border p-2"
          />
          <textarea
            placeholder="Description"
            value={restaurantInput.description}
            onChange={(e) =>
              setRestaurantInput({ ...restaurantInput, description: e.target.value })
            }
            className="mb-2 w-full rounded border p-2"
          />
          <button
            onClick={addRestaurant}
            className="rounded bg-green-500 px-4 py-2 text-white shadow hover:bg-green-600"
          >
            Add Restaurant
          </button>
        </div>
      )}

      {/* List of restaurants */}
      <div className="mb-6 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-bold">Restaurants in Session</h2>
        {session.restaurants.length === 0 ? (
          <p className="text-gray-600">No restaurants added yet.</p>
        ) : (
          <ul className="space-y-2">
            {session.restaurants.map((res) => (
              <li key={res.id} className="rounded border p-2">
                <strong>{res.name}</strong>: {res.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mark as Done */}
      {!currentUser.done && (
        <button
          onClick={markAsDone}
          className="mr-4 mb-4 rounded bg-indigo-600 px-4 py-2 text-white shadow 
            hover:bg-indigo-700"
        >
          Mark as Done
        </button>
      )}

      {/* Host's button to start the swipe session */}
      {session.host.userId === currentUser.userId && (
        <button
          onClick={startSwipeSession}
          className="rounded bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
        >
          Start Swipe Session
        </button>
      )}
    </div>
  );
}
