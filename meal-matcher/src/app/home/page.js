import React from "react";
import Navbar_signedin from "../Component/Navbar_signedin";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const Home = () => {
  return (
    <div className={inter.className}>
      <Navbar_signedin />
      <div className="w-full mt-20 px-4 flex flex-col  text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black max-w-3xl leading-tight text-left">
          Hello Insert Name
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl text-left">
          Start by creating a group or joining an existing one
        </p>
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

export default Home;
