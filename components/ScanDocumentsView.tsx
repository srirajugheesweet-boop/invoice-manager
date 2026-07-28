"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileCheck,
  Zap,
  Sparkles,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Trash2,
  ArrowRight,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function ScanDocumentsView() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [documents, setDocuments] = useState([
    {
      id: "DOC-2026-881",
      fileName: "Dairy_Supply_Invoice_July.pdf",
      vendor: "Raju Cow Milk Dairy",
      date: "2026-07-28",
      itemsCount: 14,
      subtotal: "₹45,200.00",
      status: "Verified",
      confidence: "99.4%",
      type: "Supplier Invoice",
    },
    {
      id: "DOC-2026-880",
      fileName: "Cardboard_Boxes_Packaging_Bill.pdf",
      vendor: "Sri Balaji Packaging Ind.",
      date: "2026-07-27",
      itemsCount: 8,
      subtotal: "₹18,450.00",
      status: "Verified",
      confidence: "98.1%",
      type: "Packaging",
    },
    {
      id: "DOC-2026-879",
      fileName: "Pure_Desi_Ghee_Tin_Batch_404.jpg",
      vendor: "Raju Ghee Sweets Main Unit",
      date: "2026-07-26",
      itemsCount: 22,
      subtotal: "₹1,12,000.00",
      status: "Needs Review",
      confidence: "88.5%",
      type: "Internal Batch",
    },
    {
      id: "DOC-2026-878",
      fileName: "Sugar_DryFruits_Vendor_Invoice.pdf",
      vendor: "Lakshmi Wholesale Traders",
      date: "2026-07-25",
      itemsCount: 6,
      subtotal: "₹34,800.00",
      status: "Verified",
      confidence: "99.0%",
      type: "Raw Material",
    },
  ]);

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const newDoc = {
        id: `DOC-2026-${Math.floor(882 + Math.random() * 100)}`,
        fileName: `Scanned_Bill_${Date.now().toString().slice(-4)}.pdf`,
        vendor: "Krishna Pure Butter & Ghee Co.",
        date: new Date().toISOString().split("T")[0],
        itemsCount: 12,
        subtotal: "₹28,500.00",
        status: "Verified",
        confidence: "99.8%",
        type: "Dairy Invoice",
      };
      setDocuments([newDoc, ...documents]);
      setIsScanning(false);
      setSelectedDoc(newDoc);
    }, 1800);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
            Scan Documents & Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated OCR extraction for Raju Ghee Sweets purchase orders, bills & receipts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulatedScan}
            disabled={isScanning}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Scanning OCR...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Scan New Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Scanned Today</span>
            <div className="text-xl font-bold text-slate-900 mt-1">24 Scans</div>
            <span className="text-[11px] text-emerald-600 font-medium">↑ 18% vs yesterday</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">OCR Accuracy</span>
            <div className="text-xl font-bold text-slate-900 mt-1">98.9%</div>
            <span className="text-[11px] text-slate-500 font-medium">AI Powered Engine</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pending Review</span>
            <div className="text-xl font-bold text-slate-900 mt-1">1 Document</div>
            <span className="text-[11px] text-amber-600 font-medium">Requires approval</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Extracted</span>
            <div className="text-xl font-bold text-slate-900 mt-1">₹2,10,450</div>
            <span className="text-[11px] text-slate-500 font-medium">4 Verified Invoices</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onClick={handleSimulatedScan}
        className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-amber-500/80 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-amber-50/20 group relative overflow-hidden"
      >
        {isScanning && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-10 space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            <p className="text-sm font-semibold text-slate-800 animate-pulse">
              Extracting invoice line items, dates, and amounts...
            </p>
          </div>
        )}

        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">
          Drop PDF or Image Invoices here, or <span className="text-amber-600 underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, JPG, PNG scanned physical bills & supplier receipts up to 25MB
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSimulatedScan();
            }}
            className="text-xs bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs font-medium cursor-pointer"
          >
            📄 Try Demo Invoice 1 (Dairy)
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSimulatedScan();
            }}
            className="text-xs bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg shadow-2xs font-medium cursor-pointer"
          >
            📦 Try Demo Invoice 2 (Packaging)
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Recent Scanned Documents</h2>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter by vendor..."
                className="pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 w-44"
              />
            </div>
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Document ID</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Vendor Name</th>
                <th className="py-3 px-4">Scan Date</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Extracted Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">OCR Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{doc.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[180px]">{doc.fileName}</span>
                  </td>
                  <td className="py-3 px-4">{doc.vendor}</td>
                  <td className="py-3 px-4 text-slate-500">{doc.date}</td>
                  <td className="py-3 px-4 font-medium">{doc.itemsCount} items</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{doc.subtotal}</td>
                  <td className="py-3 px-4">
                    {doc.status === "Verified" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                        Needs Review
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {doc.confidence}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Document Details Drawer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">{selectedDoc.id} Details</h3>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">File Name</span>
                <span className="font-semibold text-slate-900">{selectedDoc.fileName}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Vendor</span>
                <span className="font-semibold text-slate-900">{selectedDoc.vendor}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Extracted Amount</span>
                <span className="font-bold text-base text-slate-900">{selectedDoc.subtotal}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">OCR Confidence</span>
                <span className="font-semibold text-emerald-700">{selectedDoc.confidence} Match</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Invoice ${selectedDoc.id} sent to Invoices ledger!`);
                  setSelectedDoc(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Approve & Sync to Invoices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
