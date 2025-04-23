// app/join/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar_signedin from "../Component/Navbar_signedin";

export default function JoinSessionPage() {
  const [sessionId, setSessionId] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId.trim() || !name.trim()) {
      alert("Both Session ID and Name are required");
      return;
    }

    // check that the session exists
    const res = await fetch(`/api/decision-sessions/${sessionId}`);
    if (!res.ok) {
      alert("Session not found");
      return;
    }

    // stash the user info for SessionPage to pick up
    const user = { name: name.trim(), done: false };
    sessionStorage.setItem(
      `session_user_${sessionId}`,
      JSON.stringify(user)
    );

    // navigate into the session page
    router.push(`/session/${sessionId}`);
  };

  return (
    <>
    <Navbar_signedin />
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-semibold mb-6">Join a Session</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block mb-1 font-medium">Session ID</label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. 12345"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Alice"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Join Session
        </button>
      </form>
    </div>
    </>
  );
}
