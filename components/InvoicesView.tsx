"use client";

import React, { useState } from "react";
import {
  Tag,
  Clock,
  Search,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  LayoutGrid,
  Plus,
  Check,
  MoreHorizontal,
  FileSpreadsheet,
  Download,
  Upload,
} from "lucide-react";

export default function InvoicesView() {
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const productsData = [
    {
      id: "PROD-001",
      name: "The Family Visit Blueprint",
      iconBg: "bg-amber-500 text-white",
      status: "Active",
      inventory: "0 in stock",
      isOut: true,
      category: "Personal Care",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-002",
      name: "Baby Grooming Kit",
      iconBg: "bg-amber-700 text-white",
      status: "Active",
      inventory: "0 in stock",
      isOut: true,
      category: "Baby Health & Grooming Kits",
      channels: 2,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-003",
      name: "Baby First® Infant Heel Warmer",
      iconBg: "bg-cyan-500 text-white",
      status: "Active",
      inventory: "0 in stock",
      isOut: true,
      category: "Baby Health & Grooming Kits",
      channels: 3,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-004",
      name: "Essential Start Bundle",
      iconBg: "bg-pink-500 text-white",
      status: "Active",
      inventory: "78 in stock",
      isOut: false,
      category: "Bundles",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-005",
      name: "Complete Recovery System",
      iconBg: "bg-rose-500 text-white",
      status: "Active",
      inventory: "76 in stock",
      isOut: false,
      category: "Bundles",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-006",
      name: "Extended Care Bundle",
      iconBg: "bg-rose-400 text-white",
      status: "Active",
      inventory: "77 in stock",
      isOut: false,
      category: "Bundles",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-007",
      name: "Witch Hazel Care Foam",
      iconBg: "bg-emerald-500 text-white",
      status: "Active",
      inventory: "0 in stock",
      isOut: true,
      category: "Feminine Sanitary Supplies",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-008",
      name: "Witch Hazel Pad Liners",
      iconBg: "bg-pink-400 text-white",
      status: "Active",
      inventory: "0 in stock",
      isOut: true,
      category: "Feminine Wipes",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-009",
      name: "Postpartum Recovery Essentials Kit",
      iconBg: "bg-purple-500 text-white",
      status: "Active",
      inventory: "176 in stock",
      isOut: false,
      category: "Uncategorized",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
    {
      id: "PROD-010",
      name: "Ultra-Thin 2-in-1 Postpartum Ice Pads | Pack of 8",
      iconBg: "bg-blue-400 text-white",
      status: "Active",
      inventory: "0 in stock",
      isOut: true,
      category: "Ice Packs",
      channels: 9,
      catalogs: 3,
      productType: "",
      vendor: "Mommy First",
    },
  ];

  const toggleSelectAll = () => {
    if (selectedItems.length === productsData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(productsData.map((p) => p.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const filteredProducts = productsData.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 bg-[#f6f6f7] min-h-screen text-slate-800 font-sans">
      {/* Top Header: Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Products</h1>
        </div>

        <div className="flex items-center space-x-2">
          <button className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-colors">
            Export
          </button>
          <button className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer transition-colors">
            Import
          </button>
          <button className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors">
            <span>More actions</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button className="bg-[#1a1a1a] hover:bg-[#2d2d2d] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-xs cursor-pointer transition-colors">
            Add product
          </button>
        </div>
      </div>

      {/* Stats Metric Banner Box */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs divide-y md:divide-y-0 md:divide-x divide-slate-200 grid grid-cols-1 md:grid-cols-3">
        {/* Metric 1 */}
        <div className="p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center space-x-2 text-xs text-slate-700">
            <button className="border border-slate-300 rounded px-2 py-0.5 font-medium flex items-center space-x-1 hover:bg-slate-50 cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>30 days</span>
            </button>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 underline decoration-dotted cursor-pointer">
              Average sell-through rate
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              2.71% <span className="text-slate-400 font-normal">—</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 flex flex-col justify-between space-y-2">
          <div className="text-xs font-medium text-slate-600 underline decoration-dotted cursor-pointer">
            Products by days of inventory remaining
          </div>
          <div className="text-xs text-slate-500 py-1">No data</div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 flex flex-col justify-between space-y-2">
          <div className="text-xs font-medium text-slate-600 underline decoration-dotted cursor-pointer">
            ABC product analysis
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-800">
            <span className="underline underline-offset-4 decoration-blue-500 cursor-pointer">$0.00 A</span>
            <span className="underline underline-offset-4 decoration-purple-500 cursor-pointer">$0.00 B</span>
            <span className="underline underline-offset-4 decoration-cyan-500 cursor-pointer">$0.00 C</span>
          </div>
        </div>
      </div>

      {/* Main Table Card Box */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1 cursor-pointer">
              <span>All</span>
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center space-x-2 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search and filter"
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <button className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
              <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#fafafa] border-b border-slate-200 font-semibold text-slate-600 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === productsData.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Inventory</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Channels</th>
                <th className="py-2.5 px-3">Catalogs</th>
                <th className="py-2.5 px-3">Product type</th>
                <th className="py-2.5 px-3">Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const isSelected = selectedItems.includes(prod.id);

                return (
                  <tr
                    key={prod.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-slate-50" : ""
                    }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(prod.id)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Product Name with Icon Box matching image */}
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-lg ${prod.iconBg} flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
                      >
                        {prod.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="hover:underline cursor-pointer tracking-tight">
                        {prod.name}
                      </span>
                    </td>

                    {/* Status Active Green Pill */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#d1fadf] text-[#027a48]">
                        Active
                      </span>
                    </td>

                    {/* Inventory Red text if 0 */}
                    <td
                      className={`py-3 px-3 font-medium ${
                        prod.isOut ? "text-rose-700 font-semibold" : "text-slate-800"
                      }`}
                    >
                      {prod.inventory}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 text-slate-700">{prod.category}</td>

                    {/* Channels */}
                    <td className="py-3 px-3 text-slate-700 font-mono">{prod.channels}</td>

                    {/* Catalogs */}
                    <td className="py-3 px-3 text-slate-700 font-mono">{prod.catalogs}</td>

                    {/* Product type */}
                    <td className="py-3 px-3 text-slate-400">—</td>

                    {/* Vendor */}
                    <td className="py-3 px-3 text-slate-800 font-medium">{prod.vendor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
