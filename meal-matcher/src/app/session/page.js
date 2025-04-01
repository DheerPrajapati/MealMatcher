"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function SessionHome() {
  const router = useRouter();

  const createSession = () => {
    // Generate a random 6-char session ID
    const sessionId = Math.random().toString(36).substring(2, 8);
    // Redirect to the dynamic route
    router.push(`/session/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Create a New Session</h1>
      <button
        onClick={createSession}
        className="rounded bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-600"
      >
        Create Session
      </button>
    </div>
  );
}
