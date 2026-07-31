"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Eye,
  Bell,
  Command,
  FileCheck2,
  Menu,
} from "lucide-react";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const userName =
    user?.displayName ||
    (user?.email ? user.email.split("@")[0] : "Raju Ghee Sweets Admin");

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "RG";

  return (
    <header className="bg-[#1a1a1a] text-white h-14 px-3 sm:px-4 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-[#2d2d2d]">
      {/* Left: Hamburger button for Mobile + Brand Logo */}
      <div className="flex items-center space-x-2.5">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#282828] md:hidden cursor-pointer transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>
        )}

        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center font-bold text-slate-950 shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <FileCheck2 className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-sm text-white font-sans">
                Invoice<span className="text-amber-400">Next</span>
              </span>
              <span className="text-[10px] bg-[#2a2a2a] text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium border border-amber-500/20 hidden sm:inline-block">
                Pro
              </span>
            </div>
            <span className="text-[10px] text-amber-200/80 font-medium truncate max-w-[110px] sm:max-w-none">
              Raju Ghee Sweets
            </span>
          </div>
        </Link>
      </div>

      {/* Middle: Search Bar (Hidden on small mobile, visible on sm+) */}
      <div className="hidden sm:flex flex-1 max-w-md md:max-w-xl mx-2 md:mx-4">
        <div className="relative flex items-center w-full">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices, GST bills, vendors..."
            className="w-full bg-[#262626] border border-[#333333] hover:border-[#444444] focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 text-xs sm:text-sm text-gray-200 placeholder-gray-400 rounded-lg pl-9 pr-14 py-1.5 transition-all"
          />
          <div className="absolute right-2 hidden md:flex items-center space-x-1">
            <span className="text-[11px] font-mono text-gray-400 bg-[#1a1a1a] border border-[#383838] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Logged-In User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button className="hidden lg:flex items-center space-x-1.5 bg-[#282828] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-medium text-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Raju Ghee Sweets</span>
        </button>

        <button className="relative p-1.5 text-gray-300 hover:text-white hover:bg-[#282828] rounded-lg cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Account Display */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#333333]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[11px] font-bold text-slate-950 shadow-xs shrink-0">
            {initials}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-gray-200 truncate max-w-[110px] md:max-w-[140px]">
              {userName}
            </span>
            <span className="text-[10px] text-gray-400 truncate max-w-[110px] md:max-w-[140px]">
              {user?.email || "Authenticated User"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
