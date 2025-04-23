// app/session/[sessionId]/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar_signedin from "@/app/Component/Navbar_signedin";
import Footer from "@/app/Component/footer";

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

  // ─────────────────────────────────────────────────────────────────────────────
  // State hooks (always in the same order)
  // ─────────────────────────────────────────────────────────────────────────────
  const [sessionData, setSessionData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filterText, setFilterText] = useState("");
  const [input, setInput] = useState({ name: "", description: "" });

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects (also always in the same order, before any early returns)
  // ─────────────────────────────────────────────────────────────────────────────

  // 1) Prompt/load user info
  useEffect(() => {
    if (!sessionId) return;
    const key = `session_user_${sessionId}`;
    let stored = sessionStorage.getItem(key);
    if (!stored) {
      const name = prompt("Enter your name to join this session:") || "Anonymous";
      stored = JSON.stringify({ name, done: false });
      sessionStorage.setItem(key, stored);
    }
    setCurrentUser(JSON.parse(stored));
  }, [sessionId]);

  // 2) Fetch session & upsert participant, then redirect if SWIPING
  useEffect(() => {
    if (!sessionId || !currentUser) return;
    (async () => {
      let data = await fetchSessionFromDB(sessionId);
      if (!data || data.error) {
        alert("Session not found or error loading session");
        return;
      }

      if (!data.participants.some(p => p.name === currentUser.name)) {
        data = await updateSessionOnDB(sessionId, {
          participants: [
            ...data.participants,
            { name: currentUser.name, done: currentUser.done }
          ]
        });
      }

      if (data.status === "SWIPING") {
        router.push(`/session/${sessionId}/swipe`);
        return;
      }

      setSessionData(data);
    })();
  }, [sessionId, currentUser, router]);

  // 3) Poll for status changes
  useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(async () => {
      const data = await fetchSessionFromDB(sessionId);
      if (data && !data.error) {
        setSessionData(data);
        if (data.status === "SWIPING") {
          router.push(`/session/${sessionId}/swipe`);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [sessionId, router]);

  // 4) When sessionData.settings.restaurantFilter changes, update filterText
  useEffect(() => {
    if (sessionData?.settings?.restaurantFilter) {
      setFilterText(sessionData.settings.restaurantFilter);
    }
  }, [sessionData?.settings]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Early return while loading
  // ─────────────────────────────────────────────────────────────────────────────
  if (!sessionData) {
    return <div className="p-6">Loading session...</div>;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Derived values
  // ─────────────────────────────────────────────────────────────────────────────
  const me = sessionData.participants.find(p => p.name === currentUser.name);
  const isHost = me?.isHost;
  const allDone = sessionData.participants.every(p => p.done);
  const completed = sessionData.status === "COMPLETED";

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers & computed lists
  // ─────────────────────────────────────────────────────────────────────────────

  // Save the host's filter into session.settings
  async function saveFilter() {
    const updated = await updateSessionOnDB(sessionId, {
      settings: { ...sessionData.settings, restaurantFilter: filterText }
    });
    if (updated) {
      setSessionData(updated);
      alert("Filter saved!");
    }
  }

  // Mark current user done adding restaurants
  async function markAsDone() {
    const updatedUser = { ...currentUser, done: true };
    sessionStorage.setItem(
      `session_user_${sessionId}`,
      JSON.stringify(updatedUser)
    );
    setCurrentUser(updatedUser);

    const updatedParts = sessionData.participants.map(p =>
      p.name === currentUser.name ? { ...p, done: true } : p
    );
    const updated = await updateSessionOnDB(sessionId, {
      participants: updatedParts
    });
    if (updated) setSessionData(updated);
  }

  // Post a new restaurant
  async function addRestaurant() {
    if (!input.name) return;
    const res = await fetch(`/api/decision-sessions/${sessionId}/restaurants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantName: currentUser.name,
        name: input.name,
        description: input.description
      })
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Failed to add restaurant");
      return;
    }
    const data = await fetchSessionFromDB(sessionId);
    if (data) setSessionData(data);
    setInput({ name: "", description: "" });
  }

  // Host starts swiping
  async function startSwiping() {
    if (!isHost) {
      alert("Only the host can start swiping!");
      return;
    }
    if (!allDone) {
      alert("Wait until everyone is done adding.");
      return;
    }
    const updated = await updateSessionOnDB(sessionId, { status: "SWIPING" });
    if (updated) {
      router.push(`/session/${sessionId}/swipe`);
    }
  }

  // Apply the filter to the restaurant list
  const visibleItems = sessionData.sessionItems.filter(item =>
    item.restaurant.name.toLowerCase().includes(filterText.toLowerCase())
  );
  
  return (
    <>
      <Navbar_signedin />

      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-4">
          Session: {sessionId}
        </h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white"
                : "bg-white border"
            }`}
          >
            Overview
          </button>
          {isHost && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded ${
                activeTab === "settings"
                  ? "bg-indigo-600 text-white"
                  : "bg-white border"
              }`}
            >
              Settings
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Participants */}
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h2 className="text-xl font-semibold mb-2">
                Participants
              </h2>
              <ul>
                {sessionData.participants.map(p => (
                  <li key={p.id}>
                    {p.name} {p.isHost && "(Host)"} —{" "}
                    {p.done ? "Done" : "Not Done"}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mark done button */}
            {!me.done && (
              <button
                onClick={markAsDone}
                className="px-4 py-2 bg-indigo-600 text-white rounded mb-4"
              >
                Mark as Done
              </button>
            )}


            {isHost && !completed && (
              <div className="mt-6">
                <button
                  onClick={startSwiping}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Start Swiping
                </button>
              </div>
            )}
          </>
        )}
        {activeTab === "settings" && isHost && (
          <div className="p-6 bg-white rounded shadow max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              Host Settings
            </h2>
            <label className="block mb-2 font-medium">
              Enter Resturant Radius
            </label>
            <input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Show resturant that are 5000 km away…"
            />
            <button
              onClick={saveFilter}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save Filter
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
