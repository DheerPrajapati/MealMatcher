import React from "react";
import Navbar from "./Navbar";
import { Inter } from 'next/font/google';
import Link from "next/link";

// Import Inter font
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
});

const LandingPage = () => {
  return (
    <div className={inter.className}>
      <Navbar />

      {/* Hero Section */}
      <div className="w-full mt-20 px-4 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black max-w-3xl leading-tight">
          Finding a place to eat can be simple
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl">
          Swipe through local spots and make food decisions with your group effortlessly.
        </p>

        {/* Minimal Call-to-Action */}
        <Link href="/swipe" className="mt-6 text-[#635BFF] text-lg font-medium hover:opacity-80 transition">
          Start Now →
        </Link>
      </div>

      <div className="mt-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
        <div>
          <h2 className="text-xl font-semibold text-black mb-2">Swipe to Vote</h2>
          <p className="text-gray-600 text-sm">
            Swipe right or left. Let the group decide what's next for dinner.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-2">Smart Matching</h2>
          <p className="text-gray-600 text-sm">
            We handle the group logic so you don’t have to argue about where to eat.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-2">Nearby & Relevant</h2>
          <p className="text-gray-600 text-sm">
            Powered by your location. Discover restaurants that actually make sense.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
