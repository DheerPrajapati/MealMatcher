import React from "react";
import Navbar_signedin from "../Component/Navbar_signedin";
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
      <Navbar_signedin />
      <div className="w-full mt-20 px-4 flex flex-col items-center text-center h-200">
        <h1 className="text-4xl md:text-5xl pt-30 font-extrabold text-black max-w-3xl leading-tight">
         Lets get swiping!
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl">
          Start by creating a group or joining one
        </p>
        <div className="flex justify-center items-center space-x-4 pt-4">
          <Link href={'/session'}>
            <button className="px-4 py-2 bg-blue-500 text-white rounded transform motion-safe:hover:scale-110">
                Create a group
            </button>
          </Link>
          <Link href={'/Join'}>
            <button className="px-4 py-2 bg-green-500 text-white rounded transform motion-safe:hover:scale-110">
                Join group
            </button>
          </Link>
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
