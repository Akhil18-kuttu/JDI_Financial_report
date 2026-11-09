"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatINR } from "@/lib/utils/formatters";
import { calculateTotalMonthlyIncome } from "@/lib/utils/calculations";

export default function StepIncome({
  incomes = [],
  onAddIncome,
  onRemoveIncome,
  onUpdateIncome,
  errors,
}) {
  const totalMonthlyIncome = calculateTotalMonthlyIncome(incomes);

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Income Sources</h2>
          <p className="text-sm text-slate-500 mt-1">
            List your active and passive income. You can enter monthly or annual amounts.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddIncome}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Income</span>
        </button>
      </div>

      {errors?.incomes && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
          {errors.incomes.message || "Please add at least one source of income."}
        </div>
      )}

      {/* Income Items (Page / Table Type) */}
      <div className="space-y-3">
        {/* Table header for desktop */}
        <div className="hidden md:grid md:grid-cols-12 gap-3 px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          <span className="col-span-3">Income Type</span>
          <span className="col-span-2">Frequency</span>
          <span className="col-span-3">Amount (₹)</span>
          <span className="col-span-3">Description / Source</span>
          <span className="col-span-1 text-right">Action</span>
        </div>

        {incomes.map((item, index) => (
          <div
            key={item.id || index}
            className="p-3 bg-white border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
          >
            {/* Type */}
            <div className="md:col-span-3">
              <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                Type
              </label>
              <select
                value={item.type || "Salary"}
                onChange={(e) => onUpdateIncome(index, "type", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="Salary">Salary / Professional</option>
                <option value="Business">Business</option>
                <option value="Rental">Rental Income</option>
                <option value="Pension">Pension</option>
                <option value="Investments">Investments / Dividends</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Frequency */}
            <div className="md:col-span-2">
              <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                Frequency
              </label>
              <select
                value={item.frequency || "monthly"}
                onChange={(e) => onUpdateIncome(index, "frequency", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            {/* Amount */}
            <div className="md:col-span-3">
              <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                Amount (₹)
              </label>
              <div className="relative flex rounded-md border border-slate-300 overflow-hidden focus-within:border-blue-500">
                <span className="inline-flex items-center px-2.5 bg-slate-50 text-slate-500 text-xs font-semibold border-r border-slate-300">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 85000"
                  value={item.amount ?? ""}
                  onChange={(e) => onUpdateIncome(index, "amount", e.target.value)}
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-3">
              <label className="block md:hidden text-xs font-medium text-slate-600 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Primary job / Flat rent"
                value={item.description || ""}
                onChange={(e) => onUpdateIncome(index, "description", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Action */}
            <div className="md:col-span-1 flex justify-end">
              {incomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveIncome(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            type="button"
            onClick={onAddIncome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add another income source</span>
          </button>
        </div>
      </div>

      {/* Simple Calculated Total Bar (Page Type) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Calculated Total
          </span>
          <span className="text-sm font-semibold text-slate-800">Total Monthly Income</span>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-blue-700">{formatINR(totalMonthlyIncome)}</span>
          <span className="text-xs text-slate-400 block">
            ≈ {formatINR(totalMonthlyIncome * 12)} / year
          </span>
        </div>
      </div>
    </div>
  );
}
