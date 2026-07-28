"use client";

import React, { useState } from "react";
import {
  Search,
  Eye,
  Bell,
  ChevronDown,
  Sparkles,
  Command,
  Building2,
  Store,
  FileCheck2,
} from "lucide-react";

interface HeaderProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function Header({ activePage, onPageChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-[#1a1a1a] text-white h-14 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-[#2d2d2d]">
      {/* Left: Brand Logo & Company Title */}
      <div className="flex items-center space-x-3 min-w-[240px]">
        <div className="flex items-center space-x-2.5 cursor-pointer group" onClick={() => onPageChange("scan")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center font-bold text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
            <FileCheck2 className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-sm text-white font-sans">
                Invoice<span className="text-amber-400">Next</span>
              </span>
              <span className="text-[10px] bg-[#2a2a2a] text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium border border-amber-500/20">
                Pro
              </span>
            </div>
            <span className="text-[10px] text-amber-200/80 font-medium">Raju Ghee Sweets</span>
          </div>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoices, GST bills, vendors..."
            className="w-full bg-[#262626] border border-[#333333] hover:border-[#444444] focus:border-amber-400/60 focus:outline-none focus:ring-1 focus:ring-amber-400/40 text-sm text-gray-200 placeholder-gray-400 rounded-lg pl-9 pr-24 py-1.5 transition-all"
          />
          <div className="absolute right-2 flex items-center space-x-1">
            <span className="text-[11px] font-mono text-gray-400 bg-[#1a1a1a] border border-[#383838] px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Account Profile */}
      <div className="flex items-center space-x-3">
        <button className="flex items-center space-x-1.5 bg-[#282828] hover:bg-[#333333] border border-[#3a3a3a] text-xs font-medium text-gray-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Raju Ghee Sweets</span>
        </button>

        <button className="relative p-2 text-gray-300 hover:text-white hover:bg-[#282828] rounded-lg cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 pl-2 border-l border-[#333333] cursor-pointer hover:opacity-90">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[11px] font-bold text-slate-950 shadow-xs">
            RGS
          </div>
          <span className="text-xs font-semibold text-gray-200 hidden sm:inline-block">
            Raju Ghee Sweets
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
