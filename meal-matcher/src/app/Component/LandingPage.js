import React from "react";
import Navbar from "./Navbar";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const LandingPage = () => {
  return (
    <div className={inter.className}>
      <Navbar />
      <div className="w-full mt-20 px-4 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black max-w-3xl leading-tight">
          Finding a place to eat can be simple
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl">
          Swipe through local spots and make food decisions with your group
          effortlessly.
        </p>
        <Image
          className="pt-5 pb-0 animate-bounce"
          src={"/arrow_tailwind.svg"}
          alt="arrow"
          width={45}
          height={0}
        ></Image>
        <Link
          href="/swipe"
          className="text-[#635BFF] text-lg font-medium hover:opacity-80 transition"
        >
          Start Now
        </Link>
      </div>

      <div className="bg-[#2596be] h-100 w-full">
        <div className=" mt-24 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 pt-27 text-center">
          <div className="border-solid border-4 border-[#008B84] rounded-lg p-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              Swipe to Vote
            </h2>
            <p className="text-[#A8D9ED] text-sm">
              Swipe right or left. Let the group decide what's next for dinner.
            </p>
          </div>

          <div className="border-solid border-4 border-[#008B84] rounded-lg p-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              Smart Matching
            </h2>
            <p className="text-[#A8D9ED] text-sm">
              We handle the group logic so you don’t have to argue about where
              to eat.
            </p>
          </div>

          <div className="border-solid border-4 border-[#008B84] rounded-lg p-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              Nearby & Relevant
            </h2>
            <p className="text-[#A8D9ED] text-sm">
              Powered by your location. Discover restaurants that actually make
              sense.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 h-75">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-90 pt-25 text-center">
          <div className=" text-[#008B84] text-left">
            <div className="text-white pb-5 font-extrabold">
              {" "}
              About the company
            </div>
            <p className="text-lg">
              You found our footer !, nothing much here, just make sure to make
              an account and start matching!
            </p>
          </div>
          <div className="text-[#008B84]  text-left">
            <div className="text-white text-lg pb-5 font-extrabold">
              Contact Us
            </div>
            <div className="text-lg">
              <div>📍 Blacksburg, VA</div>
              <div>📞 856-089-1234</div>
              <div>📧 support@mealmatcher.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
