"use client";
import React, { useState, useEffect } from "react";

interface NavBarProps {
  onSelectTab: (tab: string) => void;
  selectedTab: string;
}

function NavBar({ onSelectTab, selectedTab }: NavBarProps) {
  // Use selectedTab from props to control active tab instead of internal state
  // This keeps the state consistent with the parent component (Home)

  return (
    <div className="bg-slate-300 w-full flex h-16 items-center justify-between p-4">
      <h1 className="text-xl font-medium font-sans">Chat App</h1>
      <div className="flex mr-6 w-60 h-10 items-center justify-center">
        <nav className="flex gap-6">
          <button
            onClick={() => onSelectTab("Public")}
            className={`px-3 py-3 w-28 text-center font-sans font-medium rounded-md transition duration-300 ${
              selectedTab === "Public"
                ? "text-green-600 shadow-md bg-green-50"
                : "text-slate-500 hover:text-green-600 hover:shadow-md hover:bg-green-50"
            }`}
          >
            Public
          </button>
          <button
            onClick={() => onSelectTab("Private")}
            className={`px-3 py-3 w-28 text-center font-sans font-medium rounded-md transition duration-300 ${
              selectedTab === "Private"
                ? "text-green-600 shadow-md bg-green-50"
                : "text-slate-500 hover:text-green-600 hover:shadow-md hover:bg-green-50"
            }`}
          >
            Private
          </button>
        </nav>
      </div>
    </div>
  );
}

export default NavBar;
