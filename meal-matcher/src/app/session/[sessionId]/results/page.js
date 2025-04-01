"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SessionResults() {
  const { sessionId } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const key = `swipeResults_${sessionId}`;
    const data = localStorage.getItem(key);
    if (data) {
      setResults(JSON.parse(data));
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="mb-4 text-3xl font-bold text-gray-800">
        Results for Session: {sessionId}
      </h1>

      {results.length === 0 ? (
        <p className="text-xl text-gray-700">No swipe data available yet.</p>
      ) : (
        results.map((userSwipes, index) => (
          <div key={index} className="mb-6 rounded bg-white p-4 shadow">
            <h2 className="mb-2 text-xl font-bold">User {index + 1}</h2>
            <ul className="space-y-2">
              {userSwipes.map((swipe, i) => (
                <li key={i} className="border-b py-2">
                  <span className="font-semibold">{swipe.name}</span> — swiped{" "}
                  <span className="capitalize">{swipe.direction}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}

      <Link
        href="/session"
        className="mt-6 inline-block rounded bg-indigo-600 px-4 py-2 text-white shadow 
          hover:bg-indigo-700"
      >
        Back to Session Home
      </Link>
    </div>
  );
}
