"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SessionResultsPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const res = await fetch(`/api/decision-sessions/${sessionId}`);
      if (!res.ok) {
        alert("Session not found");
        return;
      }
      const data = await res.json();
      setSessionData(data);
    })();
  }, [sessionId]);

  if (!sessionData) {
    return <div className="p-6">Loading results...</div>;
  }

  // Sort sessionItems by descending score
  const sortedItems = [...sessionData.sessionItems].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Results for Session {sessionId}</h1>
      <div className="bg-white p-4 rounded shadow">
        {sortedItems.map((item) => (
          <div key={item.id} className="border-b py-2">
            <strong className="block text-lg">{item.restaurant?.name}</strong>
            <p className="text-gray-700">
              Score: {item.score} 
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/session`)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Back to Sessions
      </button>
    </div>
  );
}
