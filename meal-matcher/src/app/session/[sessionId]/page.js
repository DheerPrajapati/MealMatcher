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

  // On mount, read or prompt for user name
  useEffect(() => {
    if (!sessionId) return;
    const localKey = `session_user_${sessionId}`;
    let userStr = sessionStorage.getItem(localKey);
    if (!userStr) {
      const name = prompt("Enter your name to join this session:") || "Anonymous";
      userStr = JSON.stringify({ name, done: false });
      sessionStorage.setItem(localKey, userStr);
    }
    setCurrentUser(JSON.parse(userStr));
  }, [sessionId]);

  // Load session, upsert participant if needed
  useEffect(() => {
    if (!sessionId || !currentUser) return;
    (async () => {
      let data = await fetchSessionFromDB(sessionId);
      if (!data || data.error) {
        alert("Session not found or error loading session");
        return;
      }

      // If I'm not in participants, add me
      const alreadyParticipant = data.participants.some((p) => p.name === currentUser.name);
      if (!alreadyParticipant) {
        const updated = await updateSessionOnDB(sessionId, {
          participants: [...data.participants, { name: currentUser.name, done: currentUser.done }],
        });
        data = updated;
      }

      // If status === "SWIPING", go to swipe page
      if (data.status === "SWIPING") {
        router.push(`/session/${sessionId}/swipe`);
      }
      // If status === "COMPLETED", show results or waiting
      setSessionData(data);
    })();
  }, [sessionId, currentUser, router]);

  // Poll for updates => if SWIPING, redirect; if COMPLETED, show results logic
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      const data = await fetchSessionFromDB(sessionId);
      if (data && !data.error) {
        setSessionData(data);
        if (data.status === "SWIPING") {
          router.push(`/session/${sessionId}/swipe`);
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId, router]);

  if (!sessionData) {
    return <div className="p-6">Loading session...</div>;
  }

  const myParticipant = sessionData.participants.find((p) => p.name === currentUser?.name);
  const isHost = myParticipant?.isHost || false;

  // Everyone done adding restaurants
  const allDoneAdding = sessionData.participants.every((p) => p.done);
  // If the session status is COMPLETED => everyone is done swiping
  const sessionCompleted = sessionData.status === "COMPLETED";

  // Mark myself done adding restaurants
  const markAsDone = async () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, done: true };
    setCurrentUser(updatedUser);
    sessionStorage.setItem(`session_user_${sessionId}`, JSON.stringify(updatedUser));

    const updatedParticipants = sessionData.participants.map((p) =>
      p.name === currentUser.name ? { ...p, done: true } : p
    );
    const updated = await updateSessionOnDB(sessionId, { participants: updatedParticipants });
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
          participantName: currentUser?.name,
          name: restaurantInput.name,
          description: restaurantInput.description,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add restaurant");
      }
      await res.json();

      // Re-fetch session
      const updated = await fetchSessionFromDB(sessionId);
      if (updated && !updated.error) {
        setSessionData(updated);
      }
      setRestaurantInput({ name: "", description: "" });
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // If all participants are done with adding restaurants, show "Show Results" if session status=COMPLETED
  // or "Awaiting results" if not host
  const renderResultsSection = () => {
    if (sessionCompleted) {
      // Everyone is done swiping as well
      if (isHost) {
        return (
          <div className="mt-6">
            <button
              onClick={() => router.push(`/session/${sessionId}/results`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Show Results
            </button>
          </div>
        );
      } else {
        return (
          <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded">
            Awaiting results...
          </div>
        );
      }
    }
    return null;
  };



  // The host can only start swiping if all participants are done adding restaurants
  const startSwiping = async () => {
    if (!isHost) {
      alert("Only the host can start swiping!");
      return;
    }
    if (!allDoneAdding) {
      alert("Cannot start swiping until all participants mark themselves as done adding restaurants.");
      return;
    }
    const updated = await updateSessionOnDB(sessionId, { status: "SWIPING" });
    if (!updated) {
      alert("Failed to set session to SWIPING");
      return;
    }
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

      {/* Mark myself as done (adding restaurants) */}
      {!myParticipant?.done && (
        <button
          onClick={markAsDone}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4"
        >
          Mark as Done
        </button>
      )}

      {renderResultsSection()}

      {/* Session Restaurants */}
      <div className="mb-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Restaurants</h2>
        {sessionData.sessionItems?.length ? (
          <ul>
            {sessionData.sessionItems.map((item) => {
              const { name, description } = item.restaurant;
              return (
                <li key={item.id} className="mb-2">
                  <strong className="block text-lg">{name}</strong>
                  <span className="text-gray-700">
                    {description || "(no description)"}
                  </span>
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

      {/* Host-only: Start Swiping button */}
      {isHost && !sessionCompleted && (
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
