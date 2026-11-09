"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import {
  calculateTotalInvestments,
  calculateTotalMonthlySIP,
} from "@/lib/utils/calculations";

const INVESTMENT_TYPES = [
  "Mutual Funds",
  "Direct Equity",
  "PPF/EPF",
  "NPS",
  "Fixed Deposits / Bonds",
  "Real Estate",
  "Gold / Sovereign Gold Bonds",
  "Cryptocurrency / Alternative",
  "Other",
];

const LINKED_GOAL_OPTIONS = [
  "Retirement",
  "Children's Higher Education",
  "Children's Marriage",
  "Home Purchase / Downpayment",
  "Emergency Reserve Fund",
  "Wealth Creation / Long Term",
  "Vacation / Travel",
  "Unallocated / Flexible",
];

export default function StepInvestments({
  investments = [],
  onAddInvestment,
  onRemoveInvestment,
  onUpdateInvestment,
}) {
  const totalValue = calculateTotalInvestments(investments);
  const totalMonthlySIP = calculateTotalMonthlySIP(investments);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Existing Investments & SIPs</h2>
          <p className="text-sm text-slate-500 mt-1">
            Log your active mutual funds, shares, PPF, and link them to goals.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddInvestment}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Investment</span>
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-8 px-4 border border-slate-200 rounded-xl bg-slate-50/60">
          <p className="text-sm text-slate-600 mb-2">No investments recorded yet.</p>
          <button
            type="button"
            onClick={onAddInvestment}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Click here to add mutual funds, stocks, or other investments</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table Header on Desktop */}
          <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            <span className="col-span-2">Type</span>
            <span className="col-span-3">Scheme / Name</span>
            <span className="col-span-2">Current Value (₹)</span>
            <span className="col-span-2">Monthly SIP (₹)</span>
            <span className="col-span-2">Linked Goal</span>
            <span className="col-span-1 text-right">Action</span>
          </div>

          {investments.map((inv, index) => (
            <div
              key={inv.id || index}
              className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              {/* Type */}
              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Type
                </label>
                <select
                  value={inv.type || "Mutual Funds"}
                  onChange={(e) => onUpdateInvestment(index, "type", e.target.value)}
                  className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  {INVESTMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="md:col-span-3">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Scheme / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flexi Cap Fund"
                  value={inv.name || ""}
                  onChange={(e) => onUpdateInvestment(index, "name", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Current Value */}
              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Value (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 150000"
                  value={inv.currentValue ?? ""}
                  onChange={(e) => onUpdateInvestment(index, "currentValue", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Monthly SIP */}
              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  SIP (₹/mo)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="e.g. 5000"
                  value={inv.monthlySIP ?? ""}
                  onChange={(e) => onUpdateInvestment(index, "monthlySIP", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Linked Goal */}
              <div className="md:col-span-2">
                <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                  Linked Goal
                </label>
                <select
                  value={inv.linkedGoal || "Unallocated / Flexible"}
                  onChange={(e) => onUpdateInvestment(index, "linkedGoal", e.target.value)}
                  className="w-full px-2 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
                >
                  {LINKED_GOAL_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action */}
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveInvestment(index)}
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
              onClick={onAddInvestment}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add another investment</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Portfolio Summary
          </span>
          <span className="text-sm font-semibold text-slate-800">
            Total Current Value: <strong className="text-slate-900">{formatINR(totalValue)}</strong>
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">Total Active Monthly SIP</span>
          <span className="text-lg font-bold text-blue-700">{formatINR(totalMonthlySIP)} / mo</span>
        </div>
      </div>
    </div>
  );
}
