"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ScanDocumentsView from "@/components/ScanDocumentsView";
import InvoicesView from "@/components/InvoicesView";
import ComingSoonView from "@/components/ComingSoonView";

export default function Page() {
  const [activePage, setActivePage] = useState<string>("scan");

  const renderActiveView = () => {
    switch (activePage) {
      case "scan":
        return <ScanDocumentsView />;
      case "invoices":
        return <InvoicesView />;
      case "analytics":
        return <ComingSoonView title="Analytics & Sales Reports" />;
      default:
        return (
          <ComingSoonView
            title={`${activePage.charAt(0).toUpperCase() + activePage.slice(1)} Page`}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col font-sans select-none">
      {/* Shopify Admin Header */}
      <Header activePage={activePage} onPageChange={setActivePage} />

      {/* Main Workspace Layout with Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onPageChange={setActivePage} />

        <main className="flex-1 overflow-y-auto bg-[#f6f6f7]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
