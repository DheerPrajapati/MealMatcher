"use client";
import React from "react";
import Link from "next/link";

export default function Navbar_signedin() {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white">
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        {/* <Image src="/loom-logo.svg" alt="Loom Logo" width={30} height={30} /> */}
        <Link href={"/"}>
          <span className="font-semibold text-lg text-gray-900">
            <span className="text-{#008B84}">Meal</span>{" "}
            <span className="text-{#008B84}">Matcher</span>
          </span>
        </Link>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center space-x-4">
        <Link href="/groups">
          <button className="bg-[#635BFF] text-white font-medium px-4 py-2 rounded-full shadow-lg cursor-pointer duration-300 hover:opacity-30 hover:scale-90">
            Groups
          </button>
        </Link>
        <Link href="/profile">
          <button className="bg-[#EDEBFF] text-[#635BFF] font-medium px-4 py-2 rounded-full cursor-pointer duration-300 hover:opacity-30 hover:scale-90 hover:bg-[#dcd8ff]">
            Profile
          </button>
        </Link>
        <button className="p-2 rounded-full hover:bg-gray-100">
          {/* <Menu size={24} /> */}
        </button>
      </div>
    </nav>
  );
}
