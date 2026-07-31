"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileCheck,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  ArrowRight,
  RefreshCw,
  Check,
  X,
  Edit,
  Key,
  Image as ImageIcon,
  CheckCheck,
  Sliders,
  Database,
  Building,
  Camera,
} from "lucide-react";
import { saveInvoiceToFirebase, ExtractedInvoice } from "@/lib/firebase";

interface ScannedInvoiceItem extends ExtractedInvoice {
  tempId: string;
  imagePreviewUrl?: string;
  file?: File;
  scanStatus: "pending" | "scanning" | "scanned" | "error" | "accepted";
  errorMessage?: string;
  provider?: string;
}

export default function DocAIScanView() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; preview: string }[]>([]);
  const [scannedResults, setScannedResults] = useState<ScannedInvoiceItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number; currentFileName: string }>({
    current: 0,
    total: 0,
    currentFileName: "",
  });

  // Google Document AI Config Modal / Settings
  const [showConfig, setShowConfig] = useState(false);
  const [projectId, setProjectId] = useState(process.env.NEXT_PUBLIC_DOCUMENT_AI_PROJECT_ID || "mokshith-lab");
  const [location, setLocation] = useState(process.env.NEXT_PUBLIC_DOCUMENT_AI_LOCATION || "us");
  const [processorId, setProcessorId] = useState(process.env.NEXT_PUBLIC_DOCUMENT_AI_PROCESSOR_ID || "");
  const [apiKey, setApiKey] = useState("");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<ScannedInvoiceItem | null>(null);

  // View Details Modal State
  const [viewingItem, setViewingItem] = useState<ScannedInvoiceItem | null>(null);

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUploadClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowUploadModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
      if (files.length === 0) {
        alert("Please select image files only (PNG, JPG, JPEG, WEBP).");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [...prev, { file, preview: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Drag and Drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
      if (files.length === 0) {
        alert("Please drop image files only (PNG, JPG, JPEG, WEBP).");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => [...prev, { file, preview: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllSelectedFiles = () => {
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  // Run Document AI Scan Job
  const runScanJob = async () => {
    if (selectedFiles.length === 0) return;

    setIsScanning(true);
    setScanProgress({ current: 0, total: selectedFiles.length, currentFileName: selectedFiles[0].name });

    const newScannedItems: ScannedInvoiceItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const previewObj = filePreviews.find((fp) => fp.file === file);
      const previewUrl = previewObj ? previewObj.preview : "";

      setScanProgress({
        current: i + 1,
        total: selectedFiles.length,
        currentFileName: file.name,
      });

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Send to backend route /api/scan-document-ai
        const response = await fetch("/api/scan-document-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type,
            fileName: file.name,
            customProjectId: projectId || undefined,
            customLocation: location || undefined,
            customProcessorId: processorId || undefined,
            customApiKey: apiKey || undefined,
          }),
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          newScannedItems.push({
            tempId: `DOCAI-${Date.now()}-${i}`,
            vendor_name: resData.data.vendor_name || "Unknown Vendor",
            gstin: resData.data.gstin || "",
            invoice_number: resData.data.invoice_number || "",
            invoice_date: resData.data.invoice_date || new Date().toISOString().split("T")[0],
            taxable_amount: resData.data.taxable_amount || 0,
            cgst: resData.data.cgst || 0,
            sgst: resData.data.sgst || 0,
            igst: resData.data.igst || 0,
            total_gst: resData.data.total_gst || 0,
            grand_total: resData.data.grand_total || 0,
            hsn: resData.data.hsn || "",
            items: resData.data.items || [],
            fileName: file.name,
            imagePreviewUrl: previewUrl,
            scanStatus: "scanned",
            provider: resData.provider || "Google Document AI",
          });
        } else {
          console.error("Document AI API error:", resData.error);
          showToast(`Error scanning ${file.name}: ${resData.error || "Document AI error"}`);
        }
      } catch (err: any) {
        console.error(`Error processing ${file.name} with Document AI:`, err);
        showToast(`Failed to scan ${file.name}. ${err.message || ""}`);
      }
    }

    setScannedResults((prev) => [...newScannedItems, ...prev]);
    setIsScanning(false);
    clearAllSelectedFiles();
    showToast(`Processed ${newScannedItems.length} image(s) via Google Document AI!`);
  };

  // Accept single item -> Save to Firebase Firestore
  const handleAcceptSingle = async (item: ScannedInvoiceItem) => {
    try {
      await saveInvoiceToFirebase(item);
      setScannedResults((prev) => prev.filter((i) => i.tempId !== item.tempId));
      showToast(`Invoice ${item.invoice_number || item.vendor_name} saved to Firebase Firestore!`);
    } catch (err: any) {
      alert(`Failed to save invoice to Firebase: ${err.message || err}`);
    }
  };

  // Accept All items
  const handleAcceptAll = async () => {
    if (scannedResults.length === 0) return;
    const count = scannedResults.length;
    let savedCount = 0;

    for (const item of scannedResults) {
      try {
        await saveInvoiceToFirebase(item);
        savedCount++;
      } catch (err) {
        console.error("Failed saving invoice during Accept All:", err);
      }
    }

    setScannedResults([]);
    showToast(`All ${savedCount} of ${count} invoices saved to Firebase Firestore!`);
  };

  // Reject single item
  const handleRejectSingle = (tempId: string) => {
    setScannedResults((prev) => prev.filter((i) => i.tempId !== tempId));
    showToast("Invoice item removed.");
  };

  // Save Edit Changes
  const handleSaveEdit = () => {
    if (!editingItem) return;
    setScannedResults((prev) =>
      prev.map((item) => (item.tempId === editingItem.tempId ? editingItem : item))
    );
    setEditingItem(null);
    showToast("Invoice details updated.");
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Main Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 fill-indigo-100" />
            Next Document AI Invoice Scan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            High-efficiency document OCR extraction for Raju Ghee Sweets & Firestore Sync
          </p>
        </div>
      </div>

      {/* Section 1: Browse Files Section (Images Only, Multiple) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            Select Invoice Images for Document AI
          </h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
            Multiple Images Supported (PNG, JPG, WEBP)
          </span>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={handleUploadClick}
          className="bg-slate-50 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all hover:bg-indigo-50/20 group relative"
        >
          {/* File Browser Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Camera Capture Input */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            Tap to Upload or Drag & Drop Invoices for Next Document AI
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Supports Camera photos, Gallery images, PNG, JPG, WEBP supplier bills
          </p>
        </div>

        {/* Mobile Upload Source Choice Modal / Bottom Sheet */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  Select Image Source
                </h4>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Take Photo with Camera */}
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setTimeout(() => cameraInputRef.current?.click(), 100);
                  }}
                  className="p-4 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-indigo-950">Take Photo</span>
                  <span className="text-[10px] text-indigo-700">Open Camera</span>
                </button>

                {/* Choose from Gallery / Files */}
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Photo Gallery</span>
                  <span className="text-[10px] text-slate-500">Browse Files</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Images Thumbnail Grid */}
        {filePreviews.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Selected Images ({filePreviews.length})
              </span>
              <button
                onClick={clearAllSelectedFiles}
                className="text-xs text-rose-600 hover:underline cursor-pointer font-medium"
              >
                Clear selection
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filePreviews.map((item, idx) => (
                <div
                  key={idx}
                  className="relative group border border-slate-200 rounded-xl p-2 bg-slate-50 hover:bg-white transition-all shadow-2xs"
                >
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <p className="text-[10px] font-medium text-slate-700 truncate mt-1.5" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSelectedFile(idx);
                    }}
                    className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Run Scan Job Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={runScanJob}
            disabled={selectedFiles.length === 0 || isScanning}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer ${
              selectedFiles.length > 0 && !isScanning
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-indigo-500/25"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>
                  DocAI Scanning {scanProgress.current} of {scanProgress.total}...
                </span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4 fill-white" />
                <span>Run Document AI Scan ({selectedFiles.length} Image{selectedFiles.length !== 1 ? "s" : ""})</span>
              </>
            )}
          </button>
        </div>

        {/* Live Progress Bar */}
        {isScanning && (
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-2 animate-in fade-in duration-200">
            <div className="flex justify-between text-xs font-semibold text-indigo-950">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                Google Document AI Processing: {scanProgress.currentFileName}
              </span>
              <span>
                {Math.round((scanProgress.current / scanProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Scanned Results List & Actions */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Top Header of Results */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              Document AI Scanned Invoices ({scannedResults.length})
            </h2>
            <p className="text-xs text-slate-500">
              Extracted via Google Document AI — Review, edit, and accept to save to Firebase
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {scannedResults.length > 0 && (
              <button
                onClick={handleAcceptAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1.5 cursor-pointer transition-all hover:shadow-emerald-600/20"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Accept All ({scannedResults.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {scannedResults.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Cpu className="w-12 h-12 mx-auto stroke-1 text-indigo-300" />
            <p className="text-sm font-semibold text-slate-600">No pending Document AI scans</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select invoice images above and click "Run Document AI Scan" for fast, cost-effective extraction.
            </p>
          </div>
        ) : (
          /* Scanned Items Cards */
          <div className="divide-y divide-slate-100">
            {scannedResults.map((item) => (
              <div
                key={item.tempId}
                className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Left Details */}
                <div className="flex items-start space-x-4 flex-1">
                  {item.imagePreviewUrl ? (
                    <img
                      src={item.imagePreviewUrl}
                      alt={item.fileName}
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer"
                      onClick={() => setViewingItem(item)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{item.vendor_name || "Unknown Vendor"}</span>
                      {item.gstin && (
                        <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          GSTIN: {item.gstin}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        DocAI
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>
                        Invoice #: <strong className="text-slate-800">{item.invoice_number || "N/A"}</strong>
                      </span>
                      <span>
                        Date: <strong className="text-slate-800">{item.invoice_date || "N/A"}</strong>
                      </span>
                      <span>
                        File: <span className="text-slate-600 italic">{item.fileName}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">Taxable: ₹{Number(item.taxable_amount).toLocaleString('en-IN')}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded">CGST: ₹{Number(item.cgst).toLocaleString('en-IN')}</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded">SGST: ₹{Number(item.sgst).toLocaleString('en-IN')}</span>
                      {Number(item.igst) > 0 && <span className="bg-slate-100 px-2 py-0.5 rounded">IGST: ₹{Number(item.igst).toLocaleString('en-IN')}</span>}
                      <span className="bg-indigo-50 text-indigo-800 font-semibold px-2 py-0.5 rounded">Total GST: ₹{Number(item.total_gst).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="lg:text-right px-2 py-1 bg-slate-50 lg:bg-transparent rounded-lg border border-slate-200/60 lg:border-none w-full lg:w-auto">
                  <div className="text-[11px] text-slate-400 font-medium">Grand Total</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    ₹{Number(item.grand_total).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setViewingItem(item)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="View Invoice Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                    title="Edit Extracted Details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleRejectSingle(item.tempId)}
                    className="p-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    title="Reject / Delete from list"
                  >
                    <X className="w-4.5 h-4.5 font-bold" />
                  </button>

                  <button
                    onClick={() => handleAcceptSingle(item)}
                    className="p-2 text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                    title="Accept & Save to Firebase"
                  >
                    <Check className="w-4.5 h-4.5 font-bold" />
                    <span className="text-xs font-bold hidden sm:inline px-0.5">Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT INVOICE MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" />
                Edit Document AI Scanned Invoice
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={editingItem.vendor_name}
                  onChange={(e) => setEditingItem({ ...editingItem, vendor_name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">GSTIN</label>
                <input
                  type="text"
                  value={editingItem.gstin}
                  onChange={(e) => setEditingItem({ ...editingItem, gstin: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={editingItem.invoice_number}
                  onChange={(e) => setEditingItem({ ...editingItem, invoice_number: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={editingItem.invoice_date}
                  onChange={(e) => setEditingItem({ ...editingItem, invoice_date: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">HSN Code</label>
                <input
                  type="text"
                  value={editingItem.hsn}
                  onChange={(e) => setEditingItem({ ...editingItem, hsn: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Taxable Amount (₹)</label>
                <input
                  type="number"
                  value={editingItem.taxable_amount}
                  onChange={(e) => {
                    const taxable = Number(e.target.value) || 0;
                    const cgst = editingItem.cgst;
                    const sgst = editingItem.sgst;
                    const igst = editingItem.igst;
                    const totalGst = cgst + sgst + igst;
                    setEditingItem({
                      ...editingItem,
                      taxable_amount: taxable,
                      total_gst: totalGst,
                      grand_total: taxable + totalGst,
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">CGST (₹)</label>
                <input
                  type="number"
                  value={editingItem.cgst}
                  onChange={(e) => {
                    const cgst = Number(e.target.value) || 0;
                    const totalGst = cgst + (editingItem.sgst || 0) + (editingItem.igst || 0);
                    setEditingItem({
                      ...editingItem,
                      cgst,
                      total_gst: totalGst,
                      grand_total: (editingItem.taxable_amount || 0) + totalGst,
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">SGST (₹)</label>
                <input
                  type="number"
                  value={editingItem.sgst}
                  onChange={(e) => {
                    const sgst = Number(e.target.value) || 0;
                    const totalGst = (editingItem.cgst || 0) + sgst + (editingItem.igst || 0);
                    setEditingItem({
                      ...editingItem,
                      sgst,
                      total_gst: totalGst,
                      grand_total: (editingItem.taxable_amount || 0) + totalGst,
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">IGST (₹)</label>
                <input
                  type="number"
                  value={editingItem.igst}
                  onChange={(e) => {
                    const igst = Number(e.target.value) || 0;
                    const totalGst = (editingItem.cgst || 0) + (editingItem.sgst || 0) + igst;
                    setEditingItem({
                      ...editingItem,
                      igst,
                      total_gst: totalGst,
                      grand_total: (editingItem.taxable_amount || 0) + totalGst,
                    });
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Grand Total (₹)</label>
                <input
                  type="number"
                  value={editingItem.grand_total}
                  onChange={(e) => setEditingItem({ ...editingItem, grand_total: Number(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 font-bold text-slate-900 bg-indigo-50/50"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW INVOICE DETAILS MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Document AI Invoice Details
              </h3>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Vendor Name</span>
                  <span className="font-bold text-slate-900 text-sm">{viewingItem.vendor_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">GSTIN</span>
                  <span className="font-mono font-semibold">{viewingItem.gstin || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Invoice #</span>
                  <span className="font-semibold">{viewingItem.invoice_number || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Invoice Date</span>
                  <span className="font-semibold">{viewingItem.invoice_date || "N/A"}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingItem.items && viewingItem.items.length > 0 ? (
                      viewingItem.items.map((it: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{it.name}</td>
                          <td className="p-2 text-right">{it.quantity}</td>
                          <td className="p-2 text-right">₹{it.rate}</td>
                          <td className="p-2 text-right font-semibold">₹{it.amount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-3 text-center text-slate-400">
                          Standard summary invoice (No itemized line breakdown)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="bg-indigo-50/60 p-3 rounded-xl space-y-1.5 text-right font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Amount:</span>
                  <span>₹{Number(viewingItem.taxable_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST + SGST:</span>
                  <span>₹{Number(viewingItem.total_gst).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-indigo-200/60 font-sans">
                  <span>Grand Total:</span>
                  <span className="text-indigo-900">₹{Number(viewingItem.grand_total).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
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
