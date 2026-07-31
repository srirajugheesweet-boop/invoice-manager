"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import AuthView from "@/components/AuthView";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f6f7] text-slate-800 flex flex-col items-center justify-center space-y-3 font-sans select-none">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
        <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Verifying InvoiceNext Authentication...</span>
        </div>
      </div>
    );
  }

  // Strict Protection: Render ONLY AuthView if not logged in
  if (!user) {
    return <AuthView />;
  }

  // Once authenticated, render full shell layout with Header, Sidebar, and Page content
  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col font-sans select-none">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-3.5rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#f6f6f7]">
          {children}
        </main>
      </div>
    </div>
  );
}
