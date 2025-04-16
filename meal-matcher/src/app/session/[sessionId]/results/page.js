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

  // Aggregate sessionItems data with votes
  const results = sessionData.sessionItems.map((item) => {
    const likes = item.votes.filter((v) => v.vote === "LIKE").length;
    const dislikes = item.votes.filter((v) => v.vote === "DISLIKE").length;
    return {
      id: item.id,
      name: item.restaurant?.name,
      description: item.restaurant?.description,
      likes,
      dislikes,
      score: item.score,
    };
  });

  // Optionally sort results by score descending
  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  // Handler for the "Back to Sessions" button
  // This should only be available to the host; when pressed, it will DELETE the session.
  const handleBackToSessions = async () => {
    try {
      const res = await fetch(`/api/decision-sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete session");
      }
      router.push(`/session`);
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Error clearing session");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Results for Session {sessionId}</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-300">Restaurant</th>
              <th className="px-4 py-2 border border-gray-300">Description</th>
              <th className="px-4 py-2 border border-gray-300">Likes</th>
              <th className="px-4 py-2 border border-gray-300">Dislikes</th>
              <th className="px-4 py-2 border border-gray-300">Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2 border border-gray-300">{row.name}</td>
                <td className="px-4 py-2 border border-gray-300">
                  {row.description || "-"}
                </td>
                <td className="px-4 py-2 border border-gray-300">{row.likes}</td>
                <td className="px-4 py-2 border border-gray-300">{row.dislikes}</td>
                <td className="px-4 py-2 border border-gray-300">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Back to Sessions button for the host only */}
      <button
        onClick={handleBackToSessions}
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Back to Sessions
      </button>
    </div>
  );
}
