"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthView from "@/components/AuthView";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { RefreshCw, ShieldCheck } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-update Service Worker listener for new deployments
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (
                  installingWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New deployment detected! Auto reload to apply updates immediately
                  console.log("New deployment detected. Auto updating PWA app...");
                  window.location.reload();
                }
              };
            }
          };
        })
        .catch((err) => {
          console.error("Service worker registration failed:", err);
        });

      // Periodically check for new deployments every 60 seconds
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) reg.update();
        });
      }, 60000);

      return () => clearInterval(interval);
    }
  }, []);

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
      <Header onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />
      <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-3.5rem)] relative">
        <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
        <main className="flex-1 overflow-y-auto bg-[#f6f6f7]">
          {children}
        </main>
      </div>
    </div>
  );
}
