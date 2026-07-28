"use client";

import React, { useState } from "react";
import { Sparkles, Clock, Bell, ArrowRight, CheckCircle2, Lock } from "lucide-react";

interface ComingSoonProps {
  title?: string;
}

export default function ComingSoonView({ title = "Analytics & Advanced Reports" }: ComingSoonProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center">
      <div className="bg-amber-50 border border-amber-200/80 rounded-full px-4 py-1.5 flex items-center space-x-2 mb-6">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
          Feature Under Construction
        </span>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        {title} <span className="text-amber-500">Coming Soon</span>
      </h1>
      <p className="text-sm text-slate-600 max-w-lg mb-8 leading-relaxed">
        We are building powerful automated Tally integration, custom GST tax reports, and real-time vendor intelligence for Raju Ghee Sweets.
      </p>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10 text-left">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Automatic Tally Sync</h3>
          <p className="text-xs text-slate-500">Direct 1-click export of verified supplier invoices to Tally ERP format.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">GST & Tax Breakdown</h3>
          <p className="text-xs text-slate-500">Instant input tax credit (ITC) calculations and monthly summary ledger.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Vendor Price Alerts</h3>
          <p className="text-xs text-slate-500">AI detection of rate spikes for Milk, Ghee, Containers, and Spices.</p>
        </div>
      </div>

      {/* Subscribe Box */}
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs max-w-md w-full">
        {subscribed ? (
          <div className="flex items-center justify-center space-x-2 text-emerald-700 text-xs font-semibold py-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you! We'll notify you as soon as content is available.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Get notified when this page goes live
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>Notify</span>
                <Bell className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
