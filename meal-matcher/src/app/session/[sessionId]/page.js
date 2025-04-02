"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Helper: fetch the session from the DB
async function fetchSessionFromDB(sessionId) {
  const res = await fetch(`/api/decision-sessions/${sessionId}`);
  if (!res.ok) return null;
  return await res.json();
}

// Helper: update the session in the DB (PUT)
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

  // 1) On mount, read or prompt for user name
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

  // 2) Load session, upsert participant if needed
  useEffect(() => {
    if (!sessionId || !currentUser) return;

    (async () => {
      let data = await fetchSessionFromDB(sessionId);
      if (!data || data.error) {
        alert("Session not found or error loading session");
        return;
      }

      // Check if I'm already in participants
      const alreadyParticipant = data.participants.some(
        (p) => p.name === currentUser.name
      );

      // If not, add me
      if (!alreadyParticipant) {
        const updated = await updateSessionOnDB(sessionId, {
          participants: [
            ...data.participants,
            { name: currentUser.name, done: currentUser.done },
          ],
        });
        data = updated;
      }

      // If the host set status to "SWIPING" already,
      // navigate to the swipe page
      if (data.status === "SWIPING") {
        router.push(`/session/${sessionId}/swipe`);
      }

      setSessionData(data);
    })();
  }, [sessionId, currentUser, router]);

  // 3) Poll for updates every 3s => if status=SWIPING, redirect
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      const data = await fetchSessionFromDB(sessionId);
      if (data && !data.error) {
        setSessionData(data);

        if (data.status === "SWIPING") {
          // Everyone sees that the session is now swiping
          router.push(`/session/${sessionId}/swipe`);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, router]);

  if (!sessionData) {
    return <div className="p-6">Loading session...</div>;
  }

  // Identify my participant info
  const myParticipant = sessionData.participants.find(
    (p) => p.name === currentUser?.name
  );
  const isHost = myParticipant?.isHost || false;

  // Mark myself as done
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

  // Add a restaurant => calls /api/decision-sessions/[sessionId]/restaurants
  const addRestaurant = async () => {
    if (!restaurantInput.name) return;
    try {
      const res = await fetch(`/api/decision-sessions/${sessionId}/restaurants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: currentUser?.name, // needed for server validations
          name: restaurantInput.name,
          description: restaurantInput.description,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add restaurant");
      }
      await res.json();

      // Re-fetch the updated session
      const updated = await fetchSessionFromDB(sessionId);
      if (updated && !updated.error) {
        setSessionData(updated);
      }
      // Clear the input fields
      setRestaurantInput({ name: "", description: "" });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const allDone = sessionData.participants.every((p) => p.done);

  // Only the host can start swiping
  const startSwiping = async () => {
    if (!isHost) {
      alert("Only the host can start swiping!");
      return;
    }
    // (Optional) update session status => "SWIPING"
    const updated = await updateSessionOnDB(sessionId, {
      status: "SWIPING",
    });
    if (!updated) {
      alert("Failed to set session to SWIPING");
      return;
    }
    // For host, go immediately to swipe
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
              {p.name}
              {p.isHost && <strong> (Host)</strong>}
              {" – "}
              {p.done ? "Done" : "Not Done"}
            </li>
          ))}
        </ul>
      </div>

      {/* Mark myself as done if I'm not done */}
      {!myParticipant?.done && (
        <button
          onClick={markAsDone}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4"
        >
          Mark as Done
        </button>
      )}

      {allDone && <p className="mb-4 text-green-600">All participants are done!</p>}

      {/* Show session restaurants */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Restaurants</h2>
        {sessionData.sessionItems?.length ? (
          <ul>
            {sessionData.sessionItems.map((item) => {
              const { name, description } = item.restaurant;
              return (
                <li key={item.id} className="mb-2">
                  <strong className="block text-lg">{name}</strong>
                  <span className="text-gray-700">{description || "(no description)"}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No restaurants yet.</p>
        )}
      </div>

      {/* Add a restaurant */}
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

      {/* If I'm the host, I can start swiping */}
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
