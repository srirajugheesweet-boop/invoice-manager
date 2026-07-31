"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FileCheck2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  User as UserIcon,
  Smartphone,
  Download,
  X,
  Share,
} from "lucide-react";

export default function AuthView() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if app is already running in standalone PWA mode
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        await register(email, password, displayName || undefined);
        setSuccessMsg("Admin account created successfully! Signing in...");
      } else {
        await login(email, password);
        setSuccessMsg("Welcome back!");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = "Authentication failed. Please check your credentials.";
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        msg = isRegistering
          ? "Failed to create account. Make sure Email/Password auth is enabled in Firebase Console."
          : "Invalid email or password. If you haven't created an account on project 'raju-invoice-manager' yet, click 'Register Account' below.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please Sign In.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg = "Email/Password Authentication is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.";
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col justify-center items-center p-4 font-sans text-slate-800 select-none">
      {/* Central Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 flex items-center justify-center font-bold text-slate-950 mx-auto shadow-md shadow-amber-500/20">
            <FileCheck2 className="w-6 h-6 text-slate-950" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
              Invoice<span className="text-amber-600">Next</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-300">
                Pro
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Raju Ghee Sweets Invoice Manager Portal
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="border-b border-slate-100 pb-3 text-center">
          <h2 className="text-sm font-bold text-slate-900">
            {isRegistering ? "Register Admin Account" : "Sign In to Account"}
          </h2>
          <p className="text-[11px] text-slate-500">
            {isRegistering
              ? "Create your initial login for raju-invoice-manager"
              : "Enter your email and password to access invoices & AI scanner"}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-700 space-y-1 animate-in fade-in duration-150">
            <div className="flex items-start space-x-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-800 flex items-start space-x-2 animate-in fade-in duration-150 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name / Business Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Raju Ghee Admin"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rajugheesweets.com"
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md shadow-amber-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isRegistering ? "Creating Account..." : "Signing In..."}</span>
              </>
            ) : (
              <>
                <span>{isRegistering ? "Create & Sign In" : "Sign In to Dashboard"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-amber-700 hover:text-amber-900 font-semibold cursor-pointer underline"
          >
            {isRegistering
              ? "Already have an account? Sign In"
              : "First time on this project? Register Account"}
          </button>
        </div>

        {/* PWA App Install Button */}
        {!isInstalled && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Install InvoiceNext App</span>
              {/* <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium">
                PWA
              </span> */}
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div className="pt-2 border-t border-slate-100 text-center flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Protected by Firebase Enterprise Auth</span>
        </div>
      </div>

      {/* PWA Installation Instructions Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-600" />
                Install InvoiceNext App
              </h4>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-amber-600" /> iPhone / iPad (Safari)
                </span>
                <p className="text-[11px] text-amber-900">
                  Tap the <strong className="font-bold">Share</strong> icon in Safari toolbar, scroll down, and select <strong className="font-bold font-mono">"Add to Home Screen"</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-slate-700" /> Android / Chrome / Edge
                </span>
                <p className="text-[11px] text-slate-600">
                  Tap the browser menu <strong className="font-bold font-mono">(⋮)</strong> and select <strong className="font-bold font-mono">"Install app"</strong> or <strong className="font-bold font-mono">"Add to Home screen"</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
