"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

async function fetchSessionFromDB(sessionId) {
  const res = await fetch(`/api/decision-sessions/${sessionId}`);
  if (!res.ok) return null;
  return await res.json();
}

async function updateSessionOnDB(sessionId, data) {
  const res = await fetch(`/api/decision-sessions/${sessionId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return null;
  return await res.json();
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const router = useRouter();

  const [sessionData, setSessionData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [restaurantInput, setRestaurantInput] = useState({ name: "", description: "" });

  // 1) On mount, prompt user name if needed
  useEffect(() => {
    if (!sessionId) return;
    const localKey = `session_user_${sessionId}`;
    let user = sessionStorage.getItem(localKey);
    if (!user) {
      const name = prompt("Enter your name to join this session:") || "Anonymous";
      user = JSON.stringify({ name, done: false });
      sessionStorage.setItem(localKey, user);
    }
    setCurrentUser(JSON.parse(user));
  }, [sessionId]);

  // 2) Load session from DB, upsert participant
  useEffect(() => {
    if (!sessionId || !currentUser) return;

    (async () => {
      let data = await fetchSessionFromDB(sessionId);
      if (!data || data.error) {
        alert("Session not found or error loading session");
        return;
      }

      // Are we already in participants?
      const alreadyParticipant = data.participants.some(
        (p) => p.name === currentUser.name
      );

      if (!alreadyParticipant) {
        // "Upsert" me
        const updated = await updateSessionOnDB(sessionId, {
          participants: [
            ...data.participants,
            { name: currentUser.name, done: currentUser.done },
          ],
        });
        data = updated;
      }

      setSessionData(data);
    })();
  }, [sessionId, currentUser]);

  // 3) Poll for updates
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      const data = await fetchSessionFromDB(sessionId);
      if (data && !data.error) {
        setSessionData(data);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  if (!sessionData) {
    return <div className="p-6">Loading session...</div>;
  }

  // Identify my participant record, e.g. { id, name, done, isHost }
  const myParticipant = sessionData.participants.find(
    (p) => p.name === currentUser?.name
  );
  const isHost = myParticipant?.isHost || false;

  const markAsDone = async () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, done: true };
    setCurrentUser(updatedUser);
    sessionStorage.setItem(`session_user_${sessionId}`, JSON.stringify(updatedUser));

    const updatedParticipants = sessionData.participants.map((p) => {
      if (p.name === currentUser.name) {
        return { ...p, done: true };
      }
      return p;
    });
    const updated = await updateSessionOnDB(sessionId, {
      participants: updatedParticipants,
    });
    if (updated) setSessionData(updated);
  };

  // Add restaurant => calls the dedicated "restaurants" route
  const addRestaurant = async () => {
    if (!restaurantInput.name) return;
    try {
      const res = await fetch(`/api/decision-sessions/${sessionId}/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: restaurantInput.name,
          description: restaurantInput.description,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add restaurant");
      }
      await res.json();
      // Re-fetch session
      const updated = await fetchSessionFromDB(sessionId);
      if (updated) setSessionData(updated);
      setRestaurantInput({ name: "", description: "" });
    } catch (error) {
      console.error(error);
      alert("Error adding restaurant");
    }
  };

  const allDone = sessionData.participants.every((p) => p.done);

  // Only the host sees "Start Swiping"
  const startSwiping = async () => {
    if (!isHost) {
      alert("Only the host can start swiping!");
      return;
    }
    // e.g. update session "status" or just go to a swipe page
    router.push(`/session/${sessionId}/swipe`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Session: {sessionId}</h1>

      {/* Participants */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Participants</h2>
        <ul>
          {sessionData.participants.map((p) => (
            <li key={p.id}>
              {p.name} {p.isHost && <strong>(Host)</strong>} – {p.done ? "Done" : "Not Done"}
            </li>
          ))}
        </ul>
      </div>

      {!myParticipant?.done && (
        <button
          onClick={markAsDone}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4"
        >
          Mark as Done
        </button>
      )}
      {allDone && <p className="mb-4 text-green-600">All participants are done!</p>}

      {/* Show session items */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Restaurants</h2>
        {sessionData.sessionItems?.length ? (
          <ul>
            {sessionData.sessionItems.map((item) => (
              <li key={item.id}>
                ID {item.id} {'=>'} Restaurant {item.restaurantId}
              </li>
            ))}
          </ul>
        ) : (
          <p>No restaurants yet.</p>
        )}
      </div>

      {/* Add restaurant */}
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Add a Restaurant</h2>
        <input
          type="text"
          placeholder="Restaurant Name"
          value={restaurantInput.name}
          onChange={(e) =>
            setRestaurantInput((prev) => ({ ...prev, name: e.target.value }))
          }
          className="block w-full p-2 mb-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={restaurantInput.description}
          onChange={(e) =>
            setRestaurantInput((prev) => ({ ...prev, description: e.target.value }))
          }
          className="block w-full p-2 mb-2 border rounded"
        />
        <button
          onClick={addRestaurant}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add Restaurant
        </button>
      </div>

      {/* If I'm host, I can start swiping */}
      {isHost && (
        <div className="mt-6">
          <button
            onClick={startSwiping}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start Swiping
          </button>
        </div>
      )}
    </div>
  );
}
