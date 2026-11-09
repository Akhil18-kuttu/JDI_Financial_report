"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import { calculateTotalAssets } from "@/lib/utils/calculations";

const ASSET_TYPES = [
  "Savings Account",
  "Fixed Deposit (FD)",
  "PPF",
  "Mutual Funds",
  "Real Estate",
  "Gold",
  "EPF / PF",
  "Stocks",
  "Other",
];

export default function StepAssets({
  assets = [],
  onAddAsset,
  onRemoveAsset,
  onUpdateAsset,
}) {
  const totalAssets = calculateTotalAssets(assets);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assets & Holdings</h2>
          <p className="text-sm text-slate-500 mt-1">
            List your bank balances, deposits, real estate, gold, and other asset holdings.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddAsset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Asset</span>
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-8 px-4 border border-slate-200 rounded-xl bg-slate-50/60">
          <p className="text-sm text-slate-600 mb-2">No assets added yet.</p>
          <button
            type="button"
            onClick={onAddAsset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click here to add an asset</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header on Desktop */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <span className="col-span-3">Asset Type</span>
            <span className="col-span-4">Institution / Name</span>
            <span className="col-span-3">Current Value (₹)</span>
            <span className="col-span-1">Description</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {assets.map((asset, index) => (
            <div
              key={asset.id || index}
              className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              {/* Type */}
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Asset Type
                </label>
                <select
                  value={asset.type || "Savings Account"}
                  onChange={(e) => onUpdateAsset(index, "type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  {ASSET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Institution / Asset Name */}
              <div className="md:col-span-4">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Institution / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank / 2BHK Flat"
                  value={asset.institution || ""}
                  onChange={(e) => onUpdateAsset(index, "institution", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Current Value */}
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Current Value (₹)
                </label>
                <div className="relative flex rounded-md border border-slate-300 overflow-hidden focus-within:border-blue-500">
                  <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="e.g. 200000"
                    value={asset.currentValue ?? ""}
                    onChange={(e) => onUpdateAsset(index, "currentValue", e.target.value)}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-1">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Notes"
                  value={asset.description || ""}
                  onChange={(e) => onUpdateAsset(index, "description", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Action */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveAsset(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              onClick={onAddAsset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add another asset</span>
            </button>
          </div>
        </div>
      )}

      {/* Simple Total Assets Strip */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Calculated Total
          </span>
          <span className="text-sm font-semibold text-slate-800">Total Asset Value</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-slate-900">{formatINR(totalAssets)}</span>
          <span className="text-xs text-slate-400 block">{assets.length} items listed</span>
        </div>
      </div>
    </div>
  );
}
