import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvoiceNext - Raju Ghee Sweets Invoice Manager",
  description: "InvoiceNext AI document scanner and GST invoice management dashboard for Raju Ghee Sweets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans select-none bg-[#f6f6f7]">
        {/* Shared App Header */}
        <Header />

        {/* Workspace Shell Layout with Sidebar & Active Page View */}
        <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-3.5rem)]">
          <Sidebar />

          <main className="flex-1 overflow-y-auto bg-[#f6f6f7]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
