"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar_signedin from "../Component/Navbar_signedin";
import Footer from "../Component/footer";

export default function SessionHome() {
  const router = useRouter();

  const createSession = async () => {
    try {
      const response = await fetch("/api/decision-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My New Session",   // optional
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create session");
      }
      const newSession = await response.json();
      // newSession => { id: <number>, name: "...", status: "VOTING", ... }

      // Redirect to /session/[sessionId]
      router.push(`/session/${newSession.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    }
  };

  return (
    <>
    <Navbar_signedin />
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Create a New Session</h1>
      <button
        onClick={createSession}
        className="rounded bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-600"
      >
        Create Session
      </button>
    </div>
    <Footer />
    </>
  );
}
