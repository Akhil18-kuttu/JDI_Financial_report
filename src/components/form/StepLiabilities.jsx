"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import {
  calculateTotalLiabilities,
  calculateTotalAssets,
  calculateNetWorth,
} from "@/lib/utils/calculations";

const LIABILITY_TYPES = [
  "Home Loan",
  "Car/Vehicle Loan",
  "Personal Loan",
  "Gold Loan",
  "Credit Card",
  "Education Loan",
  "Other Loan",
];

export default function StepLiabilities({
  liabilities = [],
  assets = [],
  onAddLiability,
  onRemoveLiability,
  onUpdateLiability,
}) {
  const totalLiabilities = calculateTotalLiabilities(liabilities);
  const totalAssets = calculateTotalAssets(assets);
  const netWorth = calculateNetWorth(totalAssets, totalLiabilities);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Liabilities & Loans</h2>
          <p className="text-sm text-slate-500 mt-1">
            List your loans and credit commitments. Net worth is calculated automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddLiability}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Liability</span>
        </button>
      </div>

      {liabilities.length === 0 ? (
        <div className="text-center py-8 px-4 border border-slate-200 rounded-xl bg-slate-50/60">
          <p className="text-sm text-slate-600 mb-2">No loans or liabilities added.</p>
          <button
            type="button"
            onClick={onAddLiability}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click here to add a loan or credit liability</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header on Desktop */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <span className="col-span-3">Loan Type</span>
            <span className="col-span-3">Lender / Bank</span>
            <span className="col-span-3">Outstanding Amount (₹)</span>
            <span className="col-span-2">Monthly EMI (₹)</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {liabilities.map((loan, index) => (
            <div
              key={loan.id || index}
              className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              {/* Type */}
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Type
                </label>
                <select
                  value={loan.type || "Home Loan"}
                  onChange={(e) => onUpdateLiability(index, "type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  {LIABILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lender */}
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Lender / Bank
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBI / HDFC"
                  value={loan.lender || ""}
                  onChange={(e) => onUpdateLiability(index, "lender", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Outstanding Amount */}
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Outstanding Amount (₹)
                </label>
                <div className="relative flex rounded-md border border-slate-300 overflow-hidden focus-within:border-blue-500">
                  <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="e.g. 2500000"
                    value={loan.outstandingAmount ?? ""}
                    onChange={(e) => onUpdateLiability(index, "outstandingAmount", e.target.value)}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* EMI */}
              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Monthly EMI (₹)
                </label>
                <div className="relative flex rounded-md border border-slate-300 overflow-hidden focus-within:border-blue-500">
                  <span className="inline-flex items-center px-2 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    placeholder="e.g. 24000"
                    value={loan.emi ?? ""}
                    onChange={(e) => onUpdateLiability(index, "emi", e.target.value)}
                    className="w-full px-2.5 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveLiability(index)}
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
              onClick={onAddLiability}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add another liability</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary: Total Liabilities & Net Worth */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-500 block">Total Liabilities (Debt)</span>
            <span className="text-lg font-bold text-rose-600">{formatINR(totalLiabilities)}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Estimated Net Worth (Assets − Debt)</span>
            <span
              className={`text-lg font-bold ${
                netWorth >= 0 ? "text-slate-900" : "text-amber-700"
              }`}
            >
              {formatINR(netWorth)}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 border-t border-slate-200 pt-2">
          Calculated as Total Assets ({formatINR(totalAssets)}) minus Total Liabilities ({formatINR(totalLiabilities)}).
        </p>
      </div>
    </div>
  );
}
