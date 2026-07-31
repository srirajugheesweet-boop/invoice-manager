"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ScanLine,
  FileText,
  BarChart3,
  Settings,
  LucideIcon,
  Cpu,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/scan", label: "Scan (Next AI)", icon: ScanLine, badge: "Pro" },
    { href: "/docai", label: "Next Document AI", icon: Cpu, badge: "Mini" },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart3, badge: "Soon" },
  ];

  return (
    <aside className="w-60 bg-[#ebebeb] border-r border-[#dcdcdc] flex flex-col justify-between select-none min-h-[calc(100vh-3.5rem)] text-slate-800 shrink-0">
      <div className="p-3 space-y-3">
        <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/scan" && (pathname === "/" || pathname === "/scan"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm font-semibold border border-slate-200/80"
                    : "text-slate-700 hover:bg-[#e0e0e0] hover:text-slate-900"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? item.href === "/docai"
                          ? "text-indigo-600"
                          : "text-amber-600"
                        : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className="bg-[#dedede] text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      item.badge === "Next AI"
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : item.badge === "Next Doc"
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Settings */}
      <div className="p-3 border-t border-[#dbdbdb] bg-[#e6e6e6]">
        <Link
          href="/analytics"
          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-[#dadada] cursor-pointer transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
