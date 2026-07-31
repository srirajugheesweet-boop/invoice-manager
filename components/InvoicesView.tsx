"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Clock,
  Search,
  ChevronDown,
  ArrowUpDown,
  LayoutGrid,
  Plus,
  Check,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  getInvoicesFromFirebase,
  deleteInvoiceFromFirebase,
  ExtractedInvoice,
} from "@/lib/firebase";

export default function InvoicesView() {
  const [invoices, setInvoices] = useState<ExtractedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ExtractedInvoice | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch invoices from Firebase on mount
  const fetchInvoices = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getInvoicesFromFirebase();
      setInvoices(data);
    } catch (err: any) {
      console.error("Failed to load invoices from Firebase:", err);
      setErrorMsg("Failed to connect to Firebase. Showing sample local invoice ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices by search query
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchQuery.toLowerCase();
    return (
      (inv.vendor_name && inv.vendor_name.toLowerCase().includes(q)) ||
      (inv.invoice_number && inv.invoice_number.toLowerCase().includes(q)) ||
      (inv.gstin && inv.gstin.toLowerCase().includes(q))
    );
  });

  // Calculate Summary Metrics
  const totalGrandSum = filteredInvoices.reduce((acc, curr) => acc + (Number(curr.grand_total) || 0), 0);
  const totalTaxableSum = filteredInvoices.reduce((acc, curr) => acc + (Number(curr.taxable_amount) || 0), 0);
  const totalGstSum = filteredInvoices.reduce((acc, curr) => acc + (Number(curr.total_gst) || 0), 0);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((inv) => inv.id!).filter(Boolean));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Delete invoice from Firebase
  const handleDeleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice from Firebase?")) return;
    try {
      await deleteInvoiceFromFirebase(id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      if (selectedInvoice?.id === id) setSelectedInvoice(null);
    } catch (err: any) {
      alert(`Error deleting invoice: ${err.message || err}`);
    }
  };

  // Export Invoices as CSV
  const handleExportCSV = () => {
    if (invoices.length === 0) {
      alert("No invoices available to export.");
      return;
    }

    const headers = ["Vendor Name", "Invoice Number", "GSTIN", "Date", "HSN", "Taxable Amount", "CGST", "SGST", "IGST", "Total GST", "Grand Total", "Status"];
    const csvRows = [headers.join(",")];

    invoices.forEach((inv) => {
      const row = [
        `"${inv.vendor_name || ""}"`,
        `"${inv.invoice_number || ""}"`,
        `"${inv.gstin || ""}"`,
        `"${inv.invoice_date || ""}"`,
        `"${inv.hsn || ""}"`,
        inv.taxable_amount || 0,
        inv.cgst || 0,
        inv.sgst || 0,
        inv.igst || 0,
        inv.total_gst || 0,
        inv.grand_total || 0,
        `"${inv.status || "Accepted"}"`,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Raju_Ghee_Sweets_Invoices_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 bg-[#f6f6f7] min-h-screen text-slate-800 font-sans max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-amber-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Accepted Invoices Ledger
            </h1>
            <p className="text-xs text-slate-500">
              Synced live with Firebase Firestore database (`invoices` collection)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs flex items-center space-x-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Accepted Invoices</span>
            <div className="text-xl font-bold text-slate-900 mt-1">{invoices.length} Invoices</div>
            <span className="text-[11px] text-emerald-600 font-medium">Synced in Firebase</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Taxable Value</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalTaxableSum.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Base Invoice Amount</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Invoice Value (incl. GST)</span>
            <div className="text-xl font-bold text-slate-900 mt-1">
              ₹{totalGrandSum.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">GST Total: ₹{totalGstSum.toLocaleString("en-IN")}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
            ₹
          </div>
        </div>
      </div>

      {/* Main Table Card Box */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">Firestore `invoices` Collection</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
              Live Database
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor, invoice #, or GSTIN..."
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
              <p className="text-xs font-medium">Loading invoices from Firebase...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No accepted invoices found</p>
              <p className="text-xs text-slate-400">
                Go to "Scan Documents" tab, scan invoice images, and click Accept to save them here!
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#fafafa] border-b border-slate-200 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3">Vendor Name</th>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3">Invoice Date</th>
                  <th className="py-2.5 px-3">Taxable Amt</th>
                  <th className="py-2.5 px-3">Total GST</th>
                  <th className="py-2.5 px-3">Grand Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isSelected = inv.id ? selectedIds.includes(inv.id) : false;

                  return (
                    <tr
                      key={inv.id || Math.random()}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => inv.id && toggleSelectOne(inv.id)}
                          className="rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Vendor Name */}
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center space-x-2">
                        <div className="w-7 h-7 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {(inv.vendor_name || "V").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[180px]">{inv.vendor_name}</span>
                      </td>

                      {/* Invoice Number */}
                      <td className="py-3 px-3 font-mono font-medium text-slate-800">
                        {inv.invoice_number || "N/A"}
                      </td>

                      {/* GSTIN */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {inv.gstin || "N/A"}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-600">{inv.invoice_date}</td>

                      {/* Taxable Amount */}
                      <td className="py-3 px-3 font-medium text-slate-800">
                        ₹{Number(inv.taxable_amount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Total GST */}
                      <td className="py-3 px-3 font-medium text-amber-800">
                        ₹{Number(inv.total_gst || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        ₹{Number(inv.grand_total || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#d1fadf] text-[#027a48]">
                          <Check className="w-3 h-3 mr-1" />
                          Accepted
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.id && (
                          <button
                            onClick={() => handleDeleteInvoice(inv.id!)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Delete from Firebase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAILED INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                Firebase Invoice Record Details
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Vendor Name</span>
                <span className="font-bold text-slate-900">{selectedInvoice.vendor_name}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">GSTIN</span>
                <span className="font-mono text-slate-900">{selectedInvoice.gstin || "N/A"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Invoice Number</span>
                <span className="font-semibold text-slate-900">{selectedInvoice.invoice_number}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">Invoice Date</span>
                <span className="font-semibold text-slate-900">{selectedInvoice.invoice_date}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                <span className="text-slate-500 font-medium">HSN Code</span>
                <span className="font-mono text-slate-900">{selectedInvoice.hsn || "N/A"}</span>
              </div>

              {/* Tax Breakdowns */}
              <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-lg space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Taxable Amount:</span>
                  <span className="font-semibold text-slate-900">₹{Number(selectedInvoice.taxable_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CGST Amount:</span>
                  <span className="font-semibold text-slate-800">₹{Number(selectedInvoice.cgst).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">SGST Amount:</span>
                  <span className="font-semibold text-slate-800">₹{Number(selectedInvoice.sgst).toLocaleString('en-IN')}</span>
                </div>
                {Number(selectedInvoice.igst) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">IGST Amount:</span>
                    <span className="font-semibold text-slate-800">₹{Number(selectedInvoice.igst).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-amber-200/80 pt-1.5 font-bold text-sm text-slate-900">
                  <span>Grand Total (incl. GST):</span>
                  <span className="text-emerald-700">₹{Number(selectedInvoice.grand_total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
