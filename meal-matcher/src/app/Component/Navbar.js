"use client";
import React from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        {/* <Image src="/loom-logo.svg" alt="Loom Logo" width={30} height={30} /> */}
        <span className="font-semibold text-lg text-gray-900">
          <span className="text-black">Meal</span>{" "}
          <span className="text-gray-700">Matcher</span>
        </span>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => signIn()}
          className="text-gray-700 duration-300 cursor-pointer relative overflow-hidden after:h-[1px] after:w-full after:bottom-0 after:right-full after:bg-black  after:absolute hover:after:translate-x-full after:duration-300"
        >
          Sign In
        </button>
        <Link href="/signup">
          <button className="bg-[#635BFF] text-white font-medium px-4 py-2 rounded-full shadow-lg cursor-pointer duration-300 hover:opacity-30 hover:scale-90">
            Create an Account For Free
          </button>
        </Link>
        <Link href="/contact">
          <button className="bg-[#EDEBFF] text-[#635BFF] font-medium px-4 py-2 rounded-full cursor-pointer duration-300 hover:opacity-30 hover:scale-90 hover:bg-[#dcd8ff]">
            Contact Us
          </button>
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100">
          {/* <Menu size={24} /> */}
        </button>
      </div>
    </nav>
  );
}
